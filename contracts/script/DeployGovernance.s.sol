// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "../src/Token.sol";
import "../src/BDXGovernor.sol";

/// @title  DeployGovernance — Deploy BDX DAO governance contracts
/// @notice Deploys:
///           1. Token.sol (new, with ERC20Votes) — replaces old BDX token
///           2. TimelockController               — 2-day execution delay
///           3. BDXGovernor                      — on-chain DAO
///
///         Prerequisites:
///           - PRIVATE_KEY in contracts/.env
///           - SEPOLIA_RPC_URL in contracts/.env
///           - ETHERSCAN_KEY in contracts/.env (for verification)
///
///         After deployment:
///           1. Copy printed addresses to frontend/.env.local
///           2. Owner should transfer protocol ownership to TimelockController
///              so governance controls protocol parameters
///
///         Run:
///           forge script script/DeployGovernance.s.sol \
///             --rpc-url $SEPOLIA_RPC_URL \
///             --broadcast \
///             --verify \
///             -vvvv
contract DeployGovernance is Script {

    // ─── Parameters ───────────────────────────────────────────────────────────

    /// @dev Initial BDX supply: 100M — rest minted via governance/vesting
    uint256 constant INITIAL_SUPPLY = 100_000_000 ether;

    /// @dev Timelock minimum delay: 2 days
    uint256 constant TIMELOCK_DELAY = 2 days;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("===========================================");
        console.log("BDX DAO GOVERNANCE DEPLOYMENT");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("ETH balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        vm.startBroadcast(deployerKey);

        // 1. Deploy new Token with ERC20Votes
        Token token = new Token(deployer, INITIAL_SUPPLY);
        console.log("[1/3] BDX Token (ERC20Votes) deployed:", address(token));

        // 2. Deploy TimelockController
        //    - proposers: set to address(0) initially, updated after governor deploy
        //    - executors: address(0) = anyone can execute after delay
        //    - admin:     deployer (revoked after governor is set as proposer)
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(0); // placeholder — updated below
        executors[0] = address(0); // anyone can execute

        TimelockController timelock = new TimelockController(
            TIMELOCK_DELAY,
            proposers,
            executors,
            deployer  // admin — can grant/revoke roles
        );
        console.log("[2/3] TimelockController deployed:", address(timelock));

        // 3. Deploy BDXGovernor
        BDXGovernor governor = new BDXGovernor(
            IVotes(address(token)),
            timelock
        );
        console.log("[3/3] BDXGovernor deployed:", address(governor));

        // 4. Configure Timelock roles
        //    - Grant PROPOSER_ROLE to governor (only governor can queue)
        //    - Grant CANCELLER_ROLE to governor (governor can cancel)
        //    - Revoke admin role from deployer (fully decentralized)
        bytes32 PROPOSER_ROLE  = timelock.PROPOSER_ROLE();
        bytes32 CANCELLER_ROLE = timelock.CANCELLER_ROLE();
        bytes32 TIMELOCK_ADMIN = timelock.DEFAULT_ADMIN_ROLE();

        timelock.grantRole(PROPOSER_ROLE,  address(governor));
        timelock.grantRole(CANCELLER_ROLE, address(governor));
        timelock.revokeRole(TIMELOCK_ADMIN, deployer);

        console.log("[4/4] Timelock roles configured — deployer admin revoked");

        vm.stopBroadcast();

        _printSummary(address(token), address(timelock), address(governor));
    }

    function _printSummary(
        address token,
        address timelock,
        address governor
    ) internal view {
        console.log("");
        console.log("===========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("BDX Token (ERC20Votes):", token);
        console.log("TimelockController:    ", timelock);
        console.log("BDXGovernor:           ", governor);
        console.log("");
        console.log("Add to frontend/.env.local:");
        console.log("NEXT_PUBLIC_TOKEN_ADDRESS=",    token);
        console.log("NEXT_PUBLIC_GOVERNOR_ADDRESS=", governor);
        console.log("NEXT_PUBLIC_TIMELOCK_ADDRESS=", timelock);
        console.log("");
        console.log("IMPORTANT — Next steps:");
        console.log("1. Self-delegate BDX to activate voting power:");
        console.log("   bdxToken.delegate(yourAddress)");
        console.log("2. Update NEXT_PUBLIC_TOKEN_ADDRESS — all existing pools");
        console.log("   use the old token; redeploy pools if needed for testnet.");
        console.log("3. Transfer protocol ownership to Timelock for full DAO control:");
        console.log("   lending.transferOwnership(timelockAddress)");
        console.log("   staking.transferOwnership(timelockAddress)");
    }
}
