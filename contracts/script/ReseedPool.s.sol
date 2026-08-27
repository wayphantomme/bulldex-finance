// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/MockToken.sol";
import "../src/Pool.sol";

/// @title  ReseedPool — Remove all deployer LP and re-add with correct price ratio
/// @notice Changes BDX/MUSDC pool from 1 BDX = 2 MUSDC to 1 BDX = 0.05 MUSDC ($0.05)
///
/// Steps:
///   1. Remove all deployer LP from existing pool
///   2. Add new liquidity with 5,000 BDX + 250 MUSDC (1 BDX = 0.05 MUSDC)
///
/// NOTE: MINIMUM_LIQUIDITY (1000 wei) stays locked forever — that's by design.
contract ReseedPool is Script {

    address constant POOL  = 0xFAc1B95480e87Ccef0E995612ceCA23f3ddB0197;

    uint256 constant SEED_BDX   = 5_000 ether;
    uint256 constant SEED_MUSDC = 250 ether;

    function run() external {
        uint256 deployerKey  = vm.envUint("PRIVATE_KEY");
        address deployer     = vm.addr(deployerKey);
        address bdxAddress   = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address musdcAddress = vm.envAddress("NEXT_PUBLIC_MUSDC_ADDRESS");

        Pool pool = Pool(POOL);

        uint256 lpBalance = pool.balanceOf(deployer);

        console.log("===========================================");
        console.log("Bulldex - Reseed BDX/MUSDC Pool");
        console.log("===========================================");
        console.log("Pool     :", POOL);
        console.log("LP held  :", lpBalance / 1e18);
        console.log("Target   : 1 BDX = 0.05 MUSDC");

        vm.startBroadcast(deployerKey);

        // ── Step 1: Remove all deployer LP ────────────────────────────────────
        if (lpBalance > 0) {
            pool.removeLiquidity(lpBalance, 0, 0, deployer);
            console.log("[1/2] Removed all deployer LP");
        }

        // ── Step 2: Add new liquidity with correct ratio ───────────────────────
        Token(bdxAddress).approve(POOL, SEED_BDX);
        MockToken(musdcAddress).mint(deployer, SEED_MUSDC);
        MockToken(musdcAddress).approve(POOL, SEED_MUSDC);

        (uint256 a0, uint256 a1, uint256 lp) = pool.addLiquidity(
            SEED_BDX,
            SEED_MUSDC,
            0, 0,
            deployer
        );

        vm.stopBroadcast();

        console.log("[2/2] New liquidity added:");
        console.log("  Amount0:", a0 / 1e18);
        console.log("  Amount1:", a1 / 1e18);
        console.log("  LP minted:", lp / 1e18);

        // Show new price
        (uint256 r0, uint256 r1) = pool.getReserves();
        address token0 = address(pool.token0());
        uint256 bdxReserve   = token0 == bdxAddress ? r0 : r1;
        uint256 musdcReserve = token0 == bdxAddress ? r1 : r0;

        console.log("\n===========================================");
        console.log("RESEED COMPLETE");
        console.log("===========================================");
        if (bdxReserve > 0) {
            console.log("New price: 1 BDX =", (musdcReserve * 1e6 / bdxReserve), "x10^-6 MUSDC");
        }
        console.log("Pool address unchanged:", POOL);
        console.log("No .env changes needed!");
    }
}
