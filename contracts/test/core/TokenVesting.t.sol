// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/TokenVesting.sol";
import "../../src/MockToken.sol";

contract TokenVestingTest is Test {
    TokenVesting public vesting;
    MockToken    public bdx;

    address public owner     = makeAddr("owner");
    address public team      = makeAddr("team");
    address public seed      = makeAddr("seed");
    address public ecosystem = makeAddr("ecosystem");
    address public alice     = makeAddr("alice");

    // Representative allocations
    uint256 constant TEAM_AMOUNT = 150_000_000 ether;
    uint256 constant SEED_AMOUNT = 40_000_000 ether;

    // Time constants
    uint256 constant YEAR  = 365 days;
    uint256 constant MONTH = 30 days;

    function setUp() public {
        bdx     = new MockToken("BDX", "BDX", 18);
        vesting = new TokenVesting(address(bdx), owner);

        // Mint tokens to owner for schedule funding
        bdx.mint(owner, 1_000_000_000 ether);
        vm.prank(owner);
        bdx.approve(address(vesting), type(uint256).max);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    function _createTeamSchedule() internal {
        vm.prank(owner);
        vesting.createVestingSchedule(
            team,
            block.timestamp,  // starts now
            YEAR,             // 12-month cliff
            3 * YEAR,         // 36-month linear
            TEAM_AMOUNT
        );
    }

    function _createSeedSchedule() internal {
        vm.prank(owner);
        vesting.createVestingSchedule(
            seed,
            block.timestamp,
            6 * MONTH,   // 6-month cliff
            18 * MONTH,  // 18-month linear
            SEED_AMOUNT
        );
    }

    // ── Create schedule ───────────────────────────────────────────────────────

    function testCreateSchedule_Basic() public {
        _createTeamSchedule();
        (address benef,,,, uint256 total, uint256 rel, bool rev, bool ex) = vesting.schedules(team);
        assertTrue(ex);
        assertEq(total, TEAM_AMOUNT);
        assertEq(rel, 0);
        assertFalse(rev);
        assertEq(benef, team);
        assertEq(vesting.totalLocked(), TEAM_AMOUNT);
    }

    function testCreateSchedule_TokensTransferred() public {
        uint256 before = bdx.balanceOf(address(vesting));
        _createTeamSchedule();
        assertEq(bdx.balanceOf(address(vesting)), before + TEAM_AMOUNT);
    }

    function testCreateSchedule_DuplicateReverts() public {
        _createTeamSchedule();
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(TokenVesting.ScheduleAlreadyExists.selector, team));
        vesting.createVestingSchedule(team, block.timestamp, YEAR, 3 * YEAR, 1 ether);
    }

    function testCreateSchedule_ZeroAmount_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(TokenVesting.ZeroAmount.selector);
        vesting.createVestingSchedule(team, block.timestamp, YEAR, YEAR, 0);
    }

    function testCreateSchedule_ZeroAddress_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(TokenVesting.ZeroAddress.selector);
        vesting.createVestingSchedule(address(0), block.timestamp, YEAR, YEAR, 1 ether);
    }

    function testCreateSchedule_ZeroDuration_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(TokenVesting.InvalidDuration.selector);
        vesting.createVestingSchedule(team, block.timestamp, YEAR, 0, 1 ether);
    }

    function testCreateSchedule_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        vesting.createVestingSchedule(team, block.timestamp, YEAR, YEAR, 1 ether);
    }

    // ── Before cliff ──────────────────────────────────────────────────────────

    function testVested_BeforeCliff_IsZero() public {
        _createTeamSchedule();
        assertEq(vesting.getVestedAmount(team), 0);
    }

    function testReleasable_BeforeCliff_IsZero() public {
        _createTeamSchedule();
        assertEq(vesting.computeReleasableAmount(team), 0);
    }

    function testRelease_BeforeCliff_Reverts() public {
        _createTeamSchedule();
        vm.prank(team);
        vm.expectRevert(TokenVesting.NothingToRelease.selector);
        vesting.release(team);
    }

    function testRelease_JustBeforeCliff_Reverts() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR - 1); // 1 second before cliff
        vm.prank(team);
        vm.expectRevert(TokenVesting.NothingToRelease.selector);
        vesting.release(team);
    }

    // ── At and after cliff ────────────────────────────────────────────────────

    function testVested_AtCliffEnd_IsZero() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR); // exactly at cliff end
        // elapsed = 0, so vested = totalAmount * 0 / duration = 0
        assertEq(vesting.getVestedAmount(team), 0);
    }

    function testVested_OneMonthAfterCliff() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + MONTH);
        uint256 vested = vesting.getVestedAmount(team);
        // elapsed = 1 month, duration = 36 months → 1/36 of total
        uint256 expected = TEAM_AMOUNT * MONTH / (3 * YEAR);
        assertApproxEqRel(vested, expected, 0.001e18); // 0.1% tolerance
    }

    function testVested_HalfwayThrough() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + (3 * YEAR / 2)); // cliff + half of duration
        uint256 vested = vesting.getVestedAmount(team);
        assertApproxEqRel(vested, TEAM_AMOUNT / 2, 0.001e18);
    }

    function testVested_AfterFullDuration_IsTotal() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + 3 * YEAR + 1);
        assertEq(vesting.getVestedAmount(team), TEAM_AMOUNT);
    }

    // ── Release / claim ───────────────────────────────────────────────────────

    function testRelease_AfterCliff_Success() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + MONTH); // 1 month after cliff

        uint256 releasable = vesting.computeReleasableAmount(team);
        assertGt(releasable, 0);

        uint256 balBefore = bdx.balanceOf(team);
        vm.prank(team);
        vesting.release(team);

        assertEq(bdx.balanceOf(team), balBefore + releasable);
        (,,,, , uint256 rel1,,) = vesting.schedules(team);
        assertEq(rel1, releasable);
    }

    function testRelease_FullAmount_AfterDuration() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + 3 * YEAR + 1);

        vm.prank(team);
        vesting.release(team);

        assertEq(bdx.balanceOf(team), TEAM_AMOUNT);
        (,,,, , uint256 rel2,,) = vesting.schedules(team);
        assertEq(rel2, TEAM_AMOUNT);
    }

    function testRelease_MultiplePartialClaims() public {
        _createTeamSchedule();
        uint256 start = block.timestamp;

        // Claim at 1 month after cliff
        vm.warp(start + YEAR + MONTH);
        vm.prank(team);
        vesting.release(team);
        uint256 firstClaim = bdx.balanceOf(team);

        // Claim again at 6 months after cliff
        vm.warp(start + YEAR + 6 * MONTH);
        vm.prank(team);
        vesting.release(team);
        uint256 secondClaim = bdx.balanceOf(team) - firstClaim;

        assertGt(secondClaim, 0);
        assertGt(secondClaim, firstClaim); // more time passed = more tokens
    }

    function testRelease_OwnerCanReleaseOnBehalfOf() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + MONTH);

        // Owner calls release for team
        vm.prank(owner);
        vesting.release(team);

        // Tokens go to team, not owner
        assertGt(bdx.balanceOf(team), 0);
        assertEq(bdx.balanceOf(owner), 1_000_000_000 ether - TEAM_AMOUNT); // owner spent TEAM_AMOUNT
    }

    function testRelease_NothingAfterClaiming() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + MONTH);

        vm.prank(team);
        vesting.release(team);

        // Try to claim again immediately
        vm.prank(team);
        vm.expectRevert(TokenVesting.NothingToRelease.selector);
        vesting.release(team);
    }

    function testRelease_NoBeneficiary_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(TokenVesting.ScheduleNotFound.selector, alice));
        vesting.release(alice);
    }

    // ── Revoke ────────────────────────────────────────────────────────────────

    function testRevoke_BeforeCliff_ReturnsAll() public {
        _createTeamSchedule();
        // Revoke before cliff — nothing vested, all returns to owner
        uint256 ownerBalBefore = bdx.balanceOf(owner);

        vm.prank(owner);
        vesting.revoke(team);

        (,,,,,,bool rev1,) = vesting.schedules(team);
        assertTrue(rev1);
        // All unvested tokens returned to owner
        assertApproxEqAbs(bdx.balanceOf(owner), ownerBalBefore + TEAM_AMOUNT, 1);
    }

    function testRevoke_AfterPartialVesting_ReturnsUnvested() public {
        _createTeamSchedule();
        uint256 start = block.timestamp;
        vm.warp(start + YEAR + MONTH); // 1 month after cliff

        uint256 vestedBefore = vesting.getVestedAmount(team);
        uint256 ownerBalBefore = bdx.balanceOf(owner);

        vm.prank(owner);
        vesting.revoke(team);

        uint256 unvested = TEAM_AMOUNT - vestedBefore;
        assertApproxEqAbs(bdx.balanceOf(owner), ownerBalBefore + unvested, 1);
    }

    function testRevoke_BeneficiaryCanStillClaimVestedPortion() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + MONTH);

        uint256 vestedAmount = vesting.getVestedAmount(team);

        vm.prank(owner);
        vesting.revoke(team);

        // Beneficiary still claims the vested portion
        vm.prank(team);
        vesting.release(team);

        assertApproxEqAbs(bdx.balanceOf(team), vestedAmount, 1);
    }

    function testRevoke_CannotRevokeAgain() public {
        _createTeamSchedule();
        vm.prank(owner);
        vesting.revoke(team);

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(TokenVesting.ScheduleAlreadyRevoked.selector, team));
        vesting.revoke(team);
    }

    function testRevoke_NoSchedule_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(TokenVesting.ScheduleNotFound.selector, alice));
        vesting.revoke(alice);
    }

    function testRevoke_OnlyOwner() public {
        _createTeamSchedule();
        vm.prank(alice);
        vm.expectRevert();
        vesting.revoke(team);
    }

    // ── getScheduleInfo ───────────────────────────────────────────────────────

    function testGetScheduleInfo_BeforeCliff() public {
        _createTeamSchedule();
        (
            uint256 totalAmount, , , uint256 vested, uint256 unvested,
            uint256 cliffEnd, , , bool cliffPassed, uint256 progressBps
        ) = vesting.getScheduleInfo(team);

        assertEq(totalAmount, TEAM_AMOUNT);
        assertEq(vested, 0);
        assertEq(unvested, TEAM_AMOUNT);
        assertEq(cliffEnd, block.timestamp + YEAR);
        assertFalse(cliffPassed);
        assertEq(progressBps, 0);
    }

    function testGetScheduleInfo_AfterHalf() public {
        _createTeamSchedule();
        vm.warp(block.timestamp + YEAR + (3 * YEAR / 2));
        (
            uint256 totalAmount, , uint256 releasable, uint256 vested, ,
            , , , bool cliffPassed, uint256 progressBps
        ) = vesting.getScheduleInfo(team);

        assertEq(totalAmount, TEAM_AMOUNT);
        assertTrue(cliffPassed);
        assertApproxEqRel(vested, TEAM_AMOUNT / 2, 0.001e18);
        assertApproxEqRel(releasable, TEAM_AMOUNT / 2, 0.001e18);
        assertApproxEqAbs(progressBps, 5000, 10); // ~50%
    }

    function testGetScheduleInfo_NoSchedule_ReturnsZero() public view {
        (uint256 total, , , , , , , , ,) = vesting.getScheduleInfo(alice);
        assertEq(total, 0);
    }

    // ── Multiple beneficiaries ────────────────────────────────────────────────

    function testMultipleBeneficiaries() public {
        _createTeamSchedule();
        _createSeedSchedule();

        assertEq(vesting.beneficiaryCount(), 2);
        assertEq(vesting.totalLocked(), TEAM_AMOUNT + SEED_AMOUNT);
    }

    function testMultipleBeneficiaries_IndependentSchedules() public {
        _createTeamSchedule();
        _createSeedSchedule();
        uint256 start = block.timestamp;

        // Advance past seed cliff (6 months) but not team cliff (12 months)
        vm.warp(start + 7 * MONTH);

        assertEq(vesting.getVestedAmount(team), 0);      // team still in cliff
        assertGt(vesting.getVestedAmount(seed), 0);      // seed cliff passed
    }

    function testTotalLocked_UpdatesOnRelease() public {
        _createTeamSchedule();
        uint256 start = block.timestamp;
        vm.warp(start + YEAR + MONTH);

        uint256 releasable = vesting.computeReleasableAmount(team);
        uint256 lockedBefore = vesting.totalLocked();

        vm.prank(team);
        vesting.release(team);

        assertEq(vesting.totalLocked(), lockedBefore - releasable);
    }

    // ── Future start time ─────────────────────────────────────────────────────

    function testFutureStartTime() public {
        uint256 futureStart = block.timestamp + 30 days;

        vm.prank(owner);
        vesting.createVestingSchedule(team, futureStart, YEAR, 3 * YEAR, TEAM_AMOUNT);

        // Even after 1 year from now, cliff hasn't started yet
        vm.warp(block.timestamp + YEAR);
        assertEq(vesting.getVestedAmount(team), 0); // start + cliff not reached

        // Now advance past start + cliff
        vm.warp(futureStart + YEAR + MONTH);
        assertGt(vesting.getVestedAmount(team), 0);
    }

    // ── Zero cliff ────────────────────────────────────────────────────────────

    function testZeroCliff_VestsImmediately() public {
        vm.prank(owner);
        vesting.createVestingSchedule(team, block.timestamp, 0, YEAR, TEAM_AMOUNT);

        // Advance 6 months — half vested immediately (no cliff)
        vm.warp(block.timestamp + 182 days);
        uint256 vested = vesting.getVestedAmount(team);
        assertApproxEqRel(vested, TEAM_AMOUNT / 2, 0.01e18); // 1% tolerance for day rounding
    }
}
