// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/// @title  BDXGovernor — Bulldex Finance On-chain DAO Governance
/// @author Phantom (@wayphantomme)
/// @notice OpenZeppelin Governor contract that allows BDX holders to propose,
///         vote on, and execute protocol parameter changes, treasury allocations,
///         and contract upgrades through a time-locked DAO.
///
///         Flow:
///         1. Propose  — holder with ≥ 10,000 BDX creates a proposal
///         2. Delay    — 7200 blocks (~1 day) before voting opens
///         3. Vote     — 50400 blocks (~1 week) voting window
///         4. Queue    — succeeded proposals enter TimelockController (2-day delay)
///         5. Execute  — after timelock delay, anyone can execute
///
///         Voting power requires delegation — holders must call
///         bdxToken.delegate(address) before voting. Self-delegation counts.
contract BDXGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _token    BDX token with ERC20Votes support
    /// @param _timelock Deployed TimelockController address
    constructor(IVotes _token, TimelockController _timelock)
        Governor("BDX DAO")
        GovernorSettings(
            7200,   // votingDelay:  ~1 day  (7200 blocks × 12s)
            50400,  // votingPeriod: ~1 week (50400 blocks × 12s)
            10_000e18 // proposalThreshold: 10,000 BDX
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% of total supply
        GovernorTimelockControl(_timelock)
    {}

    // ─── Required overrides ───────────────────────────────────────────────────

    /// @inheritdoc IGovernor
    function votingDelay()
        public view override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    /// @inheritdoc IGovernor
    function votingPeriod()
        public view override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    /// @inheritdoc Governor
    function quorum(uint256 blockNumber)
        public view override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    /// @inheritdoc IGovernor
    function proposalThreshold()
        public view override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /// @inheritdoc Governor
    function state(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /// @inheritdoc Governor
    function proposalNeedsQueuing(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    /// @inheritdoc Governor
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /// @inheritdoc Governor
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /// @inheritdoc Governor
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /// @inheritdoc Governor
    function _executor()
        internal view override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
