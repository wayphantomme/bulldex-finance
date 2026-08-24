// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";

/// @title  DeployScript — Deploy Bulldex Finance contracts to target network
/// @author Phantom (@wayphantomme)
/// @notice Run via: make deploy-sepolia
contract DeployScript is Script {
    // ─── Config ───────────────────────────────────────────────────────────────

    /// @dev Initial BDX supply sent to deployer: 100 million tokens
    uint256 constant INITIAL_SUPPLY = 100_000_000 ether;

    // ─── Run ──────────────────────────────────────────────────────────────────

    function run() external {
        // Read deployer private key from environment
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

        // Deploy BDX Token
        Token token = new Token(deployer, INITIAL_SUPPLY);

        vm.stopBroadcast();

        // ─── Post-deploy logs ─────────────────────────────────────────────────
        console.log("");
        console.log("BDX Token deployed!");
        console.log("  Address     :", address(token));
        console.log("  Name        :", token.name());
        console.log("  Symbol      :", token.symbol());
        console.log("  Decimals    :", token.decimals());
        console.log("  Total Supply:", token.totalSupply() / 1e18, "BDX");
        console.log("  Max Supply  :", token.MAX_SUPPLY() / 1e18, "BDX");
        console.log("  Owner       :", token.owner());
        console.log("");
        console.log("Next steps:");
        console.log("  1. Copy contract address to frontend/.env.local");
        console.log("  2. Set NEXT_PUBLIC_TOKEN_ADDRESS =", address(token));
        console.log("  3. Verify: forge verify-contract", address(token), "Token --chain-id 11155111");
        console.log("  4. Check:  https://sepolia.etherscan.io/address/", address(token));
    }
}
