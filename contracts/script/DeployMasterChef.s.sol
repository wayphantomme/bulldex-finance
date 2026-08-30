// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MasterChef.sol";
import "../src/Token.sol";

/// @title  DeployMasterChef — Deploy MasterChef farming contract
/// @notice Deploys MasterChef, registers initial pools, and funds reward budget.
///
///         Requires in contracts/.env:
///           PRIVATE_KEY
///           NEXT_PUBLIC_TOKEN_ADDRESS
///           NEXT_PUBLIC_POOL_BDX_MUSDC
///           NEXT_PUBLIC_POOL_BDX_WETH
///
///         Run:
///           forge script contracts/script/DeployMasterChef.s.sol \
///             --rpc-url $SEPOLIA_RPC_URL \
///             --broadcast \
///             --verify
///
///         After deployment, add to frontend/.env.local:
///           NEXT_PUBLIC_MASTERCHEF_ADDRESS=<deployed address>
contract DeployMasterChef is Script {

    // ─── Config ───────────────────────────────────────────────────────────────

    /// @dev Pre-mint reward budget sent to MasterChef (10M BDX)
    uint256 constant FARMING_BUDGET = 10_000_000 ether;

    /// @dev BDX emitted per block across all pools
    ///      ~0.1 BDX/block on Sepolia (~12s blocks) ≈ 720 BDX/day ≈ 262,800 BDX/year
    ///      Adjust before mainnet based on target emissions schedule
    uint256 constant BDX_PER_BLOCK = 0.1 ether;

    /// @dev Allocation points for initial pools
    uint256 constant ALLOC_BDX_MUSDC = 100; // 62.5% of emissions
    uint256 constant ALLOC_BDX_WETH  = 60;  // 37.5% of emissions

    // ─── Run ──────────────────────────────────────────────────────────────────

    function run() external {
        uint256 deployerKey   = vm.envUint("PRIVATE_KEY");
        address deployer      = vm.addr(deployerKey);
        address tokenAddr     = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address poolBdxMusdc  = vm.envAddress("NEXT_PUBLIC_POOL_BDX_MUSDC");
        address poolBdxWeth   = vm.envAddress("NEXT_PUBLIC_POOL_BDX_WETH");

        console.log("Deployer:          ", deployer);
        console.log("BDX Token:         ", tokenAddr);
        console.log("Pool BDX/MUSDC:    ", poolBdxMusdc);
        console.log("Pool BDX/WETH:     ", poolBdxWeth);
        console.log("ETH balance:       ", deployer.balance / 1e18, "ETH");

        vm.startBroadcast(deployerKey);

        // 1. Deploy MasterChef — starts at current block
        MasterChef masterChef = new MasterChef(
            tokenAddr,
            BDX_PER_BLOCK,
            block.number,
            deployer
        );
        console.log("[1/4] MasterChef deployed:", address(masterChef));

        // 2. Register initial farming pools
        //    PID 0: BDX/MUSDC LP — highest weight
        masterChef.add(ALLOC_BDX_MUSDC, IERC20(poolBdxMusdc), false);
        console.log("[2/4] Pool 0 added: BDX/MUSDC LP (allocPoint =", ALLOC_BDX_MUSDC, ")");

        //    PID 1: BDX/WETH LP
        masterChef.add(ALLOC_BDX_WETH, IERC20(poolBdxWeth), false);
        console.log("[2/4] Pool 1 added: BDX/WETH LP  (allocPoint =", ALLOC_BDX_WETH, ")");

        // 3. Mint farming budget to deployer, then transfer to MasterChef
        Token(tokenAddr).mint(deployer, FARMING_BUDGET);
        Token(tokenAddr).transfer(address(masterChef), FARMING_BUDGET);
        console.log("[3/4] Funded MasterChef with 10,000,000 BDX");

        // 4. Verify reward balance
        uint256 rewardBal = masterChef.rewardBalance();
        console.log("[4/4] MasterChef reward balance:", rewardBal / 1e18, "BDX");

        vm.stopBroadcast();

        _printSummary(address(masterChef), tokenAddr, poolBdxMusdc, poolBdxWeth);
    }

    function _printSummary(
        address masterChefAddr,
        address tokenAddr,
        address poolBdxMusdc,
        address poolBdxWeth
    ) internal pure {
        console.log("\n===========================================");
        console.log("MASTERCHEF DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("MasterChef:        ", masterChefAddr);
        console.log("BDX Token:         ", tokenAddr);
        console.log("Pool 0 (BDX/MUSDC):", poolBdxMusdc);
        console.log("Pool 1 (BDX/WETH): ", poolBdxWeth);
        console.log("BDX per block:     0.1 BDX");
        console.log("Farming budget:    10,000,000 BDX");
        console.log("Est. duration:     ~138 years at 0.1/block (adjust bdxPerBlock)");
        console.log("\nAdd to frontend/.env.local:");
        console.log("NEXT_PUBLIC_MASTERCHEF_ADDRESS=", masterChefAddr);
    }
}
