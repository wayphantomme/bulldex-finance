// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/Staking.sol";
import "../../src/MockToken.sol";

contract StakingTest is Test {
    Staking    public staking;
    MockToken  public bdx;

    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob   = makeAddr("bob");
    address public carol = makeAddr("carol");

    uint256 constant REWARD_BUDGET = 100_000 ether;
    uint256 constant WEEK          = 7 days;

    function setUp() public {
        bdx = new MockToken("BDX", "BDX", 18);

        // Deploy staking with same token for stake + reward
        staking = new Staking(address(bdx), address(bdx), owner);

        // Mint user balances
        bdx.mint(alice, 1_000_000 ether);
        bdx.mint(bob,   1_000_000 ether);
        bdx.mint(carol, 1_000_000 ether);

        // Approve staking contract
        vm.prank(alice); bdx.approve(address(staking), type(uint256).max);
        vm.prank(bob);   bdx.approve(address(staking), type(uint256).max);
        vm.prank(carol); bdx.approve(address(staking), type(uint256).max);

        // Fund owner with reward budget and approve
        bdx.mint(owner, REWARD_BUDGET * 10);
        vm.prank(owner); bdx.approve(address(staking), type(uint256).max);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    function _notifyRewards(uint256 amount) internal {
        vm.prank(owner);
        staking.notifyRewardAmount(amount);
    }

    // ─── Basic Stake / Unstake ────────────────────────────────────────────────

    function testStakeNoLock() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        (uint256 amount, , , uint256 mult, , bool isLocked) = staking.getStakeInfo(alice);
        assertEq(amount, 1000 ether);
        assertEq(mult, 1e18); // 1× multiplier
        assertFalse(isLocked);
        assertEq(staking.totalEffectiveStake(), 1000 ether);
    }

    function testStakeLock30Days() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 30);

        (uint256 amount, uint256 lockEnd, uint256 lockDays, uint256 mult, , bool isLocked) =
            staking.getStakeInfo(alice);

        assertEq(amount, 1000 ether);
        assertEq(lockDays, 30);
        assertEq(mult, 1.2e18);
        assertTrue(isLocked);
        assertGt(lockEnd, block.timestamp);
        // effectiveStake = 1000 × 1.2 = 1200
        assertEq(staking.totalEffectiveStake(), 1200 ether);
    }

    function testStakeLock90Days() public {
        vm.prank(alice);
        staking.stake(1000 ether, 90);

        (, , , uint256 mult, ,) = staking.getStakeInfo(alice);
        assertEq(mult, 1.5e18);
        assertEq(staking.totalEffectiveStake(), 1500 ether);
    }

    function testStakeLock180Days() public {
        vm.prank(alice);
        staking.stake(1000 ether, 180);

        (, , , uint256 mult, ,) = staking.getStakeInfo(alice);
        assertEq(mult, 2e18);
        assertEq(staking.totalEffectiveStake(), 2000 ether);
    }

    function testInvalidLockDays() public {
        vm.prank(alice);
        vm.expectRevert(Staking.InvalidLockDays.selector);
        staking.stake(1000 ether, 45); // 45 is not valid
    }

    function testUnstakeNoLock() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        uint256 balBefore = bdx.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1000 ether);

        assertEq(bdx.balanceOf(alice), balBefore + 1000 ether);
        assertEq(staking.totalEffectiveStake(), 0);
    }

    function testUnstakeBeforeLockExpiry_Reverts() public {
        vm.prank(alice);
        staking.stake(1000 ether, 30);

        // Try to unstake immediately — should revert
        vm.prank(alice);
        vm.expectRevert(); // StillLocked
        staking.unstake(1000 ether);
    }

    function testUnstakeAfterLockExpiry() public {
        vm.prank(alice);
        staking.stake(1000 ether, 30);

        // Advance past lock period
        vm.warp(block.timestamp + 31 days);

        uint256 balBefore = bdx.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1000 ether);

        assertEq(bdx.balanceOf(alice), balBefore + 1000 ether);
    }

    function testStakeZeroAmount_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(Staking.ZeroAmount.selector);
        staking.stake(0, 0);
    }

    // ─── Rewards ──────────────────────────────────────────────────────────────

    function testEarnedAfterHalfPeriod() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        // Advance half the reward period
        vm.warp(block.timestamp + WEEK / 2);

        uint256 earnedAmt = staking.earned(alice);
        // Should be ~50% of REWARD_BUDGET (only staker, full period is 7 days)
        assertGt(earnedAmt, 0);
        assertApproxEqRel(earnedAmt, REWARD_BUDGET / 2, 0.001e18); // 0.1% tolerance
    }

    function testClaimRewards() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        vm.warp(block.timestamp + WEEK);

        uint256 balBefore = bdx.balanceOf(alice);

        vm.prank(alice);
        staking.claimRewards();

        uint256 claimed = bdx.balanceOf(alice) - balBefore;
        assertGt(claimed, 0);
        assertApproxEqRel(claimed, REWARD_BUDGET, 0.001e18);
    }

    function testClaimWithNothingEarned_Reverts() public {
        _notifyRewards(REWARD_BUDGET);

        // Alice stakes but doesn't wait
        vm.prank(alice);
        staking.stake(1000 ether, 0);

        // No time passes — earned ≈ 0
        vm.prank(alice);
        vm.expectRevert(Staking.NothingToClaim.selector);
        staking.claimRewards();
    }

    function testClaimWithoutStaking_Reverts() public {
        _notifyRewards(REWARD_BUDGET);
        vm.warp(block.timestamp + WEEK);

        vm.prank(alice);
        vm.expectRevert(Staking.NothingToClaim.selector);
        staking.claimRewards();
    }

    // ─── Lock Multiplier Reward Boost ─────────────────────────────────────────

    function testLockedUserEarnsMoreThanUnlocked() public {
        _notifyRewards(REWARD_BUDGET);

        // Alice stakes 1000 BDX with no lock (1×)
        vm.prank(alice);
        staking.stake(1000 ether, 0);

        // Bob stakes 1000 BDX with 180-day lock (2×)
        vm.prank(bob);
        staking.stake(1000 ether, 180);

        // Advance full period
        vm.warp(block.timestamp + WEEK);

        uint256 aliceEarned = staking.earned(alice);
        uint256 bobEarned   = staking.earned(bob);

        // Bob should earn ~2× what Alice earns
        // totalEffectiveStake = 1000 + 2000 = 3000
        // Alice share = 1000/3000 = 33.3%
        // Bob   share = 2000/3000 = 66.7%
        assertGt(bobEarned, aliceEarned);
        assertApproxEqRel(bobEarned, aliceEarned * 2, 0.001e18);
    }

    function testTwoStakersProportionalRewards() public {
        _notifyRewards(REWARD_BUDGET);

        // Both no lock, equal stake
        vm.prank(alice);
        staking.stake(1000 ether, 0);
        vm.prank(bob);
        staking.stake(1000 ether, 0);

        vm.warp(block.timestamp + WEEK);

        uint256 aliceEarned = staking.earned(alice);
        uint256 bobEarned   = staking.earned(bob);

        // Should be equal (50/50 split)
        assertApproxEqRel(aliceEarned, bobEarned, 0.001e18);
        assertApproxEqRel(aliceEarned + bobEarned, REWARD_BUDGET, 0.001e18);
    }

    function testNoRewardsBeforeNotify() public {
        // Stake without any reward period funded
        vm.prank(alice);
        staking.stake(1000 ether, 0);

        vm.warp(block.timestamp + WEEK);

        assertEq(staking.earned(alice), 0);
    }

    function testRewardsStopAfterPeriodFinish() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        // Advance beyond period
        vm.warp(block.timestamp + WEEK * 2);

        uint256 earnedAt2Weeks = staking.earned(alice);

        // Advance another week — should not accrue more
        vm.warp(block.timestamp + WEEK);
        uint256 earnedAt3Weeks = staking.earned(alice);

        assertApproxEqRel(earnedAt2Weeks, earnedAt3Weeks, 0.001e18);
    }

    // ─── notifyRewardAmount ───────────────────────────────────────────────────

    function testNotifyRewardAmount_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        staking.notifyRewardAmount(REWARD_BUDGET);
    }

    function testNotifyRollsOverRemainder() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        // Advance half period, then add more rewards
        vm.warp(block.timestamp + WEEK / 2);

        // Notify again — remaining rewards + new amount rolled over
        _notifyRewards(REWARD_BUDGET);

        uint256 newRate = staking.rewardRate();
        // New rate should be higher than before (leftover + new budget)
        assertGt(newRate, REWARD_BUDGET / WEEK);
    }

    function testSetRewardsDuration_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.setRewardsDuration(14 days);
    }

    function testSetRewardsDuration_CannotDuringActivePeriod() public {
        _notifyRewards(REWARD_BUDGET);
        vm.prank(owner);
        vm.expectRevert(Staking.PeriodNotFinished.selector);
        staking.setRewardsDuration(14 days);
    }

    function testSetRewardsDuration_AfterPeriod() public {
        _notifyRewards(REWARD_BUDGET);
        vm.warp(block.timestamp + WEEK + 1);

        vm.prank(owner);
        staking.setRewardsDuration(14 days);
        assertEq(staking.rewardsDuration(), 14 days);
    }

    // ─── Emergency Withdraw ───────────────────────────────────────────────────

    function testEmergencyWithdraw_BypassesLock() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 180);

        uint256 balBefore = bdx.balanceOf(alice);

        // Should work even though lock hasn't expired
        vm.prank(alice);
        staking.emergencyWithdraw();

        assertEq(bdx.balanceOf(alice), balBefore + 1000 ether);
        assertEq(staking.totalEffectiveStake(), 0);

        // Pending rewards should be forfeited
        (uint256 amount, , , , uint256 pending,) = staking.getStakeInfo(alice);
        assertEq(amount, 0);
        assertEq(pending, 0);
    }

    function testEmergencyWithdraw_NothingStaked_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(Staking.NothingStaked.selector);
        staking.emergencyWithdraw();
    }

    // ─── getStakeInfo / estimatedAPR ─────────────────────────────────────────

    function testGetStakeInfo_NoStake() public view {
        (uint256 amount, uint256 lockEnd, uint256 lockDays, uint256 mult, uint256 pending, bool isLocked) =
            staking.getStakeInfo(alice);
        assertEq(amount, 0);
        assertEq(lockEnd, 0);
        assertEq(lockDays, 0);
        assertEq(mult, 1e18);
        assertEq(pending, 0);
        assertFalse(isLocked);
    }

    function testEstimatedAPR_NoStakers() public view {
        assertEq(staking.estimatedAPR(0), 0);
    }

    function testEstimatedAPR_WithStakers() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        uint256 apr = staking.estimatedAPR(0);
        assertGt(apr, 0);
    }

    function testEstimatedAPR_LockedHigherThanUnlocked() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(1000 ether, 0);

        uint256 aprNoLock  = staking.estimatedAPR(0);
        uint256 apr30Days  = staking.estimatedAPR(30);
        uint256 apr180Days = staking.estimatedAPR(180);

        assertGt(apr30Days,  aprNoLock);
        assertGt(apr180Days, apr30Days);
    }

    // ─── Additional staking to existing position ──────────────────────────────

    function testAdditionalStakeNoLock() public {
        _notifyRewards(REWARD_BUDGET);

        vm.prank(alice);
        staking.stake(500 ether, 0);

        vm.warp(block.timestamp + WEEK / 4);

        vm.prank(alice);
        staking.stake(500 ether, 0);

        (uint256 amount, , , ,uint256 pending,) = staking.getStakeInfo(alice);
        assertEq(amount, 1000 ether);
        // Pending rewards from first half should be captured
        assertGt(pending, 0);
    }

    function testTotalEffectiveStakeZeroAfterAllUnstake() public {
        vm.prank(alice);
        staking.stake(1000 ether, 0);
        vm.prank(bob);
        staking.stake(500 ether, 0);

        vm.prank(alice);
        staking.unstake(1000 ether);
        vm.prank(bob);
        staking.unstake(500 ether);

        assertEq(staking.totalEffectiveStake(), 0);
    }
}
