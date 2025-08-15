import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { useState } from 'react'
import { CONTRACT_CONFIG } from '@/lib/config'

const WHEEL_GAME_ABI = [
  {
    "type": "function",
    "name": "spin",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function", 
    "name": "claimRewards",
    "inputs": [
      {"name": "tokenAddress", "type": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getPlayerStats", 
    "inputs": [
      {"name": "playerAddress", "type": "address"}
    ],
    "outputs": [
      {"type": "uint256"},
      {"type": "uint256"}, 
      {"type": "uint256"},
      {"type": "uint256"},
      {"type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPendingRewards",
    "inputs": [
      {"name": "playerAddress", "type": "address"}
    ],
    "outputs": [
      {"type": "uint256"},
      {"type": "uint256"},
      {"type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SpinResult",
    "inputs": [
      {"name": "player", "type": "address", "indexed": true},
      {"name": "segment", "type": "string"},
      {"name": "isWin", "type": "bool"},
      {"name": "tokenAddress", "type": "address"},
      {"name": "rewardAmount", "type": "uint256"},
      {"name": "randomSeed", "type": "uint256"}
    ]
  },
  {
    "type": "event", 
    "name": "RewardsClaimed",
    "inputs": [
      {"name": "player", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256"}
    ]
  }
] as const

// Use token addresses from config
export const TOKEN_ADDRESSES = CONTRACT_CONFIG.TOKEN_ADDRESSES

export function useWheelGame() {
  const { address } = useAccount()
  const [isSpinning, setIsSpinning] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Spin transaction
  const { 
    writeContract: executeSpin, 
    data: spinHash, 
    isPending: isSpinPending 
  } = useWriteContract()

  // Claim transaction  
  const { 
    writeContract: executeClaim, 
    data: claimHash, 
    isPending: isClaimPending 
  } = useWriteContract()

  // Wait for spin transaction
  const { 
    isLoading: isSpinConfirming, 
    isSuccess: isSpinConfirmed 
  } = useWaitForTransactionReceipt({
    hash: spinHash,
  })

  // Wait for claim transaction
  const { 
    isLoading: isClaimConfirming, 
    isSuccess: isClaimConfirmed 
  } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  const spin = async () => {
    if (!address) {
      console.log('No wallet address available')
      return
    }
    
    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '0x') {
      console.log('No contract address configured')
      return
    }

    try {
      setIsSpinning(true)
      console.log('Attempting to spin with contract:', CONTRACT_CONFIG.WHEEL_GAME_ADDRESS)
      
      // This will trigger the wallet gas popup
      await executeSpin({
        address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
        abi: WHEEL_GAME_ABI,
        functionName: 'spin',
      })
      
      console.log('Spin transaction initiated')
    } catch (error) {
      console.error('Spin failed:', error)
      setIsSpinning(false)
      throw error // Re-throw to handle in component
    }
  }

  const claimRewards = async (tokenAddress: `0x${string}`) => {
    if (!address) {
      console.log('No wallet address available')
      return
    }
    
    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '0x') {
      console.log('No contract address configured')
      return
    }

    try {
      setIsClaiming(true)
      console.log('Attempting to claim rewards for token:', tokenAddress)
      
      // This will trigger the wallet gas popup
      await executeClaim({
        address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
        abi: WHEEL_GAME_ABI,
        functionName: 'claimRewards',
        args: [tokenAddress],
      })
      
      console.log('Claim transaction initiated')
    } catch (error) {
      console.error('Claim failed:', error)
      setIsClaiming(false)
      throw error // Re-throw to handle in component
    }
  }

  const claimAllRewards = async () => {
    if (!address) return

    // Claim each token type sequentially
    const tokens = Object.values(TOKEN_ADDRESSES)
    for (const tokenAddress of tokens) {
      await claimRewards(tokenAddress)
    }
  }

  return {
    // State
    isSpinning: isSpinning || isSpinPending || isSpinConfirming,
    isClaiming: isClaiming || isClaimPending || isClaimConfirming,
    isSpinConfirmed,
    isClaimConfirmed,
    spinHash,
    claimHash,

    // Actions
    spin,
    claimRewards,
    claimAllRewards,

    // Contract address for reference
    contractAddress: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
    tokenAddresses: TOKEN_ADDRESSES,
  }
}