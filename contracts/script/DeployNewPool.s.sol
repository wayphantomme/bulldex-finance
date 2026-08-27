// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/MockToken.sol";
import "../src/PoolFactory.sol";
import "../src/Pool.sol";

/// @title  DeployNewPool — Deploy a new BDX/MUSDC pool with correct price ratio
/// @notice Creates a new BDX/MUSDC pool seeded so 1 BDX = 0.05 MUSDC ($0.05 if 1 MUSDC = $1)
///
/// @dev    WHY A SEPARATE SCRIPT?
///         We NEVER re-run Deploy.s.sol once contracts are live.
///         Re-running deploys new Token/Factory/etc with new addresses — breaks everything.
///         This script ONLY creates a new pool using the existing deployed contracts.
///
/// Price calculation:
///   seed 5,000 BDX + 250 MUSDC
///   → price = 250 / 5,000 = 0.05 MUSDC per BDX
///   → If MUSDC = $1, then BDX = $0.05 ✓
contract DeployNewPool is Script {

    // 1 BDX = 0.05 MUSDC → seed 5000 BDX + 250 MUSDC
    uint256 constant SEED_BDX   = 5_000 ether;
    uint256 constant SEED_MUSDC = 250 ether;

    function run() external {
        uint256 deployerKey    = vm.envUint("PRIVATE_KEY");
        address deployer       = vm.addr(deployerKey);
        address bdxAddress     = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address musdcAddress   = vm.envAddress("NEXT_PUBLIC_MUSDC_ADDRESS");
        address factoryAddress = vm.envAddress("NEXT_PUBLIC_FACTORY_ADDRESS");

        console.log("===========================================");
        console.log("Bulldex - Deploy New BDX/MUSDC Pool");
        console.log("===========================================");
        console.log("Deployer  :", deployer);
        console.log("BDX       :", bdxAddress);
        console.log("MUSDC     :", musdcAddress);
        console.log("Factory   :", factoryAddress);
        console.log("Target price: 1 BDX = 0.05 MUSDC ($0.05)");

        vm.startBroadcast(deployerKey);

        PoolFactory factory = PoolFactory(factoryAddress);

        // ── Create pool ───────────────────────────────────────────────────────
        address poolAddr = factory.createPool(bdxAddress, musdcAddress);
        Pool pool = Pool(poolAddr);
        console.log("[1/2] New BDX/MUSDC pool:", poolAddr);

        // ── Seed with correct ratio ───────────────────────────────────────────
        Token(bdxAddress).approve(poolAddr, SEED_BDX);
        MockToken(musdcAddress).mint(deployer, SEED_MUSDC);
        MockToken(musdcAddress).approve(poolAddr, SEED_MUSDC);

        (uint256 a0, uint256 a1, uint256 lp) = pool.addLiquidity(
            SEED_BDX,
            SEED_MUSDC,
            0, 0,
            deployer
        );

        console.log("[2/2] Pool seeded:");
        console.log("  BDX :", a0 / 1e18);
        console.log("  MUSDC:", a1 / 1e18);
        console.log("  LP  :", lp / 1e18);

        vm.stopBroadcast();

        console.log("\n===========================================");
        console.log("DONE");
        console.log("===========================================");
        console.log("New pool :", poolAddr);
        console.log("Price    : 1 BDX = 0.05 MUSDC");
        console.log("\nUpdate frontend/.env.local:");
        console.log("NEXT_PUBLIC_POOL_BDX_MUSDC=", poolAddr);
    }
}
