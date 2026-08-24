// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/// @title  PoolFactory — Bulldex Finance AMM Pool Registry
/// @author Phantom (@wayphantomme)
/// @notice Deploys and tracks all BDX AMM pools.
///         Each token pair can only have one pool.
contract PoolFactory {
    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice token0 => token1 => pool address (canonical order: lower addr = token0)
    mapping(address => mapping(address => address)) public getPool;

    /// @notice All deployed pool addresses
    address[] public allPools;

    // ─── Events ───────────────────────────────────────────────────────────────

    event PoolCreated(
        address indexed token0,
        address indexed token1,
        address pool,
        uint256 poolCount
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error IdenticalTokens();
    error ZeroAddress();
    error PoolExists();

    // ─── External ─────────────────────────────────────────────────────────────

    /// @notice Deploy a new Pool for a token pair.
    ///         Tokens are sorted so token0 < token1 by address.
    ///
    /// @param tokenA First token (any order)
    /// @param tokenB Second token (any order)
    /// @return pool  Address of the newly created pool
    function createPool(address tokenA, address tokenB) external returns (address pool) {
        if (tokenA == tokenB) revert IdenticalTokens();
        if (tokenA == address(0) || tokenB == address(0)) revert ZeroAddress();

        // Sort tokens for canonical order
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        if (getPool[t0][t1] != address(0)) revert PoolExists();

        // Build LP token name/symbol from token symbols
        string memory name = string.concat(
            "Bulldex ",
            _symbol(t0),
            "/",
            _symbol(t1),
            " LP"
        );
        string memory symbol = string.concat(_symbol(t0), "-", _symbol(t1), "-LP");

        // Deploy pool
        pool = address(new Pool(t0, t1, name, symbol));

        // Register
        getPool[t0][t1] = pool;
        getPool[t1][t0] = pool; // bidirectional lookup
        allPools.push(pool);

        emit PoolCreated(t0, t1, pool, allPools.length);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    /// @notice Total number of deployed pools
    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    /// @notice Look up pool for any token order
    function poolFor(address tokenA, address tokenB) external view returns (address) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return getPool[t0][t1];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Try to read the symbol() from a token, fallback to "???"
    function _symbol(address token) internal view returns (string memory) {
        try IERC20Metadata(token).symbol() returns (string memory sym) {
            return sym;
        } catch {
            return "???";
        }
    }
}
