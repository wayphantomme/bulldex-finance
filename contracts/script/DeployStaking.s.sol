// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Staking.sol";
import "../src/Token.sol";

/// @title  DeployStaking — Deploy Staking contract and fund initial rewards
/// @notice Requires PRIVATE_KEY and NEXT_PUBLIC_TOKEN_ADDRESS in .env
///
///         Run:
///           forge script contracts/script/DeployStaking.s.sol \
///             --rpc-url $SEPOLIA_RPC_URL \
///             --broadcast \
///             --verify
///
///         After deployment, add to frontend/.env.local:
///           NEXT_PUBLIC_STAKING_ADDRESS=<deployed address>
contract DeployStaking is Script {

    /// @dev Initial reward budget minted to the staking contract (10M BDX)
    uint256 constant INITIAL_REWARDS = 10_000_000 ether;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address tokenAddr   = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");

        console.log("Deployer:     ", deployer);
        console.log("BDX Token:    ", tokenAddr);
        console.log("ETH balance:  ", deployer.balance / 1e18, "ETH");

        vm.startBroadcast(deployerKey);

        // Deploy Staking — same token for staking and rewards (BDX → BDX)
        Staking staking = new Staking(tokenAddr, tokenAddr, deployer);

        console.log("[1/3] Staking deployed:", address(staking));

        // Mint reward budget to deployer and fund the staking contract
        Token(tokenAddr).mint(deployer, INITIAL_REWARDS);
        Token(tokenAddr).approve(address(staking), INITIAL_REWARDS);
        staking.notifyRewardAmount(INITIAL_REWARDS);

        console.log("[2/3] Rewards funded: 10,000,000 BDX over 7 days");

        // Transfer ownership to deployer (already set in constructor)
        console.log("[3/3] Owner:", staking.owner());

        vm.stopBroadcast();

        _printSummary(address(staking), tokenAddr);
    }

    function _printSummary(address stakingAddr, address tokenAddr) internal pure {
        console.log("\n===========================================");
        console.log("STAKING DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("Staking contract:", stakingAddr);
        console.log("Staking token:   ", tokenAddr);
        console.log("Rewards token:   ", tokenAddr);
        console.log("Reward budget:   10,000,000 BDX");
        console.log("Period:          7 days");
        console.log("Base APR:        ~520% (10M BDX / 7 days / initial stake)");
        console.log("\nAdd to frontend/.env.local:");
        console.log("NEXT_PUBLIC_STAKING_ADDRESS=", stakingAddr);
    }
}
