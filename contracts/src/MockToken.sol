// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title  MockToken — Testnet ERC20 with open mint
/// @notice Anyone can mint — for Sepolia testnet only.
///         Used as the second token (e.g. mock USDC) in BDX/MOCK pools.
/// @dev    NEVER deploy to mainnet.
contract MockToken is ERC20 {
    uint8 private immutable _decimals;

    /// @param name_     Token name (e.g. "Mock USDC")
    /// @param symbol_   Token symbol (e.g. "MUSDC")
    /// @param decimals_ Decimal places (6 for USDC-like, 18 for standard)
    constructor(string memory name_, string memory symbol_, uint8 decimals_)
        ERC20(name_, symbol_)
    {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint tokens to any address — open for testnet use
    /// @param to     Recipient address
    /// @param amount Amount in token's smallest unit
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Convenience: mint to caller
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
