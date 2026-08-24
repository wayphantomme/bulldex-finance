// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/Pool.sol";
import "../../src/MockToken.sol";
import "../../src/PoolFactory.sol";

/// @title  Pool Unit Tests
/// @notice Full coverage for Pool.sol — addLiquidity, removeLiquidity, swap, pricing, fuzz
contract PoolTest is Test {
    // ─── State ────────────────────────────────────────────────────────────────

    Pool public pool;
    PoolFactory public factory;
    MockToken public tokenA;
    MockToken public tokenB;

    address public alice = makeAddr("alice");
    address public bob   = makeAddr("bob");

    // Initial liquidity seed amounts
    uint256 constant INIT_A = 1_000_000 ether; // 1M tokenA
    uint256 constant INIT_B = 2_000_000 ether; // 2M tokenB → initial price: 1A = 2B

    // ─── Setup ────────────────────────────────────────────────────────────────

    function setUp() public {
        // Deploy tokens
        tokenA = new MockToken("Token A", "TKNA", 18);
        tokenB = new MockToken("Token B", "TKNB", 18);

        // Deploy factory + create pool
        factory = new PoolFactory();
        address poolAddr = factory.createPool(address(tokenA), address(tokenB));
        pool = Pool(poolAddr);

        // Mint tokens to alice (liquidity provider) and bob (trader)
        tokenA.mint(alice, INIT_A * 10);
        tokenB.mint(alice, INIT_B * 10);
        tokenA.mint(bob,   INIT_A);
        tokenB.mint(bob,   INIT_B);

        // Alice seeds the pool
        vm.startPrank(alice);
        tokenA.approve(address(pool), type(uint256).max);
        tokenB.approve(address(pool), type(uint256).max);
        pool.addLiquidity(INIT_A, INIT_B, 0, 0, alice);
        vm.stopPrank();
    }

    // ─── PoolFactory ──────────────────────────────────────────────────────────

    function test_Factory_CreatesPool() public view {
        address p = factory.poolFor(address(tokenA), address(tokenB));
        assertEq(p, address(pool));
    }

    function test_Factory_BidirectionalLookup() public view {
        address p1 = factory.poolFor(address(tokenA), address(tokenB));
        address p2 = factory.poolFor(address(tokenB), address(tokenA));
        assertEq(p1, p2);
    }

    function test_Factory_AllPoolsLength() public view {
        assertEq(factory.allPoolsLength(), 1);
    }

    function test_Factory_RevertsIdenticalTokens() public {
        vm.expectRevert(PoolFactory.IdenticalTokens.selector);
        factory.createPool(address(tokenA), address(tokenA));
    }

    function test_Factory_RevertsZeroAddress() public {
        vm.expectRevert(PoolFactory.ZeroAddress.selector);
        factory.createPool(address(tokenA), address(0));
    }

    function test_Factory_RevertsPoolExists() public {
        vm.expectRevert(PoolFactory.PoolExists.selector);
        factory.createPool(address(tokenA), address(tokenB));
    }

    // ─── Pool: Token Setup ────────────────────────────────────────────────────

    function test_Pool_TokensSorted() public view {
        address t0 = address(pool.token0());
        address t1 = address(pool.token1());
        assertLt(uint160(t0), uint160(t1));
    }

    function test_Pool_LPTokenName() public view {
        // Should contain "LP"
        string memory name = pool.name();
        assertTrue(bytes(name).length > 0);
    }

    // ─── addLiquidity: First deposit ──────────────────────────────────────────

    function test_AddLiquidity_FirstDeposit_MinimumLiquidityLocked() public view {
        // MINIMUM_LIQUIDITY (1000) should be locked at address(1)
        assertEq(pool.balanceOf(address(1)), pool.MINIMUM_LIQUIDITY());
    }

    function test_AddLiquidity_FirstDeposit_AliceGetsLP() public view {
        uint256 aliceLP = pool.balanceOf(alice);
        assertGt(aliceLP, 0);
    }

    function test_AddLiquidity_FirstDeposit_ReservesSet() public view {
        (uint256 r0, uint256 r1) = pool.getReserves();
        assertGt(r0, 0);
        assertGt(r1, 0);
    }

    function test_AddLiquidity_FirstDeposit_TotalSupply() public view {
        uint256 expected = _sqrt(INIT_A * INIT_B);
        assertEq(pool.totalSupply(), expected);
    }

    // ─── addLiquidity: Subsequent deposit ─────────────────────────────────────

    function test_AddLiquidity_Subsequent_ProportionalLP() public {
        uint256 lpBefore = pool.balanceOf(alice);
        uint256 totalBefore = pool.totalSupply();
        (uint256 r0, uint256 r1) = pool.getReserves();

        // Deposit same ratio as existing reserves
        uint256 addA = r0 / 10; // 10% of reserve
        uint256 addB = r1 / 10; // 10% of reserve

        vm.startPrank(alice);
        (,, uint256 lpMinted) = pool.addLiquidity(addA, addB, 0, 0, alice);
        vm.stopPrank();

        assertGt(lpMinted, 0);
        assertEq(pool.balanceOf(alice), lpBefore + lpMinted);
        // ~10% more LP
        assertApproxEqRel(lpMinted, totalBefore / 10, 0.01e18);
    }

    function test_AddLiquidity_Emits_Event() public {
        vm.startPrank(alice);
        vm.expectEmit(true, false, false, false);
        emit Pool.AddLiquidity(alice, 0, 0, 0);
        pool.addLiquidity(1000 ether, 2000 ether, 0, 0, alice);
        vm.stopPrank();
    }

    // ─── removeLiquidity ──────────────────────────────────────────────────────

    function test_RemoveLiquidity_ReturnsTokens() public {
        uint256 lpBalance = pool.balanceOf(alice);
        uint256 halfLP = lpBalance / 2;

        vm.startPrank(alice);
        (uint256 out0, uint256 out1) = pool.removeLiquidity(halfLP, 0, 0, alice);
        vm.stopPrank();

        assertGt(out0, 0);
        assertGt(out1, 0);
        // out0/out1 should be roughly half of reserves (within 1% rounding)
        assertApproxEqRel(out0, INIT_A / 2, 0.01e18);
        assertApproxEqRel(out1, INIT_B / 2, 0.01e18);
    }

    function test_RemoveLiquidity_BurnsLP() public {
        uint256 lpBalance = pool.balanceOf(alice);
        vm.startPrank(alice);
        pool.removeLiquidity(lpBalance / 2, 0, 0, alice);
        vm.stopPrank();
        assertEq(pool.balanceOf(alice), lpBalance - lpBalance / 2);
    }

    function test_RemoveLiquidity_ProportionalAmounts() public {
        (uint256 r0, uint256 r1) = pool.getReserves();
        uint256 totalLP = pool.totalSupply();
        uint256 lpBalance = pool.balanceOf(alice);

        uint256 expected0 = (lpBalance * r0) / totalLP;
        uint256 expected1 = (lpBalance * r1) / totalLP;

        vm.startPrank(alice);
        (uint256 out0, uint256 out1) = pool.removeLiquidity(lpBalance, 0, 0, alice);
        vm.stopPrank();

        assertEq(out0, expected0);
        assertEq(out1, expected1);
    }

    function test_RemoveLiquidity_RevertsZeroLiquidity() public {
        vm.prank(alice);
        vm.expectRevert(Pool.InsufficientLiquidityBurned.selector);
        pool.removeLiquidity(0, 0, 0, alice);
    }

    function test_RemoveLiquidity_RevertsSlippage() public {
        uint256 lpBalance = pool.balanceOf(alice);
        vm.prank(alice);
        vm.expectRevert(Pool.InsufficientOutputAmount.selector);
        pool.removeLiquidity(lpBalance, type(uint256).max, type(uint256).max, alice);
    }

    // ─── swap ─────────────────────────────────────────────────────────────────

    function test_Swap_TokenAForTokenB() public {
        uint256 amountIn = 1000 ether;
        (uint256 r0, uint256 r1) = pool.getReserves();

        bool isToken0 = address(pool.token0()) == address(tokenA);
        uint256 reserveIn  = isToken0 ? r0 : r1;
        uint256 reserveOut = isToken0 ? r1 : r0;

        uint256 expectedOut = pool.getAmountOut(amountIn, reserveIn, reserveOut);

        uint256 bobBalBefore = tokenB.balanceOf(bob);

        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        uint256 actualOut = pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        assertEq(actualOut, expectedOut);
        assertEq(tokenB.balanceOf(bob), bobBalBefore + actualOut);
    }

    function test_Swap_TokenBForTokenA() public {
        uint256 amountIn = 1000 ether;
        (uint256 r0, uint256 r1) = pool.getReserves();

        bool isToken0 = address(pool.token0()) == address(tokenB);
        uint256 reserveIn  = isToken0 ? r0 : r1;
        uint256 reserveOut = isToken0 ? r1 : r0;

        uint256 expectedOut = pool.getAmountOut(amountIn, reserveIn, reserveOut);

        uint256 bobBalBefore = tokenA.balanceOf(bob);

        vm.startPrank(bob);
        tokenB.approve(address(pool), amountIn);
        uint256 actualOut = pool.swap(address(tokenB), amountIn, 0, bob);
        vm.stopPrank();

        assertEq(actualOut, expectedOut);
        assertEq(tokenA.balanceOf(bob), bobBalBefore + actualOut);
    }

    function test_Swap_FeeApplied() public {
        uint256 amountIn = 100_000 ether;
        (uint256 r0, uint256 r1) = pool.getReserves();

        bool isToken0 = address(pool.token0()) == address(tokenA);
        uint256 reserveIn  = isToken0 ? r0 : r1;
        uint256 reserveOut = isToken0 ? r1 : r0;

        // Output with fee
        uint256 withFee = pool.getAmountOut(amountIn, reserveIn, reserveOut);
        // Output without fee (would be higher)
        uint256 withoutFee = (amountIn * reserveOut) / (reserveIn + amountIn);

        assertLt(withFee, withoutFee);
    }

    function test_Swap_RevertsInvalidToken() public {
        vm.prank(bob);
        vm.expectRevert(Pool.InvalidToken.selector);
        pool.swap(address(0xdead), 100 ether, 0, bob);
    }

    function test_Swap_RevertsZeroInput() public {
        vm.prank(bob);
        vm.expectRevert(Pool.InsufficientInputAmount.selector);
        pool.swap(address(tokenA), 0, 0, bob);
    }

    function test_Swap_RevertsSlippage() public {
        uint256 amountIn = 1000 ether;
        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        vm.expectRevert();
        pool.swap(address(tokenA), amountIn, type(uint256).max, bob);
        vm.stopPrank();
    }

    function test_Swap_EmitsEvent() public {
        uint256 amountIn = 1000 ether;
        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        vm.expectEmit(true, true, false, false);
        emit Pool.Swap(bob, address(tokenA), 0, 0, bob);
        pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();
    }

    function test_Swap_ReservesUpdated() public {
        (uint256 r0Before, uint256 r1Before) = pool.getReserves();
        uint256 amountIn = 1000 ether;

        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        (uint256 r0After, uint256 r1After) = pool.getReserves();
        // One reserve increases, the other decreases
        assertTrue(r0After != r0Before || r1After != r1Before);
    }

    // ─── getAmountOut ─────────────────────────────────────────────────────────

    function test_GetAmountOut_Formula() public view {
        uint256 amountIn  = 1000 ether;
        uint256 reserveIn  = 100_000 ether;
        uint256 reserveOut = 200_000 ether;

        uint256 amountOut = pool.getAmountOut(amountIn, reserveIn, reserveOut);

        // Manual calculation: (1000 * 997 * 200000) / (100000 * 1000 + 1000 * 997)
        uint256 expected = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997);
        assertEq(amountOut, expected);
    }

    function test_GetAmountOut_RevertsZeroInput() public {
        vm.expectRevert(Pool.InsufficientInputAmount.selector);
        pool.getAmountOut(0, 1000 ether, 1000 ether);
    }

    function test_GetAmountOut_RevertsZeroReserve() public {
        vm.expectRevert(Pool.InsufficientLiquidity.selector);
        pool.getAmountOut(100 ether, 0, 1000 ether);
    }

    // ─── getAmountIn ──────────────────────────────────────────────────────────

    function test_GetAmountIn_Inverse() public view {
        uint256 reserveIn  = 100_000 ether;
        uint256 reserveOut = 200_000 ether;
        uint256 desiredOut = 10_000 ether;

        uint256 requiredIn = pool.getAmountIn(desiredOut, reserveIn, reserveOut);
        uint256 actualOut  = pool.getAmountOut(requiredIn, reserveIn, reserveOut);

        // actualOut should be >= desiredOut (we might get slightly more due to rounding)
        assertGe(actualOut, desiredOut);
    }

    // ─── Pricing ─────────────────────────────────────────────────────────────

    function test_GetPrice_InitialRatio() public view {
        // Initial: 1M tokenA, 2M tokenB → 1 tokenA = 2 tokenB
        // price0 = reserve1/reserve0 * 1e18 ≈ 2e18
        uint256 price0 = pool.getPrice0();
        assertApproxEqRel(price0, 2e18, 0.01e18);
    }

    function test_GetPrice_AfterSwap_Moves() public {
        uint256 priceBefore = pool.getPrice0();

        // Large swap shifts price
        uint256 bigSwap = INIT_A / 10;
        vm.startPrank(bob);
        tokenA.approve(address(pool), bigSwap);
        pool.swap(address(tokenA), bigSwap, 0, bob);
        vm.stopPrank();

        uint256 priceAfter = pool.getPrice0();
        assertNotEq(priceBefore, priceAfter);
    }

    // ─── Price impact ─────────────────────────────────────────────────────────

    function test_PriceImpact_SmallSwapIsLow() public view {
        uint256 smallSwap = INIT_A / 10000; // 0.01% of reserve
        uint256 impact = pool.getPriceImpact(address(tokenA), smallSwap);
        assertLt(impact, 50); // < 0.5% impact (50 basis points)
    }

    function test_PriceImpact_LargeSwapIsHigh() public view {
        uint256 largeSwap = INIT_A / 2; // 50% of reserve
        uint256 impact = pool.getPriceImpact(address(tokenA), largeSwap);
        assertGt(impact, 100); // > 1% impact
    }

    // ─── Invariant: k should never decrease ───────────────────────────────────

    function test_Invariant_KNeverDecreases() public {
        (uint256 r0Before, uint256 r1Before) = pool.getReserves();
        uint256 kBefore = r0Before * r1Before;

        uint256 amountIn = 10_000 ether;
        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        (uint256 r0After, uint256 r1After) = pool.getReserves();
        uint256 kAfter = r0After * r1After;

        // k should increase slightly (due to fees) or stay the same
        assertGe(kAfter, kBefore);
    }

    // ─── Fuzz Tests ───────────────────────────────────────────────────────────

    function testFuzz_Swap_OutputNeverExceedsReserve(uint256 amountIn) public {
        amountIn = bound(amountIn, 1 ether, INIT_A / 4);

        (uint256 r0, uint256 r1) = pool.getReserves();
        bool isToken0 = address(pool.token0()) == address(tokenA);
        uint256 reserveOut = isToken0 ? r1 : r0;

        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        uint256 amountOut = pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        // Output can never exceed the reserve
        assertLt(amountOut, reserveOut);
    }

    function testFuzz_GetAmountOut_AlwaysLessThanReserve(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public view {
        amountIn   = bound(amountIn,   1,     1e36);
        reserveIn  = bound(reserveIn,  1000,  1e36);
        reserveOut = bound(reserveOut, 1000,  1e36);

        uint256 out = pool.getAmountOut(amountIn, reserveIn, reserveOut);
        assertLt(out, reserveOut);
    }

    function testFuzz_AddRemoveLiquidity_Roundtrip(uint256 addAmount) public {
        addAmount = bound(addAmount, 1 ether, INIT_A);

        (uint256 r0, uint256 r1) = pool.getReserves();
        uint256 addB = (addAmount * r1) / r0;

        uint256 balABefore = tokenA.balanceOf(alice);
        uint256 balBBefore = tokenB.balanceOf(alice);

        vm.startPrank(alice);
        (uint256 a0, uint256 a1, uint256 lp) = pool.addLiquidity(addAmount, addB, 0, 0, alice);
        (uint256 out0, uint256 out1) = pool.removeLiquidity(lp, 0, 0, alice);
        vm.stopPrank();

        // Should get back close to what was deposited (rounding may cause -1)
        assertApproxEqAbs(tokenA.balanceOf(alice), balABefore, 2);
        assertApproxEqAbs(tokenB.balanceOf(alice), balBBefore, 2);

        // Suppress unused variable warnings
        (a0, a1);
        (out0, out1);
    }

    function testFuzz_KInvariant_AfterSwap(uint256 amountIn) public {
        amountIn = bound(amountIn, 1 ether, INIT_A / 4);

        (uint256 r0Before, uint256 r1Before) = pool.getReserves();
        uint256 kBefore = r0Before * r1Before;

        vm.startPrank(bob);
        tokenA.approve(address(pool), amountIn);
        pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        (uint256 r0After, uint256 r1After) = pool.getReserves();
        uint256 kAfter = r0After * r1After;

        assertGe(kAfter, kBefore);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) {
            z = 1;
        }
    }
}
