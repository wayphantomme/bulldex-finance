// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TokenVesting.sol";
import "../src/Token.sol";

/// @title  DeployVesting — Deploy TokenVesting and create initial schedules
/// @notice Creates vesting schedules for team, seed investors, and ecosystem.
///
///         forge script contracts/script/DeployVesting.s.sol \
///           --rpc-url $SEPOLIA_RPC_URL \
///           --broadcast \
///           --slow
///
///         After deployment, add to frontend/.env.local:
///           NEXT_PUBLIC_VESTING_ADDRESS=<deployed address>
contract DeployVesting is Script {

    // ── Allocations (match tokenomics in VESTING.md) ──────────────────────────
    uint256 constant TEAM_AMOUNT       = 150_000_000 ether;  // 15%
    uint256 constant SEED_AMOUNT       =  40_000_000 ether;  // 4%
    uint256 constant ECOSYSTEM_AMOUNT  = 160_000_000 ether;  // 16%
    uint256 constant TOTAL_VEST_BUDGET = TEAM_AMOUNT + SEED_AMOUNT + ECOSYSTEM_AMOUNT;

    // ── Vesting parameters ───────────────────────────────────────────────────
    uint256 constant YEAR  = 365 days;
    uint256 constant MONTH = 30 days;

    function run() external {
        uint256 deployerKey   = vm.envUint("PRIVATE_KEY");
        address deployer      = vm.addr(deployerKey);
        address tokenAddr     = vm.envAddress("NEXT_PUBLIC_TOKEN_ADDRESS");

        // Beneficiary wallets — on testnet use deterministic derived addresses
        // so each beneficiary is unique. Replace with real wallets for mainnet.
        address teamWallet      = deployer;                          // deployer = "team"
        address seedWallet      = address(uint160(deployer) + 1);   // deployer+1 = "seed"
        address ecosystemWallet = address(uint160(deployer) + 2);   // deployer+2 = "ecosystem"

        console.log("Deployer:   ", deployer);
        console.log("BDX Token:  ", tokenAddr);
        console.log("Budget:      350,000,000 BDX");

        vm.startBroadcast(deployerKey);

        // 1. Deploy TokenVesting
        TokenVesting vestingContract = new TokenVesting(tokenAddr, deployer);
        console.log("[1/5] TokenVesting deployed:", address(vestingContract));

        // 2. Mint total vesting budget to deployer
        Token(tokenAddr).mint(deployer, TOTAL_VEST_BUDGET);
        console.log("[2/5] Minted 350M BDX to deployer");

        // 3. Approve vesting contract to pull tokens
        Token(tokenAddr).approve(address(vestingContract), TOTAL_VEST_BUDGET);
        console.log("[3/5] Approved vesting contract");

        uint256 start = block.timestamp;

        // 4. Team: 150M BDX — 12 month cliff, 36 month linear
        vestingContract.createVestingSchedule(
            teamWallet,
            start,
            12 * MONTH,   // cliff
            36 * MONTH,   // duration
            TEAM_AMOUNT
        );
        console.log("[4/5] Team schedule created: 150M BDX, 12mo cliff, 36mo linear");

        // 5a. Seed: 40M BDX — 6 month cliff, 18 month linear
        vestingContract.createVestingSchedule(
            seedWallet,
            start,
            6 * MONTH,
            18 * MONTH,
            SEED_AMOUNT
        );
        console.log("[5/5a] Seed schedule: 40M BDX, 6mo cliff, 18mo linear");

        // 5b. Ecosystem: 160M BDX — 3 month cliff, 24 month linear
        vestingContract.createVestingSchedule(
            ecosystemWallet,
            start,
            3 * MONTH,
            24 * MONTH,
            ECOSYSTEM_AMOUNT
        );
        console.log("[5/5b] Ecosystem schedule: 160M BDX, 3mo cliff, 24mo linear");

        vm.stopBroadcast();

        _printSummary(address(vestingContract));
    }

    function _printSummary(address vestingAddr) internal pure {
        console.log("\n============================================");
        console.log("VESTING DEPLOYMENT COMPLETE");
        console.log("============================================");
        console.log("TokenVesting:", vestingAddr);
        console.log("\nSchedules created:");
        console.log("  Team:      150M BDX | 12mo cliff | 36mo linear");
        console.log("  Seed:       40M BDX |  6mo cliff | 18mo linear");
        console.log("  Ecosystem: 160M BDX |  3mo cliff | 24mo linear");
        console.log("\nAdd to frontend/.env.local:");
        console.log("NEXT_PUBLIC_VESTING_ADDRESS=", vestingAddr);
    }
}
