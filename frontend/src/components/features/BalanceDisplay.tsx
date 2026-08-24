'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTokenInfo } from '@/hooks/useTokenInfo';
import { formatToken, shortenAddress } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { BullIcon } from '@/components/icons/BullIcon';
import { etherscanUrl } from '@/constants/contracts';

export function BalanceDisplay() {
  const { address, isConnected, isConnecting } = useAccount();
  const { raw: balance, isLoading: balanceLoading, isContractConfigured } = useTokenBalance(address);
  const { symbol, totalSupply, isLoading: infoLoading } = useTokenInfo();

  const isLoading = balanceLoading || isConnecting;

  return (
    <Card variant="default" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>BDX Balance</CardTitle>
        <Badge variant="yellow" dot>
          Sepolia
        </Badge>
      </CardHeader>

      <CardBody>
        {/* Wallet not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/10">
              <BullIcon className="h-8 w-8 text-brand-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Connect your wallet</p>
              <p className="mt-1 text-xs text-text-muted">
                Connect to view your BDX balance
              </p>
            </div>
            <ConnectButton />
          </div>
        )}

        {/* Connected */}
        {isConnected && address && (
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-center justify-between rounded-card bg-bg-elevated px-3 py-2">
              <span className="text-xs text-text-muted">Address</span>
              <a
                href={etherscanUrl(address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-brand-amber transition-opacity hover:opacity-80"
                title={address}
              >
                {shortenAddress(address)}
              </a>
            </div>

            {/* Balance */}
            <div className="rounded-card border border-brand-purple/20 bg-brand-purple/5 px-4 py-5 text-center">
              {isLoading ? (
                <>
                  <Skeleton className="mx-auto mb-2 h-8 w-32" />
                  <Skeleton className="mx-auto h-4 w-16" />
                </>
              ) : !isContractConfigured ? (
                <p className="text-sm text-text-muted">
                  Set{' '}
                  <code className="rounded bg-bg-card px-1 py-0.5 font-mono text-xs text-brand-amber">
                    NEXT_PUBLIC_TOKEN_ADDRESS
                  </code>{' '}
                  in .env.local to see balance.
                </p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-white">
                    {formatToken(balance, 18, 2)}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{symbol ?? 'BDX'} tokens</p>
                </>
              )}
            </div>

            {/* Total supply info */}
            {!infoLoading && totalSupply !== undefined && (
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Total Supply</span>
                <span className="font-medium text-text-secondary">
                  {formatToken(totalSupply, 18, 0)} {symbol}
                </span>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
