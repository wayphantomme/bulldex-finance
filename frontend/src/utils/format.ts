import { formatUnits } from 'viem';

/**
 * Format a bigint token amount to a human-readable string.
 * @param value   Raw token value in wei (bigint)
 * @param decimals Token decimals (default 18)
 * @param precision Decimal places to show (default 4)
 */
export function formatToken(
  value: bigint | undefined,
  decimals = 18,
  precision = 4,
): string {
  if (value === undefined || value === null) return '0';
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

/**
 * Shorten an Ethereum address: 0x1234...abcd
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Shorten a transaction hash: 0x1234...abcd
 */
export function shortenHash(hash: string, chars = 6): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Format a unix timestamp to a locale date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
