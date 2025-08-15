import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { useState } from 'react'
import { CONTRACT_CONFIG } from '@/lib/config'

// WheelGameTestnet ABI with proper player stats access
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
    "name": "MAX_DAILY_SPINS",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "players",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [
      {"type": "uint256", "name": "totalSpins"},
      {"type": "uint256", "name": "totalWins"},
      {"type": "uint256", "name": "lastSpinDate"},
      {"type": "uint256", "name": "dailySpins"}
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
    "type": "error",
    "name": "DailySpinLimitReached",
    "inputs": []
  }
] as const

// Use token addresses from config
export const TOKEN_ADDRESSES = CONTRACT_CONFIG.TOKEN_ADDRESSES

export function useWheelGame() {
  const { address } = useAccount()
  const [isSpinning, setIsSpinning] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Read player data to check daily spin limit
  const { data: playerData } = useReadContract({
    address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'players',
    args: address ? [address] : undefined,
  })

  const { data: maxDailySpins } = useReadContract({
    address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'MAX_DAILY_SPINS',
  })

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
    
    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '' || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '0x') {
      console.log('No contract address configured:', CONTRACT_CONFIG.WHEEL_GAME_ADDRESS)
      throw new Error('Contract not configured. Please wait for configuration to load.')
    }

    // Check daily spin limit before attempting transaction
    const dailySpinsUsed = playerData ? Number(playerData[3]) : 0
    const maxSpins = maxDailySpins ? Number(maxDailySpins) : 5

    console.log('Daily spins check:', {
      dailySpinsUsed,
      maxSpins,
      canSpin: dailySpinsUsed < maxSpins
    })

    if (dailySpinsUsed >= maxSpins) {
      throw new Error(`Daily spin limit reached! You've used ${dailySpinsUsed}/${maxSpins} spins today. Come back tomorrow!`)
    }

    try {
      setIsSpinning(true)
      console.log('Attempting to spin with contract:', CONTRACT_CONFIG.WHEEL_GAME_ADDRESS)
      console.log('Player address:', address)
      console.log('Daily spins used:', dailySpinsUsed, '/', maxSpins)
      
      // This will trigger the wallet gas popup
      executeSpin({
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
    
    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '' || CONTRACT_CONFIG.WHEEL_GAME_ADDRESS === '0x') {
      console.log('No contract address configured:', CONTRACT_CONFIG.WHEEL_GAME_ADDRESS)
      throw new Error('Contract not configured. Please wait for configuration to load.')
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
    
    // Player stats for UI
    playerData,
    maxDailySpins,
    dailySpinsUsed: playerData ? Number(playerData[3]) : 0,
    canSpin: playerData && maxDailySpins ? Number(playerData[3]) < Number(maxDailySpins) : true,
  }
}