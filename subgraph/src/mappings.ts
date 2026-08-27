import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  Swap as SwapEvent,
  AddLiquidity as AddLiquidityEvent,
  RemoveLiquidity as RemoveLiquidityEvent,
} from '../generated/PoolBdxMusdc/Pool';
import { Pool, Swap, LiquidityEvent, User, Protocol } from '../generated/schema';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROTOCOL_ID = 'bulldex';
const EIGHTEEN_DECIMALS = BigDecimal.fromString('1000000000000000000'); // 1e18

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDecimal(value: BigInt): BigDecimal {
  return value.toBigDecimal().div(EIGHTEEN_DECIMALS);
}

function loadOrCreatePool(address: Bytes, timestamp: BigInt): Pool {
  let id = address.toHexString();
  let pool = Pool.load(id);
  if (!pool) {
    pool = new Pool(id);
    pool.token0 = Bytes.fromHexString('0x0000000000000000000000000000000000000000');
    pool.token1 = Bytes.fromHexString('0x0000000000000000000000000000000000000000');
    pool.reserve0 = BigDecimal.zero();
    pool.reserve1 = BigDecimal.zero();
    pool.totalSwaps = 0;
    pool.totalVolumeToken0 = BigDecimal.zero();
    pool.totalVolumeToken1 = BigDecimal.zero();
    pool.txCount = 0;
    pool.createdAt = timestamp;
    pool.updatedAt = timestamp;
    pool.save();

    // Init protocol if needed
    let protocol = Protocol.load(PROTOCOL_ID);
    if (!protocol) {
      protocol = new Protocol(PROTOCOL_ID);
      protocol.totalSwaps = 0;
      protocol.totalUniqueUsers = 0;
      protocol.totalPools = 0;
      protocol.totalVolumeToken0 = BigDecimal.zero();
      protocol.updatedAt = timestamp;
    }
    protocol.totalPools = protocol.totalPools + 1;
    protocol.updatedAt = timestamp;
    protocol.save();
  }
  return pool;
}

function loadOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let id = address.toHexString().toLowerCase();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.swapCount = 0;
    user.liquidityEventCount = 0;
    user.totalAmountIn = BigDecimal.zero();
    user.firstSeenAt = timestamp;
    user.lastSeenAt = timestamp;
    user.save();

    // Increment unique user count
    let protocol = Protocol.load(PROTOCOL_ID);
    if (protocol) {
      protocol.totalUniqueUsers = protocol.totalUniqueUsers + 1;
      protocol.updatedAt = timestamp;
      protocol.save();
    }
  }
  return user;
}

function loadOrCreateProtocol(timestamp: BigInt): Protocol {
  let protocol = Protocol.load(PROTOCOL_ID);
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID);
    protocol.totalSwaps = 0;
    protocol.totalUniqueUsers = 0;
    protocol.totalPools = 0;
    protocol.totalVolumeToken0 = BigDecimal.zero();
    protocol.updatedAt = timestamp;
    protocol.save();
  }
  return protocol;
}

// ─── Event handlers ───────────────────────────────────────────────────────────

export function handleSwap(event: SwapEvent): void {
  let poolAddr = event.address;
  let timestamp = event.block.timestamp;

  // Load/create entities
  let pool = loadOrCreatePool(poolAddr, timestamp);
  let user = loadOrCreateUser(event.params.sender, timestamp);

  let amountIn  = toDecimal(event.params.amountIn);
  let amountOut = toDecimal(event.params.amountOut);

  // Derive tokenOut — opposite of tokenIn
  // (we track volumes by amountIn as proxy for volume)
  let tokenIn  = event.params.tokenIn;
  let tokenOut: Bytes;
  if (pool.token0.notEqual(Bytes.fromHexString('0x0000000000000000000000000000000000000000'))) {
    tokenOut = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;
  } else {
    tokenOut = Bytes.fromHexString('0x0000000000000000000000000000000000000000');
  }

  // Create Swap entity
  let swapId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let swap = new Swap(swapId);
  swap.pool = pool.id;
  swap.sender = event.params.sender;
  swap.tokenIn = tokenIn;
  swap.tokenOut = tokenOut;
  swap.amountIn = amountIn;
  swap.amountOut = amountOut;
  swap.to = event.params.to;
  swap.blockNumber = event.block.number;
  swap.timestamp = timestamp;
  swap.txHash = event.transaction.hash;
  swap.user = user.id;
  swap.save();

  // Update pool
  pool.totalSwaps = pool.totalSwaps + 1;
  pool.totalVolumeToken0 = pool.totalVolumeToken0.plus(amountIn);
  pool.txCount = pool.txCount + 1;
  pool.updatedAt = timestamp;
  pool.save();

  // Update user
  user.swapCount = user.swapCount + 1;
  user.totalAmountIn = user.totalAmountIn.plus(amountIn);
  user.lastSeenAt = timestamp;
  user.save();

  // Update protocol
  let protocol = loadOrCreateProtocol(timestamp);
  protocol.totalSwaps = protocol.totalSwaps + 1;
  protocol.totalVolumeToken0 = protocol.totalVolumeToken0.plus(amountIn);
  protocol.updatedAt = timestamp;
  protocol.save();
}

export function handleAddLiquidity(event: AddLiquidityEvent): void {
  let poolAddr = event.address;
  let timestamp = event.block.timestamp;

  let pool = loadOrCreatePool(poolAddr, timestamp);
  let user = loadOrCreateUser(event.params.provider, timestamp);

  let eventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let liqEvent = new LiquidityEvent(eventId);
  liqEvent.pool = pool.id;
  liqEvent.provider = event.params.provider;
  liqEvent.amount0 = toDecimal(event.params.amount0);
  liqEvent.amount1 = toDecimal(event.params.amount1);
  liqEvent.lpMinted = toDecimal(event.params.lpMinted);
  liqEvent.lpBurned = BigDecimal.zero();
  liqEvent.type = 'add';
  liqEvent.blockNumber = event.block.number;
  liqEvent.timestamp = timestamp;
  liqEvent.txHash = event.transaction.hash;
  liqEvent.user = user.id;
  liqEvent.save();

  // Update pool reserves (approximate — add amounts)
  pool.reserve0 = pool.reserve0.plus(toDecimal(event.params.amount0));
  pool.reserve1 = pool.reserve1.plus(toDecimal(event.params.amount1));
  pool.txCount = pool.txCount + 1;
  pool.updatedAt = timestamp;
  pool.save();

  user.liquidityEventCount = user.liquidityEventCount + 1;
  user.lastSeenAt = timestamp;
  user.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidityEvent): void {
  let poolAddr = event.address;
  let timestamp = event.block.timestamp;

  let pool = loadOrCreatePool(poolAddr, timestamp);
  let user = loadOrCreateUser(event.params.provider, timestamp);

  let eventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let liqEvent = new LiquidityEvent(eventId);
  liqEvent.pool = pool.id;
  liqEvent.provider = event.params.provider;
  liqEvent.amount0 = toDecimal(event.params.amount0);
  liqEvent.amount1 = toDecimal(event.params.amount1);
  liqEvent.lpMinted = BigDecimal.zero();
  liqEvent.lpBurned = toDecimal(event.params.lpBurned);
  liqEvent.type = 'remove';
  liqEvent.blockNumber = event.block.number;
  liqEvent.timestamp = timestamp;
  liqEvent.txHash = event.transaction.hash;
  liqEvent.user = user.id;
  liqEvent.save();

  // Update pool reserves (approximate — subtract amounts)
  let newR0 = pool.reserve0.minus(toDecimal(event.params.amount0));
  let newR1 = pool.reserve1.minus(toDecimal(event.params.amount1));
  pool.reserve0 = newR0.lt(BigDecimal.zero()) ? BigDecimal.zero() : newR0;
  pool.reserve1 = newR1.lt(BigDecimal.zero()) ? BigDecimal.zero() : newR1;
  pool.txCount = pool.txCount + 1;
  pool.updatedAt = timestamp;
  pool.save();

  user.liquidityEventCount = user.liquidityEventCount + 1;
  user.lastSeenAt = timestamp;
  user.save();
}
