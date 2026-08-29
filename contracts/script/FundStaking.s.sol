// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Staking.sol";
import "../src/Token.sol";

/// @notice Fund an already-deployed Staking contract with a new reward period.
///         Run after the staking contract is deployed but not yet funded.
///
///         forge script contracts/script/FundStaking.s.sol \
///           --rpc-url $SEPOLIA_RPC_URL \
///           --broadcast
contract FundStaking is Script {
    uint256 constant REWARD_BUDGET = 10_000_000 ether;

    function run() external {
        uint256 deployerKey  = vm.envUint("PRIVATE_KEY");
        address deployer     = vm.addr(deployerKey);
        address tokenAddr    = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");
        address stakingAddr  = vm.envAddress("NEXT_PUBLIC_STAKING_ADDRESS");

        console.log("Deployer:", deployer);
        console.log("Token:   ", tokenAddr);
        console.log("Staking: ", stakingAddr);

        vm.startBroadcast(deployerKey);

        Token(tokenAddr).mint(deployer, REWARD_BUDGET);
        Token(tokenAddr).approve(stakingAddr, REWARD_BUDGET);
        Staking(stakingAddr).notifyRewardAmount(REWARD_BUDGET);

        vm.stopBroadcast();

        console.log("Funded 10,000,000 BDX over 7 days");
    }
}
