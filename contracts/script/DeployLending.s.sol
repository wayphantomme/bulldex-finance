// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Lending.sol";
import "../src/MockToken.sol";

/// @title  DeployLending — Deploy Lending contract and fund reserve
/// @notice Run after Deploy.s.sol.
///         Needs PRIVATE_KEY + token + pool addresses in .env.
contract DeployLending is Script {

    // Initial MUSDC reserve for borrowing
    uint256 constant RESERVE = 5_000_000 ether;

    function run() external {
        uint256 deployerKey    = vm.envUint("PRIVATE_KEY");
        address deployer       = vm.addr(deployerKey);
        address bdxAddress     = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address musdcAddress   = vm.envAddress("NEXT_PUBLIC_MUSDC_ADDRESS");
        address poolAddress    = vm.envAddress("NEXT_PUBLIC_POOL_BDX_MUSDC");

        console.log("===========================================");
        console.log("Bulldex Finance - Lending Deployment");
        console.log("===========================================");
        console.log("Deployer  :", deployer);
        console.log("BDX       :", bdxAddress);
        console.log("MUSDC     :", musdcAddress);
        console.log("Pool oracle:", poolAddress);

        vm.startBroadcast(deployerKey);

        // ── 1. Deploy Lending ─────────────────────────────────────────────────
        Lending lending = new Lending(bdxAddress, musdcAddress, poolAddress, deployer);
        console.log("\n[1/2] Lending deployed:", address(lending));

        // ── 2. Mint MUSDC and fund reserve ───────────────────────────────────
        MockToken musdc = MockToken(musdcAddress);
        musdc.mint(deployer, RESERVE);
        musdc.approve(address(lending), RESERVE);
        lending.fundReserve(RESERVE);
        console.log("[2/2] Reserve funded:", RESERVE / 1e18, "MUSDC");

        vm.stopBroadcast();

        console.log("\n===========================================");
        console.log("LENDING DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("Lending :", address(lending));
        console.log("\nAdd to frontend/.env.local:");
        console.log("NEXT_PUBLIC_LENDING_ADDRESS=", address(lending));
        console.log("\nKey parameters:");
        console.log("  LTV             : 75%");
        console.log("  Liq threshold   : 80%");
        console.log("  Liq bonus       : 5%");
        console.log("  Interest (APR)  : ~5%");
        console.log("  Collateral      : BDX");
        console.log("  Borrow asset    : MUSDC");
    }
}
