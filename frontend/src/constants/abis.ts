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

// ─── Staking ──────────────────────────────────────────────────────────────────
export const STAKING_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  { type: 'function', name: 'stakingToken',          inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardsToken',          inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardsDuration',       inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'periodFinish',          inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardRate',            inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'lastUpdateTime',        inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardPerTokenStored',  inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalEffectiveStake',   inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardPerToken',        inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'lastTimeRewardApplicable', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'earned',    inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'stakers',   inputs: [{ name: 'user', type: 'address' }], outputs: [
    { name: 'amount',              type: 'uint256' },
    { name: 'effectiveAmount',     type: 'uint256' },
    { name: 'lockEnd',             type: 'uint256' },
    { name: 'lockDays',            type: 'uint256' },
    { name: 'rewardPerTokenPaid',  type: 'uint256' },
    { name: 'pendingRewards',      type: 'uint256' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'getStakeInfo', inputs: [{ name: 'user', type: 'address' }], outputs: [
    { name: 'amount',        type: 'uint256' },
    { name: 'lockEnd',       type: 'uint256' },
    { name: 'lockDays',      type: 'uint256' },
    { name: 'lockMultiplier', type: 'uint256' },
    { name: 'pendingRewards', type: 'uint256' },
    { name: 'isLocked',      type: 'bool' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'estimatedAPR', inputs: [{ name: 'lockDays', type: 'uint256' }], outputs: [{ name: 'aprBps', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'PRECISION',          inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MULTIPLIER_NONE',    inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MULTIPLIER_30DAYS',  inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MULTIPLIER_90DAYS',  inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MULTIPLIER_180DAYS', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  // ── Write ─────────────────────────────────────────────────────────────────
  { type: 'function', name: 'stake',              inputs: [{ name: 'amount', type: 'uint256' }, { name: 'lockDays', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'unstake',            inputs: [{ name: 'amount', type: 'uint256' }],  outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'claimRewards',       inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'emergencyWithdraw',  inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'notifyRewardAmount', inputs: [{ name: 'reward', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setRewardsDuration', inputs: [{ name: 'duration', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  // ── Custom Errors ─────────────────────────────────────────────────────────
  { type: 'error', name: 'ZeroAmount',       inputs: [] },
  { type: 'error', name: 'ZeroAddress',      inputs: [] },
  { type: 'error', name: 'StillLocked',      inputs: [{ name: 'unlockTime', type: 'uint256' }] },
  { type: 'error', name: 'NothingStaked',    inputs: [] },
  { type: 'error', name: 'NothingToClaim',   inputs: [] },
  { type: 'error', name: 'PeriodNotFinished', inputs: [] },
  { type: 'error', name: 'InvalidLockDays',  inputs: [] },
  { type: 'error', name: 'ZeroRewardRate',   inputs: [] },
  // ── Events ────────────────────────────────────────────────────────────────
  { type: 'event', name: 'Staked',          inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'lockDays', type: 'uint256', indexed: false }, { name: 'lockEnd', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Unstaked',        inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'RewardsClaimed',  inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'RewardAdded',     inputs: [{ name: 'reward', type: 'uint256', indexed: false }, { name: 'periodFinish', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'EmergencyWithdraw', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'RewardsDurationUpdated', inputs: [{ name: 'newDuration', type: 'uint256', indexed: false }] },
] as const;

// ─── TokenVesting ─────────────────────────────────────────────────────────────
export const VESTING_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  { type: 'function', name: 'token',          inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'totalLocked',    inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'beneficiaryCount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'beneficiaries',  inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'schedules', inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [
    { name: 'beneficiary',  type: 'address' },
    { name: 'start',        type: 'uint256' },
    { name: 'cliff',        type: 'uint256' },
    { name: 'duration',     type: 'uint256' },
    { name: 'totalAmount',  type: 'uint256' },
    { name: 'released',     type: 'uint256' },
    { name: 'revoked',      type: 'bool' },
    { name: 'exists',       type: 'bool' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'computeReleasableAmount', inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getVestedAmount',         inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getScheduleInfo', inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [
    { name: 'totalAmount',  type: 'uint256' },
    { name: 'released',     type: 'uint256' },
    { name: 'releasable',   type: 'uint256' },
    { name: 'vested',       type: 'uint256' },
    { name: 'unvested',     type: 'uint256' },
    { name: 'cliffEnd',     type: 'uint256' },
    { name: 'vestEnd',      type: 'uint256' },
    { name: 'isRevoked',    type: 'bool' },
    { name: 'cliffPassed',  type: 'bool' },
    { name: 'progressBps',  type: 'uint256' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  // ── Write ─────────────────────────────────────────────────────────────────
  { type: 'function', name: 'createVestingSchedule', inputs: [
    { name: 'beneficiary', type: 'address' },
    { name: 'start',       type: 'uint256' },
    { name: 'cliff',       type: 'uint256' },
    { name: 'duration',    type: 'uint256' },
    { name: 'totalAmount', type: 'uint256' },
  ], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'release', inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'revoke',  inputs: [{ name: 'beneficiary', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  // ── Custom Errors ─────────────────────────────────────────────────────────
  { type: 'error', name: 'ScheduleAlreadyExists', inputs: [{ name: 'beneficiary', type: 'address' }] },
  { type: 'error', name: 'ScheduleNotFound',       inputs: [{ name: 'beneficiary', type: 'address' }] },
  { type: 'error', name: 'ScheduleAlreadyRevoked', inputs: [{ name: 'beneficiary', type: 'address' }] },
  { type: 'error', name: 'NothingToRelease',       inputs: [] },
  { type: 'error', name: 'ZeroAmount',             inputs: [] },
  { type: 'error', name: 'ZeroAddress',            inputs: [] },
  { type: 'error', name: 'InvalidDuration',        inputs: [] },
  { type: 'error', name: 'InsufficientContractBalance', inputs: [{ name: 'required', type: 'uint256' }, { name: 'available', type: 'uint256' }] },
  // ── Events ────────────────────────────────────────────────────────────────
  { type: 'event', name: 'ScheduleCreated', inputs: [
    { name: 'beneficiary', type: 'address', indexed: true },
    { name: 'totalAmount', type: 'uint256', indexed: false },
    { name: 'start',       type: 'uint256', indexed: false },
    { name: 'cliff',       type: 'uint256', indexed: false },
    { name: 'duration',    type: 'uint256', indexed: false },
  ]},
  { type: 'event', name: 'TokensReleased', inputs: [
    { name: 'beneficiary', type: 'address', indexed: true },
    { name: 'amount',      type: 'uint256', indexed: false },
  ]},
  { type: 'event', name: 'ScheduleRevoked', inputs: [
    { name: 'beneficiary',      type: 'address', indexed: true },
    { name: 'unvestedReturned', type: 'uint256', indexed: false },
  ]},
] as const;

// ─── MasterChef ───────────────────────────────────────────────────────────────
export const MASTERCHEF_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  { type: 'function', name: 'bdx',              inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'bdxPerBlock',      inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'startBlock',       inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalAllocPoint',  inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'poolLength',       inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardBalance',    inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'owner',            inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'poolInfo', inputs: [{ name: 'pid', type: 'uint256' }], outputs: [
    { name: 'lpToken',         type: 'address' },
    { name: 'allocPoint',      type: 'uint256' },
    { name: 'lastRewardBlock', type: 'uint256' },
    { name: 'accBDXPerShare',  type: 'uint256' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'userInfo', inputs: [{ name: 'pid', type: 'uint256' }, { name: 'user', type: 'address' }], outputs: [
    { name: 'amount',      type: 'uint256' },
    { name: 'rewardDebt',  type: 'uint256' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'pendingBDX', inputs: [{ name: 'pid', type: 'uint256' }, { name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // ── Write ─────────────────────────────────────────────────────────────────
  { type: 'function', name: 'deposit',          inputs: [{ name: 'pid', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdraw',         inputs: [{ name: 'pid', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'harvest',          inputs: [{ name: 'pid', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'harvestAll',       inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'emergencyWithdraw', inputs: [{ name: 'pid', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'massUpdatePools',  inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'updatePool',       inputs: [{ name: 'pid', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'add',  inputs: [{ name: 'allocPoint', type: 'uint256' }, { name: 'lpToken', type: 'address' }, { name: 'withUpdate', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'set',  inputs: [{ name: 'pid', type: 'uint256' }, { name: 'allocPoint', type: 'uint256' }, { name: 'withUpdate', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setBdxPerBlock', inputs: [{ name: '_bdxPerBlock', type: 'uint256' }, { name: 'withUpdate', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  // ── Custom Errors ─────────────────────────────────────────────────────────
  { type: 'error', name: 'ZeroAmount',      inputs: [] },
  { type: 'error', name: 'ZeroAddress',     inputs: [] },
  { type: 'error', name: 'InvalidPool',     inputs: [{ name: 'pid', type: 'uint256' }] },
  { type: 'error', name: 'DuplicatePool',   inputs: [{ name: 'lpToken', type: 'address' }] },
  { type: 'error', name: 'FarmNotStarted',  inputs: [] },
  // ── Events ────────────────────────────────────────────────────────────────
  { type: 'event', name: 'Deposit',          inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'pid', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Withdraw',         inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'pid', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Harvest',          inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'pid', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'EmergencyWithdraw', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'pid', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'PoolAdded',        inputs: [{ name: 'pid', type: 'uint256', indexed: true }, { name: 'lpToken', type: 'address', indexed: true }, { name: 'allocPoint', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'PoolUpdated',      inputs: [{ name: 'pid', type: 'uint256', indexed: true }, { name: 'allocPoint', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'BdxPerBlockUpdated', inputs: [{ name: 'oldRate', type: 'uint256', indexed: false }, { name: 'newRate', type: 'uint256', indexed: false }] },
] as const;

// ─── BDX Token (ERC20Votes — v2, governance-enabled) ─────────────────────────
// Extends TOKEN_ABI with ERC20Votes delegation functions.
// Use this ABI after redeploying Token.sol with ERC20Votes support.
export const TOKEN_VOTES_ABI = [
  ...TOKEN_ABI,
  // ERC20Votes — delegation
  { type: 'function', name: 'delegate',       inputs: [{ name: 'delegatee', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'delegates',      inputs: [{ name: 'account',   type: 'address' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'getVotes',       inputs: [{ name: 'account',   type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getPastVotes',   inputs: [{ name: 'account', type: 'address' }, { name: 'timepoint', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getPastTotalSupply', inputs: [{ name: 'timepoint', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'delegateBySig',  inputs: [
    { name: 'delegatee', type: 'address' },
    { name: 'nonce',     type: 'uint256' },
    { name: 'expiry',    type: 'uint256' },
    { name: 'v',         type: 'uint8'   },
    { name: 'r',         type: 'bytes32' },
    { name: 's',         type: 'bytes32' },
  ], outputs: [], stateMutability: 'nonpayable' },
  // ERC20Votes — events
  { type: 'event', name: 'DelegateChanged', inputs: [
    { name: 'delegator',    type: 'address', indexed: true },
    { name: 'fromDelegate', type: 'address', indexed: true },
    { name: 'toDelegate',   type: 'address', indexed: true },
  ]},
  { type: 'event', name: 'DelegateVotesChanged', inputs: [
    { name: 'delegate',    type: 'address', indexed: true },
    { name: 'previousVotes', type: 'uint256', indexed: false },
    { name: 'newVotes',      type: 'uint256', indexed: false },
  ]},
] as const;

// ─── BDXGovernor ──────────────────────────────────────────────────────────────
export const GOVERNOR_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  { type: 'function', name: 'name',              inputs: [], outputs: [{ type: 'string'  }], stateMutability: 'view' },
  { type: 'function', name: 'version',           inputs: [], outputs: [{ type: 'string'  }], stateMutability: 'view' },
  { type: 'function', name: 'votingDelay',        inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'votingPeriod',       inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalThreshold',  inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'quorum',             inputs: [{ name: 'blockNumber', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Proposal lifecycle
  { type: 'function', name: 'state',             inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalSnapshot',  inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalDeadline',  inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalProposer',  inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalEta',       inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalNeedsQueuing', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  // Votes
  { type: 'function', name: 'proposalVotes', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [
    { name: 'againstVotes', type: 'uint256' },
    { name: 'forVotes',     type: 'uint256' },
    { name: 'abstainVotes', type: 'uint256' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'hasVoted',     inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'account', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getVotes',     inputs: [{ name: 'account', type: 'address' }, { name: 'timepoint', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'hashProposal', inputs: [
    { name: 'targets',         type: 'address[]' },
    { name: 'values',          type: 'uint256[]' },
    { name: 'calldatas',       type: 'bytes[]'   },
    { name: 'descriptionHash', type: 'bytes32'   },
  ], outputs: [{ type: 'uint256' }], stateMutability: 'pure' },
  // ── Write ─────────────────────────────────────────────────────────────────
  { type: 'function', name: 'propose', inputs: [
    { name: 'targets',     type: 'address[]' },
    { name: 'values',      type: 'uint256[]' },
    { name: 'calldatas',   type: 'bytes[]'   },
    { name: 'description', type: 'string'    },
  ], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'castVote', inputs: [
    { name: 'proposalId', type: 'uint256' },
    { name: 'support',    type: 'uint8'   },
  ], outputs: [{ name: 'weight', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'castVoteWithReason', inputs: [
    { name: 'proposalId', type: 'uint256' },
    { name: 'support',    type: 'uint8'   },
    { name: 'reason',     type: 'string'  },
  ], outputs: [{ name: 'weight', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'queue', inputs: [
    { name: 'targets',         type: 'address[]' },
    { name: 'values',          type: 'uint256[]' },
    { name: 'calldatas',       type: 'bytes[]'   },
    { name: 'descriptionHash', type: 'bytes32'   },
  ], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'execute', inputs: [
    { name: 'targets',         type: 'address[]' },
    { name: 'values',          type: 'uint256[]' },
    { name: 'calldatas',       type: 'bytes[]'   },
    { name: 'descriptionHash', type: 'bytes32'   },
  ], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'payable' },
  { type: 'function', name: 'cancel', inputs: [
    { name: 'targets',         type: 'address[]' },
    { name: 'values',          type: 'uint256[]' },
    { name: 'calldatas',       type: 'bytes[]'   },
    { name: 'descriptionHash', type: 'bytes32'   },
  ], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  // ── Events ────────────────────────────────────────────────────────────────
  { type: 'event', name: 'ProposalCreated', inputs: [
    { name: 'proposalId',  type: 'uint256',   indexed: false },
    { name: 'proposer',    type: 'address',   indexed: false },
    { name: 'targets',     type: 'address[]', indexed: false },
    { name: 'values',      type: 'uint256[]', indexed: false },
    { name: 'signatures',  type: 'string[]',  indexed: false },
    { name: 'calldatas',   type: 'bytes[]',   indexed: false },
    { name: 'voteStart',   type: 'uint256',   indexed: false },
    { name: 'voteEnd',     type: 'uint256',   indexed: false },
    { name: 'description', type: 'string',    indexed: false },
  ]},
  { type: 'event', name: 'ProposalQueued',   inputs: [{ name: 'proposalId', type: 'uint256', indexed: false }, { name: 'etaSeconds', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'ProposalExecuted', inputs: [{ name: 'proposalId', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'ProposalCanceled', inputs: [{ name: 'proposalId', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'VoteCast', inputs: [
    { name: 'voter',      type: 'address', indexed: true  },
    { name: 'proposalId', type: 'uint256', indexed: false },
    { name: 'support',    type: 'uint8',   indexed: false },
    { name: 'weight',     type: 'uint256', indexed: false },
    { name: 'reason',     type: 'string',  indexed: false },
  ]},
  { type: 'event', name: 'VoteCastWithParams', inputs: [
    { name: 'voter',      type: 'address', indexed: true  },
    { name: 'proposalId', type: 'uint256', indexed: false },
    { name: 'support',    type: 'uint8',   indexed: false },
    { name: 'weight',     type: 'uint256', indexed: false },
    { name: 'reason',     type: 'string',  indexed: false },
    { name: 'params',     type: 'bytes',   indexed: false },
  ]},
] as const;

// ─── TimelockController ───────────────────────────────────────────────────────
export const TIMELOCK_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  { type: 'function', name: 'getMinDelay',        inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'isOperation',        inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isOperationPending', inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isOperationReady',   inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isOperationDone',    inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getTimestamp',       inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getOperationState',  inputs: [{ name: 'id', type: 'bytes32' }], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'hasRole',  inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'PROPOSER_ROLE',  inputs: [], outputs: [{ type: 'bytes32' }], stateMutability: 'view' },
  { type: 'function', name: 'EXECUTOR_ROLE',  inputs: [], outputs: [{ type: 'bytes32' }], stateMutability: 'view' },
  { type: 'function', name: 'CANCELLER_ROLE', inputs: [], outputs: [{ type: 'bytes32' }], stateMutability: 'view' },
  // ── Events ────────────────────────────────────────────────────────────────
  { type: 'event', name: 'CallScheduled', inputs: [
    { name: 'id',           type: 'bytes32', indexed: true  },
    { name: 'index',        type: 'uint256', indexed: true  },
    { name: 'target',       type: 'address', indexed: false },
    { name: 'value',        type: 'uint256', indexed: false },
    { name: 'data',         type: 'bytes',   indexed: false },
    { name: 'predecessor',  type: 'bytes32', indexed: false },
    { name: 'delay',        type: 'uint256', indexed: false },
  ]},
  { type: 'event', name: 'CallExecuted', inputs: [
    { name: 'id',     type: 'bytes32', indexed: true  },
    { name: 'index',  type: 'uint256', indexed: true  },
    { name: 'target', type: 'address', indexed: false },
    { name: 'value',  type: 'uint256', indexed: false },
    { name: 'data',   type: 'bytes',   indexed: false },
  ]},
  { type: 'event', name: 'Cancelled', inputs: [{ name: 'id', type: 'bytes32', indexed: true }] },
  { type: 'event', name: 'MinDelayChange', inputs: [{ name: 'oldDuration', type: 'uint256', indexed: false }, { name: 'newDuration', type: 'uint256', indexed: false }] },
] as const;
