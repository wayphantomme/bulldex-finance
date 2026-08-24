// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/MockToken.sol";
import "../src/PoolFactory.sol";
import "../src/Pool.sol";

/// @title  DeployScript - Deploy all Bulldex Finance contracts to target network
/// @author Phantom (@wayphantomme)
/// @notice Run via: make deploy-sepolia
contract DeployScript is Script {
    // ─── Config ───────────────────────────────────────────────────────────────

    /// @dev Initial BDX supply sent to deployer: 100 million tokens
    uint256 constant INITIAL_BDX_SUPPLY = 100_000_000 ether;

    /// @dev Initial MUSDC supply for deployer: 200 million (to seed pool at 1 BDX = 2 MUSDC)
    uint256 constant INITIAL_MUSDC_SUPPLY = 200_000_000 ether;

    /// @dev Liquidity to seed into BDX/MUSDC pool
    uint256 constant SEED_BDX   = 10_000_000 ether;  // 10M BDX
    uint256 constant SEED_MUSDC = 20_000_000 ether;  // 20M MUSDC → price 1 BDX = 2 MUSDC

    // ─── Run ──────────────────────────────────────────────────────────────────

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("Bulldex Finance - Deployment");
        console.log("===========================================");
        console.log("Network  :", block.chainid == 11155111 ? "Sepolia" : "Unknown");
        console.log("Deployer :", deployer);
        console.log("Balance  :", deployer.balance / 1e18, "ETH");
        console.log("===========================================");

        vm.startBroadcast(deployerPrivateKey);

        // ── 1. Deploy BDX Token ───────────────────────────────────────────────
        Token bdx = new Token(deployer, INITIAL_BDX_SUPPLY);
        console.log("\n[1/5] BDX Token deployed:", address(bdx));

        // ── 2. Deploy MockToken (MUSDC) ────────────────────────────────────────
        MockToken musdc = new MockToken("Mock USDC", "MUSDC", 18);
        musdc.mint(deployer, INITIAL_MUSDC_SUPPLY);
        console.log("[2/5] MockToken (MUSDC) deployed:", address(musdc));

        // ── 3. Deploy PoolFactory ─────────────────────────────────────────────
        PoolFactory factory = new PoolFactory();
        console.log("[3/5] PoolFactory deployed:", address(factory));

        // ── 4. Create BDX/MUSDC Pool ──────────────────────────────────────────
        address poolAddr = factory.createPool(address(bdx), address(musdc));
        Pool pool = Pool(poolAddr);
        console.log("[4/5] BDX/MUSDC Pool created:", address(pool));
        console.log("      token0:", address(pool.token0()));
        console.log("      token1:", address(pool.token1()));

        // ── 5. Seed initial liquidity ─────────────────────────────────────────
        bdx.approve(address(pool), SEED_BDX);
        musdc.approve(address(pool), SEED_MUSDC);
        (uint256 amt0, uint256 amt1, uint256 lp) = pool.addLiquidity(
            SEED_BDX,
            SEED_MUSDC,
            0,
            0,
            deployer
        );
        console.log("[5/5] Pool seeded with initial liquidity:");
        console.log("      BDX deposited  :", amt0 / 1e18);
        console.log("      MUSDC deposited :", amt1 / 1e18);
        console.log("      LP tokens minted:", lp / 1e18);

        vm.stopBroadcast();

        // ─── Post-deploy summary ──────────────────────────────────────────────
        console.log("\n===========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("BDX Token   :", address(bdx));
        console.log("MockToken   :", address(musdc));
        console.log("PoolFactory :", address(factory));
        console.log("BDX/MUSDC Pool:", address(pool));
        console.log("");
        console.log("Copy these to frontend/.env.local:");
        console.log("NEXT_PUBLIC_TOKEN_ADDRESS=", address(bdx));
        console.log("NEXT_PUBLIC_MUSDC_ADDRESS=", address(musdc));
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("NEXT_PUBLIC_POOL_BDX_MUSDC=", address(pool));
        console.log("");
        console.log("Verify contracts:");
        console.log("make verify-contract CONTRACT=Token ADDRESS=", address(bdx));
        console.log("make verify-contract CONTRACT=MockToken ADDRESS=", address(musdc));
        console.log("make verify-contract CONTRACT=PoolFactory ADDRESS=", address(factory));
        console.log("make verify-contract CONTRACT=Pool ADDRESS=", address(pool));
    }
}
