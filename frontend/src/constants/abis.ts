/**
 * Bulldex Finance - Contract ABIs
 * Auto-update by running: forge build && cp contracts/out/Token.sol/Token.json frontend/src/constants/
 */

// ─── BDX Token ────────────────────────────────────────────────────────────────
export const TOKEN_ABI = [
  { type: 'function', name: 'name', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_SUPPLY', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'remainingMintable', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'burn', inputs: [{ name: 'value', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'mint', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'Transfer', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'value', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Approval', inputs: [{ name: 'owner', type: 'address', indexed: true }, { name: 'spender', type: 'address', indexed: true }, { name: 'value', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Minted', inputs: [{ name: 'to', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
] as const;

// ─── MockToken (MUSDC) ────────────────────────────────────────────────────────
export const MOCK_TOKEN_ABI = [
  { type: 'function', name: 'name', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'mint', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'faucet', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'Transfer', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'value', type: 'uint256', indexed: false }] },
] as const;

// ─── Pool (AMM) ───────────────────────────────────────────────────────────────
export const POOL_ABI = [
  // Read
  { type: 'function', name: 'token0', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'token1', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'reserve0', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'reserve1', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getReserves', inputs: [], outputs: [{ name: '_reserve0', type: 'uint256' }, { name: '_reserve1', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getPrice0', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getPrice1', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getAmountOut', inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'reserveIn', type: 'uint256' }, { name: 'reserveOut', type: 'uint256' }], outputs: [{ name: 'amountOut', type: 'uint256' }], stateMutability: 'pure' },
  { type: 'function', name: 'getAmountIn', inputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'reserveIn', type: 'uint256' }, { name: 'reserveOut', type: 'uint256' }], outputs: [{ name: 'amountIn', type: 'uint256' }], stateMutability: 'pure' },
  { type: 'function', name: 'getPriceImpact', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'amountIn', type: 'uint256' }], outputs: [{ name: 'impactBps', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'name', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'MINIMUM_LIQUIDITY', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'swap', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'minAmountOut', type: 'uint256' }, { name: 'to', type: 'address' }], outputs: [{ name: 'amountOut', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'addLiquidity', inputs: [{ name: 'amount0Desired', type: 'uint256' }, { name: 'amount1Desired', type: 'uint256' }, { name: 'amount0Min', type: 'uint256' }, { name: 'amount1Min', type: 'uint256' }, { name: 'to', type: 'address' }], outputs: [{ name: 'amount0', type: 'uint256' }, { name: 'amount1', type: 'uint256' }, { name: 'liquidity', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'removeLiquidity', inputs: [{ name: 'liquidity', type: 'uint256' }, { name: 'amount0Min', type: 'uint256' }, { name: 'amount1Min', type: 'uint256' }, { name: 'to', type: 'address' }], outputs: [{ name: 'amount0', type: 'uint256' }, { name: 'amount1', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  // Events
  { type: 'event', name: 'Swap', inputs: [{ name: 'sender', type: 'address', indexed: true }, { name: 'tokenIn', type: 'address', indexed: true }, { name: 'amountIn', type: 'uint256', indexed: false }, { name: 'amountOut', type: 'uint256', indexed: false }, { name: 'to', type: 'address', indexed: true }] },
  { type: 'event', name: 'AddLiquidity', inputs: [{ name: 'provider', type: 'address', indexed: true }, { name: 'amount0', type: 'uint256', indexed: false }, { name: 'amount1', type: 'uint256', indexed: false }, { name: 'lpMinted', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'RemoveLiquidity', inputs: [{ name: 'provider', type: 'address', indexed: true }, { name: 'amount0', type: 'uint256', indexed: false }, { name: 'amount1', type: 'uint256', indexed: false }, { name: 'lpBurned', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Sync', inputs: [{ name: 'reserve0', type: 'uint256', indexed: false }, { name: 'reserve1', type: 'uint256', indexed: false }] },
] as const;

// ─── PoolFactory ──────────────────────────────────────────────────────────────
export const FACTORY_ABI = [
  { type: 'function', name: 'getPool', inputs: [{ name: '', type: 'address' }, { name: '', type: 'address' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'poolFor', inputs: [{ name: 'tokenA', type: 'address' }, { name: 'tokenB', type: 'address' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'allPools', inputs: [{ name: '', type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'allPoolsLength', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'createPool', inputs: [{ name: 'tokenA', type: 'address' }, { name: 'tokenB', type: 'address' }], outputs: [{ name: 'pool', type: 'address' }], stateMutability: 'nonpayable' },
  { type: 'event', name: 'PoolCreated', inputs: [{ name: 'token0', type: 'address', indexed: true }, { name: 'token1', type: 'address', indexed: true }, { name: 'pool', type: 'address', indexed: false }, { name: 'poolCount', type: 'uint256', indexed: false }] },
] as const;

// ─── WETH (Wrapped Ether) ─────────────────────────────────────────────────────
export const WETH_ABI = [
  { type: 'function', name: 'name',     inputs: [], outputs: [{ type: 'string' }],  stateMutability: 'view' },
  { type: 'function', name: 'symbol',   inputs: [], outputs: [{ type: 'string' }],  stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }],   stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'approve',  inputs: [{ name: 'guy', type: 'address' }, { name: 'wad', type: 'uint256' }],  outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }],  outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferFrom', inputs: [{ name: 'src', type: 'address' }, { name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  // WETH-specific
  { type: 'function', name: 'deposit',  inputs: [], outputs: [], stateMutability: 'payable' },
  { type: 'function', name: 'withdraw', inputs: [{ name: 'wad', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event',    name: 'Deposit',    inputs: [{ name: 'dst', type: 'address', indexed: true }, { name: 'wad', type: 'uint256', indexed: false }] },
  { type: 'event',    name: 'Withdrawal', inputs: [{ name: 'src', type: 'address', indexed: true }, { name: 'wad', type: 'uint256', indexed: false }] },
  { type: 'event',    name: 'Transfer',   inputs: [{ name: 'src', type: 'address', indexed: true }, { name: 'dst', type: 'address', indexed: true }, { name: 'wad', type: 'uint256', indexed: false }] },
  { type: 'event',    name: 'Approval',   inputs: [{ name: 'src', type: 'address', indexed: true }, { name: 'guy', type: 'address', indexed: true }, { name: 'wad', type: 'uint256', indexed: false }] },
] as const;

// ─── Lending ──────────────────────────────────────────────────────────────────
export const LENDING_ABI = [
  // Read
  { type: 'function', name: 'positions', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'collateral', type: 'uint256' }, { name: 'borrowed', type: 'uint256' }, { name: 'borrowBlock', type: 'uint256' }, { name: 'interestAccrued', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'healthFactor', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'borrowLimit', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'maxBorrow', type: 'uint256' }, { name: 'currentDebt', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getPosition', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'collateral', type: 'uint256' }, { name: 'borrowed', type: 'uint256' }, { name: 'interest', type: 'uint256' }, { name: 'hf', type: 'uint256' }, { name: 'collateralValueUSD', type: 'uint256' }, { name: 'maxBorrowable', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getBdxPrice', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalCollateral', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalBorrowed', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'reserveBalance', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'LTV_NUMERATOR', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'LIQ_THRESHOLD_NUMERATOR', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'depositCollateral', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawCollateral', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'borrow', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'repay', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'liquidate', inputs: [{ name: 'borrower', type: 'address' }, { name: 'debtToCover', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  // Custom errors — required for frontend to decode revert reasons
  { type: 'error', name: 'InsufficientCollateral', inputs: [] },
  { type: 'error', name: 'InsufficientBorrowBalance', inputs: [] },
  { type: 'error', name: 'ExceedsBorrowLimit', inputs: [] },
  { type: 'error', name: 'PositionHealthy', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  { type: 'error', name: 'InsufficientReserve', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  // Events
  { type: 'event', name: 'CollateralDeposited', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'CollateralWithdrawn', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Borrowed', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Repaid', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'principal', type: 'uint256', indexed: false }, { name: 'interest', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Liquidated', inputs: [{ name: 'liquidator', type: 'address', indexed: true }, { name: 'borrower', type: 'address', indexed: true }, { name: 'debtRepaid', type: 'uint256', indexed: false }, { name: 'collateralSeized', type: 'uint256', indexed: false }] },
] as const;
