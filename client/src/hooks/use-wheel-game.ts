import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, encodeFunctionData } from 'viem';
import { useState } from 'react';

// Contract ABI for the WheelGameTestnet
const WHEEL_GAME_ABI = parseAbi([
  'function spin() external',
  'function claimRewards(address tokenAddress) external', 
  'function getPlayerStats(address playerAddress) external view returns (uint256, uint256, uint256, uint256, uint256)',
  'function getPendingRewards(address playerAddress) external view returns (uint256, uint256, uint256)',
  'function players(address) external view returns (uint256, uint256, uint256, uint256)',
  'event SpinResult(address indexed player, string segment, bool isWin, address tokenAddress, uint256 rewardAmount, uint256 randomSeed)',
  'event RewardsClaimed(address indexed player, address indexed token, uint256 amount)'
]);

// Contract address on Arbitrum Sepolia - we'll get this from environment
const WHEEL_GAME_ADDRESS = (typeof window !== 'undefined' ? 
  window.location.hostname.includes('replit.dev') ? '0x0000000000000000000000000000000000000000' : 
  '0x0000000000000000000000000000000000000000'
  : '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Token addresses for claiming
export const TOKEN_ADDRESSES = {
  AIDOGE: "0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4" as `0x${string}`,
  BOOP: "0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19" as `0x${string}`,
  BOBOTRUM: "0x0E1CD6557D2BA59C61c75850E674C2AD73253952" as `0x${string}`
};

export function useWheelGame() {
  const { address } = useAccount();
  const [lastSpinHash, setLastSpinHash] = useState<`0x${string}` | undefined>();

  // Write contract for spinning
  const { 
    writeContract: spin, 
    isPending: isSpinPending, 
    data: spinTxHash 
  } = useWriteContract();

  // Write contract for claiming rewards
  const { 
    writeContract: claimRewards, 
    isPending: isClaimPending, 
    data: claimTxHash 
  } = useWriteContract();

  // Wait for spin transaction
  const { 
    isLoading: isSpinConfirming, 
    isSuccess: isSpinConfirmed,
    data: spinReceipt
  } = useWaitForTransactionReceipt({
    hash: spinTxHash,
  });

  // Wait for claim transaction
  const { 
    isLoading: isClaimConfirming, 
    isSuccess: isClaimConfirmed 
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // Read player stats
  const { data: playerStats, refetch: refetchPlayerStats } = useReadContract({
    abi: WHEEL_GAME_ABI,
    address: WHEEL_GAME_ADDRESS,
    functionName: 'players',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    abi: WHEEL_GAME_ABI,
    address: WHEEL_GAME_ADDRESS,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Spin function that triggers user's wallet transaction
  const executeSpin = async (): Promise<void> => {
    if (!address) throw new Error('Wallet not connected');
    
    await spin({
      abi: WHEEL_GAME_ABI,
      address: WHEEL_GAME_ADDRESS,
      functionName: 'spin',
    });
  };

  // Claim function that triggers user's wallet transaction
  const executeClaim = async (tokenAddress: `0x${string}`): Promise<void> => {
    if (!address) throw new Error('Wallet not connected');
    
    await claimRewards({
      abi: WHEEL_GAME_ABI,
      address: WHEEL_GAME_ADDRESS,
      functionName: 'claimRewards',
      args: [tokenAddress],
    });
  };

  // Claim all pending rewards
  const claimAllRewards = async (): Promise<void> => {
    if (!address || !pendingRewards) throw new Error('No rewards to claim');

    const [token1Amount, token2Amount, token3Amount] = pendingRewards as readonly [bigint, bigint, bigint];

    // Execute claim transactions for each token with pending rewards
    if (token1Amount > BigInt(0)) {
      await executeClaim(TOKEN_ADDRESSES.AIDOGE);
    }
    if (token2Amount > BigInt(0)) {
      await executeClaim(TOKEN_ADDRESSES.BOOP);
    }
    if (token3Amount > BigInt(0)) {
      await executeClaim(TOKEN_ADDRESSES.BOBOTRUM);
    }
  };

  return {
    // State
    isSpinPending: isSpinPending || isSpinConfirming,
    isClaimPending: isClaimPending || isClaimConfirming,
    isSpinConfirmed,
    isClaimConfirmed,
    playerStats,
    pendingRewards,
    spinReceipt,

    // Actions
    executeSpin,
    executeClaim,
    claimAllRewards,

    // Refetch functions
    refetchPlayerStats,
    refetchPendingRewards,

    // Transaction hashes
    spinTxHash,
    claimTxHash,
  };
}