import { useState, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { CONTRACT_CONFIG } from '@/lib/config'

// Correct ABI matching the deployed contract
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
    "name": "getPlayerStats",
    "inputs": [{"name": "playerAddress", "type": "address"}],
    "outputs": [
      {"type": "uint256", "name": "totalSpins"},
      {"type": "uint256", "name": "totalWins"},
      {"type": "uint256", "name": "lastSpinDate"},
      {"type": "uint256", "name": "dailySpins"},
      {"type": "uint256", "name": "spinsRemaining"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPendingRewards",
    "inputs": [{"name": "playerAddress", "type": "address"}],
    "outputs": [
      {"type": "uint256", "name": "token1Rewards"},
      {"type": "uint256", "name": "token2Rewards"},
      {"type": "uint256", "name": "token3Rewards"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getWheelSegments",
    "inputs": [],
    "outputs": [{"type": "string[]", "name": ""}],
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
  }
] as const

export function useSimpleSpin() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<any>(null)
  
  // Function to reset spin result
  const resetSpinResult = useCallback(() => {
    setLastSpinResult(null);
  }, []);
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const [testMode, setTestMode] = useState(false) // Use real contract mode

  const triggerGasPopup = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to spin",
        variant: "destructive",
      })
      return false
    }

    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS) {
      toast({
        title: "Contract Not Ready",
        description: "Contract address not configured yet",
        variant: "destructive",
      })
      return false
    }

    // Check if on correct network (Arbitrum Sepolia = 421614)
    if (chainId !== 421614) {
      toast({
        title: "Wrong Network",
        description: `Please switch to Arbitrum Sepolia (Chain ID: 421614). Current: ${chainId}`,
        variant: "destructive",
      })
      return false
    }

    console.log('🔗 Using contract address:', CONTRACT_CONFIG.WHEEL_GAME_ADDRESS)
    console.log('🦊 Wallet connected:', { address, chainId })

    setIsSpinning(true)

    try {
      // TEST MODE: Simulate gas popup without calling contract
      if (testMode) {
        toast({
          title: "Test Mode Active",
          description: "Simulating gas popup - no real transaction",
          variant: "default",
        })

        // Simulate MetaMask popup delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate random result
        const segments = [
          { name: 'AIDOGE', reward: '10000', color: '#3B82F6' },
          { name: 'BUST', reward: '0', color: '#EF4444' },
          { name: 'BOOP', reward: '20000', color: '#10B981' },
          { name: 'BONUS', reward: '5000', color: '#F59E0B' },
          { name: 'BOBOTRUM', reward: '15000', color: '#8B5CF6' },
          { name: 'JACKPOT', reward: '50000', color: '#F97316' }
        ]
        
        const randomIndex = Math.floor(Math.random() * segments.length)
        const result = segments[randomIndex]
        
        setLastSpinResult({
          segment: result,
          transactionHash: '0x' + Math.random().toString(16).substr(2, 40) + Math.random().toString(16).substr(2, 24),
          isWin: result.name !== 'BUST'
        })

        toast({
          title: "Test Spin Complete!",
          description: `You landed on ${result.name}! (Simulated)`,
          variant: result.name !== 'BUST' ? "default" : "destructive",
        })

        return true
      }

      // REAL MODE: Use ethers directly for actual gas popup
      if (window.ethereum) {
        const { BrowserProvider, Contract, parseUnits } = await import('ethers')
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new Contract(
          CONTRACT_CONFIG.WHEEL_GAME_ADDRESS as string,
          WHEEL_GAME_ABI,
          signer
        )

        // Check daily spin limit using correct contract functions
        try {
          const playerStats = await contract.getPlayerStats(address)
          const dailySpinsUsed = Number(playerStats[3])
          const spinsRemaining = Number(playerStats[4])

          console.log('Pre-transaction check:', {
            address,
            totalSpins: Number(playerStats[0]),
            totalWins: Number(playerStats[1]),
            lastSpinDate: Number(playerStats[2]),
            dailySpinsUsed,
            spinsRemaining,
            canSpin: spinsRemaining > 0
          })

          if (spinsRemaining <= 0) {
            toast({
              title: "Daily Limit Reached",
              description: `No spins remaining today. Come back tomorrow!`,
              variant: "destructive",
            })
            return false
          }
        } catch (checkError: any) {
          console.warn('Could not check daily limits:', checkError)
          // Continue anyway - let the contract handle the check
        }

        // Estimate gas first to catch revert errors early
        try {
          const gasEstimate = await contract.spin.estimateGas()
          console.log('Gas estimate successful:', gasEstimate.toString())
        } catch (gasError: any) {
          console.error('Gas estimation failed:', gasError)
          
          let errorMessage = "Transaction would fail"
          if (gasError.reason) {
            errorMessage = gasError.reason
          } else if (gasError.message.includes('daily') || gasError.message.includes('limit')) {
            errorMessage = "Daily spin limit reached. Come back tomorrow!"
          } else if (gasError.message.includes('revert')) {
            errorMessage = "Contract rejected the transaction. Check daily limits or gas."
          } else {
            errorMessage = "Gas estimation failed: " + (gasError.message || 'Unknown error')
          }
          
          toast({
            title: "Transaction Failed",
            description: errorMessage,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Confirm Transaction",
          description: "Please confirm the transaction in your wallet to spin",
          variant: "default",
        })

        // This will trigger MetaMask gas popup
        console.log('🎰 Calling contract.spin()...')
        const tx = await contract.spin()
        console.log('✅ Transaction sent:', tx.hash)
        
        toast({
          title: "Transaction Sent",
          description: "Waiting for confirmation...",
          variant: "default",
        })

        const receipt = await tx.wait()
        
        // Generate random result for demo
        const segments = [
          { name: 'AIDOGE', reward: '10000', color: '#3B82F6' },
          { name: 'BUST', reward: '0', color: '#EF4444' },
          { name: 'BOOP', reward: '20000', color: '#10B981' },
          { name: 'BONUS', reward: '5000', color: '#F59E0B' },
          { name: 'BOBOTRUM', reward: '15000', color: '#8B5CF6' },
          { name: 'JACKPOT', reward: '50000', color: '#F97316' }
        ]
        
        const randomIndex = Math.floor(Math.random() * segments.length)
        const result = segments[randomIndex]
        
        setLastSpinResult({
          segment: result,
          transactionHash: receipt.hash,
          isWin: result.name !== 'BUST'
        })

        toast({
          title: "Spin Complete!",
          description: `You landed on ${result.name}! Transaction: ${receipt.hash.slice(0, 10)}...`,
          variant: result.name !== 'BUST' ? "default" : "destructive",
        })

        return true
      } else {
        throw new Error("MetaMask not found")
      }
    } catch (error: any) {
      console.error('Spin failed:', error)
      
      let errorMessage = "Failed to execute spin"
      let errorTitle = "Spin Failed"
      
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user"
        errorTitle = "Transaction Cancelled"
      } else if (error.code === -32603 || error.code === 'CALL_EXCEPTION') {
        if (error.reason) {
          errorMessage = error.reason
        } else if (error.data && error.data.includes('0x')) {
          // Custom contract error
          errorMessage = "Daily spin limit reached or contract requirement not met"
        } else {
          errorMessage = "Transaction reverted - check daily limits or network"
        }
      } else if (error.message) {
        if (error.message.includes('DailySpinLimitReached')) {
          errorMessage = "Daily spin limit reached. Come back tomorrow!"
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient funds for gas fees"
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    } finally {
      setIsSpinning(false)
    }
  }


  return {
    isSpinning,
    triggerGasPopup,
    lastSpinResult,
    resetSpinResult,
    isConnected,
    userAddress: address
  }
}