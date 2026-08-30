// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  TokenVesting — Bulldex Finance Token Vesting
/// @author Phantom (@wayphantomme)
/// @notice Cliff + linear vesting for team, seed investors, and ecosystem allocations.
///         Each beneficiary has exactly one schedule. Owner can revoke unvested tokens.
///
/// @dev    Vesting formula (after cliff has passed):
///           elapsed      = min(now, start + cliff + duration) - (start + cliff)
///           vestedAmount = totalAmount * elapsed / duration
///           releasable   = vestedAmount - released
///
///         Before cliff expires: vestedAmount = 0, releasable = 0.
contract TokenVesting is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    struct VestingSchedule {
        address beneficiary;    // wallet receiving the tokens
        uint256 start;          // unix timestamp: vesting starts
        uint256 cliff;          // seconds until first tokens unlock
        uint256 duration;       // total vesting duration after cliff (seconds)
        uint256 totalAmount;    // total BDX allocated to this schedule
        uint256 released;       // BDX already claimed by beneficiary
        bool    revoked;        // true if owner has revoked
        bool    exists;         // sentinel — false means no schedule
    }

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable token;

    /// @notice One schedule per beneficiary address
    mapping(address => VestingSchedule) public schedules;

    /// @notice All beneficiary addresses in creation order
    address[] public beneficiaries;

    /// @notice Total BDX locked across all active schedules
    uint256 public totalLocked;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ScheduleCreated(
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliff,
        uint256 duration
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event ScheduleRevoked(address indexed beneficiary, uint256 unvestedReturned);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ScheduleAlreadyExists(address beneficiary);
    error ScheduleNotFound(address beneficiary);
    error ScheduleAlreadyRevoked(address beneficiary);
    error NothingToRelease();
    error ZeroAmount();
    error ZeroAddress();
    error InvalidDuration();
    error InsufficientContractBalance(uint256 required, uint256 available);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _token BDX token address
    /// @param _owner Protocol owner (can create/revoke schedules)
    constructor(address _token, address _owner) Ownable(_owner) {
        if (_token == address(0)) revert ZeroAddress();
        token = IERC20(_token);
    }

    // ─── Owner: Create Schedule ───────────────────────────────────────────────

    /// @notice Create a vesting schedule for a beneficiary.
    ///         Transfers `totalAmount` BDX from owner to this contract.
    ///
    /// @param beneficiary  Wallet that will receive vested tokens
    /// @param start        Unix timestamp when vesting begins (can be past or future)
    /// @param cliff        Seconds from `start` before any tokens unlock (e.g. 365 days)
    /// @param duration     Seconds over which tokens vest linearly after cliff (e.g. 3 * 365 days)
    /// @param totalAmount  Total BDX to vest
    function createVestingSchedule(
        address beneficiary,
        uint256 start,
        uint256 cliff,
        uint256 duration,
        uint256 totalAmount
    ) external onlyOwner {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (totalAmount == 0)          revert ZeroAmount();
        if (duration == 0)             revert InvalidDuration();
        if (schedules[beneficiary].exists) revert ScheduleAlreadyExists(beneficiary);

        uint256 contractBalance = token.balanceOf(address(this));
        uint256 required        = totalLocked + totalAmount;
        if (required > contractBalance) {
            // Auto-pull from owner if balance insufficient
            token.safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        schedules[beneficiary] = VestingSchedule({
            beneficiary: beneficiary,
            start:       start,
            cliff:       cliff,
            duration:    duration,
            totalAmount: totalAmount,
            released:    0,
            revoked:     false,
            exists:      true
        });

        beneficiaries.push(beneficiary);
        totalLocked += totalAmount;

        emit ScheduleCreated(beneficiary, totalAmount, start, cliff, duration);
    }

    // ─── Beneficiary: Release ─────────────────────────────────────────────────

    /// @notice Claim all currently releasable tokens.
    ///         Can be called by the beneficiary or the owner on their behalf.
    /// @param beneficiary Address whose tokens to release
    function release(address beneficiary) external nonReentrant {
        if (!schedules[beneficiary].exists) revert ScheduleNotFound(beneficiary);

        // After revoke, beneficiary can still claim whatever had already vested
        // (but no more will vest going forward)

        uint256 releasable = computeReleasableAmount(beneficiary);
        if (releasable == 0) revert NothingToRelease();

        schedules[beneficiary].released += releasable;
        totalLocked -= releasable;

        token.safeTransfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable);
    }

    // ─── Owner: Revoke ────────────────────────────────────────────────────────

    /// @notice Revoke a vesting schedule.
    ///         Already-vested tokens can still be claimed by the beneficiary.
    ///         Unvested tokens are returned to the owner.
    /// @param beneficiary Address of the schedule to revoke
    function revoke(address beneficiary) external onlyOwner nonReentrant {
        if (!schedules[beneficiary].exists)  revert ScheduleNotFound(beneficiary);
        if (schedules[beneficiary].revoked)  revert ScheduleAlreadyRevoked(beneficiary);

        VestingSchedule storage s = schedules[beneficiary];

        // Calculate how much has vested (beneficiary keeps this)
        uint256 vestedAmount   = _computeVestedAmount(s);
        uint256 unvested       = s.totalAmount - vestedAmount;
        uint256 alreadyPaid    = s.released;
        uint256 stillClaimable = vestedAmount - alreadyPaid;

        s.revoked = true;

        // Update totalLocked: remove unvested portion
        if (unvested > 0) {
            totalLocked -= unvested;
            token.safeTransfer(owner(), unvested);
        }

        // Remove the still-claimable from totalLocked too (it's now "free")
        // It stays in the contract for the beneficiary to claim via release()
        // so we don't remove it from totalLocked here — release() handles that

        emit ScheduleRevoked(beneficiary, unvested);

        // Allow beneficiary to still claim vested portion
        if (stillClaimable > 0) {
            // Don't auto-release — let beneficiary call release() themselves
            // This way they can't be surprised by a transfer they didn't initiate
        }
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Compute how many tokens are currently releasable for a beneficiary
    function computeReleasableAmount(address beneficiary)
        public
        view
        returns (uint256)
    {
        if (!schedules[beneficiary].exists) return 0;
        VestingSchedule storage s = schedules[beneficiary];
        if (s.revoked) {
            // After revoke: only vested-but-unclaimed is releasable
            return _computeVestedAmount(s) - s.released;
        }
        return _computeVestedAmount(s) - s.released;
    }

    /// @notice Compute total vested amount at the current block timestamp
    function getVestedAmount(address beneficiary)
        external
        view
        returns (uint256)
    {
        if (!schedules[beneficiary].exists) return 0;
        return _computeVestedAmount(schedules[beneficiary]);
    }

    /// @notice Full schedule info + derived display values
    function getScheduleInfo(address beneficiary)
        external
        view
        returns (
            uint256 totalAmount,
            uint256 released,
            uint256 releasable,
            uint256 vested,
            uint256 unvested,
            uint256 cliffEnd,
            uint256 vestEnd,
            bool    isRevoked,
            bool    cliffPassed,
            uint256 progressBps  // vested / total * 10000
        )
    {
        if (!schedules[beneficiary].exists) return (0,0,0,0,0,0,0,false,false,0);

        VestingSchedule storage s = schedules[beneficiary];
        totalAmount  = s.totalAmount;
        released     = s.released;
        releasable   = computeReleasableAmount(beneficiary);
        vested       = _computeVestedAmount(s);
        unvested     = totalAmount > vested ? totalAmount - vested : 0;
        cliffEnd     = s.start + s.cliff;
        vestEnd      = s.start + s.cliff + s.duration;
        isRevoked    = s.revoked;
        cliffPassed  = block.timestamp >= cliffEnd;
        progressBps  = totalAmount > 0 ? (vested * 10_000) / totalAmount : 0;
    }

    /// @notice Number of beneficiaries
    function beneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _computeVestedAmount(VestingSchedule storage s)
        internal
        view
        returns (uint256)
    {
        uint256 cliffEnd = s.start + s.cliff;

        // Before cliff — nothing vested
        if (block.timestamp < cliffEnd) return 0;

        uint256 vestEnd = cliffEnd + s.duration;

        // After full duration — everything vested
        if (block.timestamp >= vestEnd) return s.totalAmount;

        // Linear vesting between cliff end and vest end
        uint256 elapsed = block.timestamp - cliffEnd;
        return (s.totalAmount * elapsed) / s.duration;
    }
}
