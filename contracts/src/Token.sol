// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  BDX Token — Bulldex Finance governance and utility token
/// @author Phantom (@wayphantomme)
/// @notice ERC20 token with mint/burn, EIP-2612 permit, and owner-controlled minting
contract Token is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Maximum total supply cap: 1 billion BDX
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when new tokens are minted by the owner
    event Minted(address indexed to, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice Thrown when a mint would exceed MAX_SUPPLY
    error ExceedsMaxSupply(uint256 requested, uint256 available);

    /// @notice Thrown when minting to the zero address
    error MintToZeroAddress();

    /// @notice Thrown when mint amount is zero
    error MintAmountZero();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param initialOwner Address that receives owner role and initial supply
    /// @param initialSupply Amount of BDX minted to initialOwner on deploy (in wei)
    constructor(address initialOwner, uint256 initialSupply)
        ERC20("Bulldex Finance", "BDX")
        ERC20Permit("Bulldex Finance")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert MintToZeroAddress();
        if (initialSupply > 0) {
            _mintChecked(initialOwner, initialSupply);
        }
    }

    // ─── External / Owner ─────────────────────────────────────────────────────

    /// @notice Mint new BDX tokens. Only callable by owner.
    /// @param to      Recipient address
    /// @param amount  Amount of tokens to mint (in wei, 18 decimals)
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert MintToZeroAddress();
        if (amount == 0) revert MintAmountZero();
        _mintChecked(to, amount);
    }

    // ─── Public view ──────────────────────────────────────────────────────────

    /// @notice Returns remaining mintable supply before hitting MAX_SUPPLY
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Validates supply cap before minting
    function _mintChecked(address to, uint256 amount) internal {
        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) revert ExceedsMaxSupply(amount, available);
        _mint(to, amount);
        emit Minted(to, amount);
    }
}
