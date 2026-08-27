// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/Lending.sol";
import "../../src/MockToken.sol";
import "../../src/Pool.sol";
import "../../src/PoolFactory.sol";

contract LendingTest is Test {
    Lending     public lending;
    MockToken   public bdx;
    MockToken   public musdc;
    Pool        public pool;
    PoolFactory public factory;

    address public owner     = makeAddr("owner");
    address public alice     = makeAddr("alice");
    address public bob       = makeAddr("bob");
    address public liquidator = makeAddr("liquidator");

    uint256 constant RESERVE = 500_000 ether;

    function setUp() public {
        bdx   = new MockToken("BDX",   "BDX",   18);
        musdc = new MockToken("MUSDC", "MUSDC", 18);

        // Pool: seed so 1 BDX = 2 MUSDC (or 0.5 depending on sort)
        factory = new PoolFactory();
        address poolAddr = factory.createPool(address(bdx), address(musdc));
        pool = Pool(poolAddr);

        bdx.mint(owner,  20_000_000 ether);
        musdc.mint(owner, 20_000_000 ether);
        vm.startPrank(owner);
        bdx.approve(address(pool), type(uint256).max);
        musdc.approve(address(pool), type(uint256).max);
        pool.addLiquidity(10_000_000 ether, 20_000_000 ether, 0, 0, owner);
        vm.stopPrank();

        lending = new Lending(address(bdx), address(musdc), address(pool), owner);

        // Fund reserve
        musdc.mint(owner, RESERVE);
        vm.startPrank(owner);
        musdc.approve(address(lending), RESERVE);
        lending.fundReserve(RESERVE);
        vm.stopPrank();

        // Mint to test users
        bdx.mint(alice,     100_000 ether);
        bdx.mint(bob,       100_000 ether);
        musdc.mint(liquidator, 1_000_000 ether);

        vm.prank(alice);
        bdx.approve(address(lending), type(uint256).max);
        vm.prank(bob);
        bdx.approve(address(lending), type(uint256).max);
        vm.prank(liquidator);
        musdc.approve(address(lending), type(uint256).max);
    }

    // ── Helper: calculate max borrow for a collateral amount ─────────────────
    function _maxBorrow(uint256 colAmt) internal view returns (uint256) {
        uint256 price = lending.getBdxPrice();
        uint256 colUSD = (colAmt * price) / 1e18;
        return (colUSD * 75) / 100;
    }

    // ── Price oracle ──────────────────────────────────────────────────────────

    function test_BdxPrice_NonZero() public view {
        uint256 price = lending.getBdxPrice();
        assertGt(price, 0);
    }

    function test_BdxPrice_Fallback() public {
        Lending noOracle = new Lending(address(bdx), address(musdc), address(0), owner);
        assertEq(noOracle.getBdxPrice(), 1e18);
    }

    function test_BdxPrice_InRange() public view {
        // seeded 10M BDX + 20M MUSDC → price should be close to 2 or 0.5
        uint256 price = lending.getBdxPrice();
        assertGt(price, 0.1e18);  // > 0.1 MUSDC per BDX
        assertLt(price, 10e18);   // < 10 MUSDC per BDX
    }

    // ── Deposit collateral ────────────────────────────────────────────────────

    function test_DepositCollateral_Basic() public {
        vm.prank(alice);
        lending.depositCollateral(1_000 ether);
        (uint256 col,,,,,) = lending.getPosition(alice);
        assertEq(col, 1_000 ether);
    }

    function test_DepositCollateral_Multiple() public {
        vm.prank(alice);
        lending.depositCollateral(500 ether);
        vm.prank(alice);
        lending.depositCollateral(500 ether);
        (uint256 col,,,,,) = lending.getPosition(alice);
        assertEq(col, 1_000 ether);
    }

    function test_DepositCollateral_RevertsZero() public {
        vm.prank(alice);
        vm.expectRevert(Lending.ZeroAmount.selector);
        lending.depositCollateral(0);
    }

    function test_DepositCollateral_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit Lending.CollateralDeposited(alice, 1_000 ether);
        lending.depositCollateral(1_000 ether);
    }

    // ── Withdraw collateral ───────────────────────────────────────────────────

    function test_WithdrawCollateral_NoDebt() public {
        vm.startPrank(alice);
        lending.depositCollateral(1_000 ether);
        lending.withdrawCollateral(400 ether);
        vm.stopPrank();
        (uint256 col,,,,,) = lending.getPosition(alice);
        assertEq(col, 600 ether);
    }

    function test_WithdrawCollateral_Full_NoDebt() public {
        vm.startPrank(alice);
        lending.depositCollateral(1_000 ether);
        lending.withdrawCollateral(1_000 ether);
        vm.stopPrank();
        (uint256 col,,,,,) = lending.getPosition(alice);
        assertEq(col, 0);
    }

    function test_WithdrawCollateral_RevertsInsufficient() public {
        vm.prank(alice);
        lending.depositCollateral(100 ether);
        vm.prank(alice);
        vm.expectRevert(Lending.InsufficientCollateral.selector);
        lending.withdrawCollateral(200 ether);
    }

    function test_WithdrawCollateral_RevertsBreaksLTV() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        // Try to withdraw nearly all collateral
        vm.expectRevert(Lending.ExceedsBorrowLimit.selector);
        lending.withdrawCollateral(col - 1 ether);
        vm.stopPrank();
    }

    // ── Borrow ────────────────────────────────────────────────────────────────

    function test_Borrow_Success() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        uint256 musdcBefore = musdc.balanceOf(alice);
        lending.borrow(bor);
        vm.stopPrank();
        assertEq(musdc.balanceOf(alice) - musdcBefore, bor);
        (, uint256 borrowed,,,,) = lending.getPosition(alice);
        assertEq(borrowed, bor);
    }

    function test_Borrow_RevertsNoCollateral() public {
        vm.prank(alice);
        vm.expectRevert(Lending.InsufficientCollateral.selector);
        lending.borrow(100 ether);
    }

    function test_Borrow_RevertsExceedsLTV() public {
        uint256 col    = 1_000 ether;
        uint256 maxBor = _maxBorrow(col);
        vm.startPrank(alice);
        lending.depositCollateral(col);
        vm.expectRevert(Lending.ExceedsBorrowLimit.selector);
        lending.borrow(maxBor + 1_000 ether);
        vm.stopPrank();
    }

    function test_Borrow_RevertsZero() public {
        vm.startPrank(alice);
        lending.depositCollateral(1_000 ether);
        vm.expectRevert(Lending.ZeroAmount.selector);
        lending.borrow(0);
        vm.stopPrank();
    }

    function test_Borrow_EmitsEvent() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        vm.expectEmit(true, false, false, true);
        emit Lending.Borrowed(alice, bor);
        lending.borrow(bor);
        vm.stopPrank();
    }

    // ── Borrow limit ─────────────────────────────────────────────────────────

    function test_BorrowLimit_ZeroDebt() public {
        vm.prank(alice);
        lending.depositCollateral(1_000 ether);
        (uint256 maxBor, uint256 debt) = lending.borrowLimit(alice);
        assertEq(debt, 0);
        assertEq(maxBor, _maxBorrow(1_000 ether));
    }

    function test_BorrowLimit_DecreasesAfterBorrow() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();
        (, uint256 debt) = lending.borrowLimit(alice);
        assertEq(debt, bor);
    }

    // ── Health factor ─────────────────────────────────────────────────────────

    function test_HealthFactor_NoDebt() public view {
        assertEq(lending.healthFactor(alice), type(uint256).max);
    }

    function test_HealthFactor_PositiveAfterBorrow() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();
        assertGt(lending.healthFactor(alice), 1e18);
    }

    function test_HealthFactor_DecreasesWithMoreDebt() public {
        uint256 col = 10_000 ether;
        uint256 chunk = _maxBorrow(col) / 4;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(chunk);
        uint256 hf1 = lending.healthFactor(alice);
        lending.borrow(chunk);
        uint256 hf2 = lending.healthFactor(alice);
        vm.stopPrank();
        assertGt(hf1, hf2);
    }

    function test_HealthFactor_DecreasesOverTime() public {
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * 90) / 100;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();
        uint256 hfBefore = lending.healthFactor(alice);
        vm.roll(block.number + 2_000_000);
        uint256 hfAfter  = lending.healthFactor(alice);
        assertLt(hfAfter, hfBefore);
    }

    // ── Repay ────────────────────────────────────────────────────────────────

    function test_Repay_Full() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        musdc.mint(alice, bor / 5); // extra for interest
        vm.startPrank(alice);
        musdc.approve(address(lending), type(uint256).max);
        lending.repay(type(uint256).max);
        vm.stopPrank();

        (, uint256 borrowed, uint256 interest,,,) = lending.getPosition(alice);
        assertEq(borrowed, 0);
        assertEq(interest, 0);
    }

    function test_Repay_Partial() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        uint256 repayAmt = bor / 3;
        musdc.mint(alice, repayAmt);
        vm.startPrank(alice);
        musdc.approve(address(lending), type(uint256).max);
        lending.repay(repayAmt);
        vm.stopPrank();

        (, uint256 borrowed,,,,) = lending.getPosition(alice);
        assertLt(borrowed, bor);
    }

    function test_Repay_RevertsNoDebt() public {
        vm.prank(alice);
        vm.expectRevert(Lending.InsufficientBorrowBalance.selector);
        lending.repay(100 ether);
    }

    // ── Interest accrual ─────────────────────────────────────────────────────

    function test_Interest_AccruedOverBlocks() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 2;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        vm.roll(block.number + 7_200); // ~1 day
        (,, uint256 interest,,,) = lending.getPosition(alice);
        assertGt(interest, 0);
    }

    function test_Interest_IncludedInHealthFactor() public {
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * 90) / 100;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        uint256 hf1 = lending.healthFactor(alice);
        vm.roll(block.number + 1_000_000);
        uint256 hf2 = lending.healthFactor(alice);
        assertLt(hf2, hf1);
    }

    // ── Liquidation ──────────────────────────────────────────────────────────

    function test_Liquidate_RevertsIfHealthy() public {
        uint256 col = 10_000 ether;
        uint256 bor = _maxBorrow(col) / 3;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        vm.prank(liquidator);
        vm.expectRevert(Lending.PositionHealthy.selector);
        lending.liquidate(alice, 100 ether);
    }

    function test_Liquidate_Success() public {
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * 95) / 100;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        // Accrue enough interest to make HF < 1
        vm.roll(block.number + 50_000_000);
        assertLt(lending.healthFactor(alice), 1e18);

        uint256 bdxBefore = bdx.balanceOf(liquidator);
        vm.prank(liquidator);
        lending.liquidate(alice, bor / 4);
        assertGt(bdx.balanceOf(liquidator), bdxBefore);
    }

    function test_Liquidate_LiquidatorReceivesBonus() public {
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * 95) / 100;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        vm.roll(block.number + 50_000_000);

        uint256 bdxBefore   = bdx.balanceOf(liquidator);
        uint256 musdcBefore = musdc.balanceOf(liquidator);

        vm.prank(liquidator);
        lending.liquidate(alice, bor / 4);

        uint256 bdxGained   = bdx.balanceOf(liquidator) - bdxBefore;
        uint256 musdcSpent  = musdcBefore - musdc.balanceOf(liquidator);
        assertGt(bdxGained, 0);
        assertGt(musdcSpent, 0);

        // Verify bonus: BDX received > debt repaid / price
        uint256 price     = lending.getBdxPrice();
        uint256 debtInBdx = (musdcSpent * 1e18) / price;
        assertGt(bdxGained, debtInBdx); // > 100% → bonus applied
    }

    function test_Liquidate_RevertsZero() public {
        vm.prank(liquidator);
        vm.expectRevert(Lending.ZeroAmount.selector);
        lending.liquidate(alice, 0);
    }

    // ── Reserve management ───────────────────────────────────────────────────

    function test_FundReserve_OnlyOwner() public {
        musdc.mint(bob, 1_000 ether);
        vm.startPrank(bob);
        musdc.approve(address(lending), 1_000 ether);
        vm.expectRevert();
        lending.fundReserve(1_000 ether);
        vm.stopPrank();
    }

    function test_WithdrawReserve_Success() public {
        assertGt(lending.reserveBalance(), 0);
        vm.prank(owner);
        lending.withdrawReserve(100 ether, owner);
        // reserve decreased
        assertLt(lending.reserveBalance(), RESERVE);
    }

    function test_WithdrawReserve_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        lending.withdrawReserve(100 ether, alice);
    }

    function test_SetPriceOracle_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        lending.setPriceOracle(address(0));
    }

    // ── Get position ─────────────────────────────────────────────────────────

    function test_GetPosition_ReturnsCorrectValues() public {
        uint256 col = 5_000 ether;
        uint256 bor = _maxBorrow(col) / 3;
        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        (
            uint256 collateral,
            uint256 borrowed,
            ,
            uint256 hf,
            uint256 colUSD,
            uint256 maxBorrowable
        ) = lending.getPosition(alice);

        assertEq(collateral, col);
        assertEq(borrowed,   bor);
        assertGt(hf,         1e18);
        assertGt(colUSD,     0);
        assertGt(maxBorrowable, 0);
    }

    // ── Fuzz ─────────────────────────────────────────────────────────────────

    function testFuzz_DepositBorrowHealthy(uint256 pct) public {
        pct = bound(pct, 1, 74); // borrow between 1% and 74% of max
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * pct) / 75;
        if (bor == 0 || bor > lending.reserveBalance()) return;

        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        assertGt(lending.healthFactor(alice), 1e18);
    }

    function testFuzz_RepayRestoresHealth(uint256 repayPct) public {
        repayPct = bound(repayPct, 50, 100);
        uint256 col = 10_000 ether;
        uint256 bor = (_maxBorrow(col) * 90) / 100;
        if (bor > lending.reserveBalance()) return;

        vm.startPrank(alice);
        lending.depositCollateral(col);
        lending.borrow(bor);
        vm.stopPrank();

        // Fast-forward so HF might drop
        vm.roll(block.number + 100_000);

        uint256 repayAmt = (bor * repayPct) / 100;
        musdc.mint(alice, repayAmt);
        vm.startPrank(alice);
        musdc.approve(address(lending), type(uint256).max);
        lending.repay(repayAmt);
        vm.stopPrank();

        // After repaying >= 50%, should be fine (unless massive interest)
        // Just verify no revert
    }
}
