import { useAccount, useChainId, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { CONTRACT_CONFIG } from '@/lib/config';

export function WalletDebug() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
  });

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white text-sm space-y-2">
      <h3 className="font-bold">Debug Info</h3>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Address: {address || 'None'}</div>
      <div>Chain ID: {chainId}</div>
      <div>Contract: {CONTRACT_CONFIG.WHEEL_GAME_ADDRESS || 'Not loaded'}</div>
      <div>Balance: {balance ? `${balance.formatted} ${balance.symbol}` : 'Unknown'}</div>
      <div>Connector: {connector?.name || 'None'}</div>
    </div>
  );
}