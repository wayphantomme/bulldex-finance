// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  WETH — Wrapped Ether (WETH9-style)
/// @notice Standard ERC-20 wrapper for native ETH.
///         deposit() wraps ETH → WETH, withdraw() unwraps WETH → ETH.
///         Compatible with all ERC-20 interfaces — can be used in AMM pools.
contract WETH {
    string public constant name     = "Wrapped Ether";
    string public constant symbol   = "WETH";
    uint8  public constant decimals = 18;

    // ─── Events ───────────────────────────────────────────────────────────────
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);
    event Transfer(address indexed src, address indexed dst, uint256 wad);
    event Approval(address indexed src, address indexed guy, uint256 wad);

    // ─── State ────────────────────────────────────────────────────────────────
    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ─── Core ────────────────────────────────────────────────────────────────

    /// @notice Wrap ETH → WETH. Caller sends ETH, receives equal WETH.
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Unwrap WETH → ETH.
    /// @param wad Amount of WETH to unwrap (in wei)
    function withdraw(uint256 wad) public {
        require(balanceOf[msg.sender] >= wad, "WETH: insufficient balance");
        balanceOf[msg.sender] -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    /// @notice Receive ETH directly — calls deposit()
    receive() external payable {
        deposit();
    }

    // ─── ERC-20 ───────────────────────────────────────────────────────────────

    function totalSupply() public view returns (uint256) {
        return address(this).balance;
    }

    function approve(address guy, uint256 wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint256 wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint256 wad) public returns (bool) {
        require(balanceOf[src] >= wad, "WETH: insufficient balance");

        if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
            require(allowance[src][msg.sender] >= wad, "WETH: insufficient allowance");
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;
        emit Transfer(src, dst, wad);
        return true;
    }
}
