import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { CONTRACT_CONFIG } from '@/lib/config'

// Simple ABI for spin function only
const SIMPLE_SPIN_ABI = [
  {
    "type": "function",
    "name": "spin",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const

export function useSimpleSpin() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<any>(null)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

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

    setIsSpinning(true)

    try {
      // Use ethers directly for simple gas popup
      if (window.ethereum) {
        const provider = new (await import('ethers')).BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new (await import('ethers')).Contract(
          CONTRACT_CONFIG.WHEEL_GAME_ADDRESS as string,
          SIMPLE_SPIN_ABI,
          signer
        )

        toast({
          title: "Confirm Transaction",
          description: "Please confirm the transaction in your wallet to spin",
          variant: "default",
        })

        // This will trigger MetaMask gas popup
        const tx = await contract.spin()
        
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
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user"
      } else if (error.code === -32603) {
        errorMessage = "Transaction failed - check gas fees or daily limit"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Spin Failed",
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
    isConnected,
    userAddress: address
  }
}