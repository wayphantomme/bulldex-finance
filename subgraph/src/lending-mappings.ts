import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  CollateralDeposited,
  Borrowed,
  Repaid,
  Liquidated,
} from '../generated/Lending/Lending';
import { LendingDeposit, LendingBorrow, LendingRepay, LendingLiquidation, LendingProtocol } from '../generated/schema';

const PROTOCOL_ID = 'lending';
const PRECISION = BigDecimal.fromString('1000000000000000000');

function toDecimal(v: BigInt): BigDecimal {
  return v.toBigDecimal().div(PRECISION);
}

function loadOrCreateProtocol(timestamp: BigInt): LendingProtocol {
  let p = LendingProtocol.load(PROTOCOL_ID);
  if (!p) {
    p = new LendingProtocol(PROTOCOL_ID);
    p.totalDeposits      = 0;
    p.totalBorrows       = 0;
    p.totalRepays        = 0;
    p.totalLiquidations  = 0;
    p.totalVolumeDeposited = BigDecimal.zero();
    p.totalVolumeBorrowed  = BigDecimal.zero();
    p.uniqueUsers        = 0;
    p.updatedAt          = timestamp;
    p.save();
  }
  return p;
}

export function handleCollateralDeposited(event: CollateralDeposited): void {
  let id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let d = new LendingDeposit(id);
  d.user        = event.params.user;
  d.amount      = toDecimal(event.params.amount);
  d.blockNumber = event.block.number;
  d.timestamp   = event.block.timestamp;
  d.txHash      = event.transaction.hash;
  d.save();

  let p = loadOrCreateProtocol(event.block.timestamp);
  p.totalDeposits = p.totalDeposits + 1;
  p.totalVolumeDeposited = p.totalVolumeDeposited.plus(d.amount);
  p.updatedAt = event.block.timestamp;
  p.save();
}

export function handleBorrowed(event: Borrowed): void {
  let id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let b = new LendingBorrow(id);
  b.user        = event.params.user;
  b.amount      = toDecimal(event.params.amount);
  b.blockNumber = event.block.number;
  b.timestamp   = event.block.timestamp;
  b.txHash      = event.transaction.hash;
  b.save();

  let p = loadOrCreateProtocol(event.block.timestamp);
  p.totalBorrows = p.totalBorrows + 1;
  p.totalVolumeBorrowed = p.totalVolumeBorrowed.plus(b.amount);
  p.updatedAt = event.block.timestamp;
  p.save();
}

export function handleRepaid(event: Repaid): void {
  let id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let r = new LendingRepay(id);
  r.user      = event.params.user;
  r.principal = toDecimal(event.params.principal);
  r.interest  = toDecimal(event.params.interest);
  r.blockNumber = event.block.number;
  r.timestamp = event.block.timestamp;
  r.txHash    = event.transaction.hash;
  r.save();

  let p = loadOrCreateProtocol(event.block.timestamp);
  p.totalRepays = p.totalRepays + 1;
  p.updatedAt = event.block.timestamp;
  p.save();
}

export function handleLiquidated(event: Liquidated): void {
  let id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let l = new LendingLiquidation(id);
  l.liquidator       = event.params.liquidator;
  l.borrower         = event.params.borrower;
  l.debtRepaid       = toDecimal(event.params.debtRepaid);
  l.collateralSeized = toDecimal(event.params.collateralSeized);
  l.blockNumber = event.block.number;
  l.timestamp   = event.block.timestamp;
  l.txHash      = event.transaction.hash;
  l.save();

  let p = loadOrCreateProtocol(event.block.timestamp);
  p.totalLiquidations = p.totalLiquidations + 1;
  p.updatedAt = event.block.timestamp;
  p.save();
}
