import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'

export function useSimpleSpin() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<any>(null)
  
  // Function to reset spin result
  const resetSpinResult = useCallback(() => {
    setLastSpinResult(null);
  }, []);
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const triggerSpin = async (userId: string) => {
    setIsSpinning(true)

    try {
      console.log('🎰 Starting server-side spin...');

      // Call server API for free spinning
      const response = await fetch('/api/spin-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          userAddress: address
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Spin failed');
      }

      console.log('✅ Spin result:', data);
      
      setLastSpinResult({
        segment: data.segment,
        isWin: data.isWin,
        tokenType: data.tokenType,
        rewardAmount: data.rewardAmount,
        spinsRemaining: data.spinsRemaining
      })

      toast({
        title: data.isWin ? "You Won!" : "Better Luck Next Time",
        description: data.isWin 
          ? `You won ${data.rewardAmount} ${data.tokenType} tokens!` 
          : `You landed on ${data.segment}. ${data.spinsRemaining} spins remaining today.`,
        variant: data.isWin ? "default" : "destructive",
      })

      return true
    } catch (error: any) {
      console.error('Spin failed:', error)
      
      let errorMessage = "Failed to execute spin"
      let errorTitle = "Spin Failed"
      
      if (error.message.includes('Daily spin limit')) {
        errorMessage = "Daily spin limit reached. Come back tomorrow!"
        errorTitle = "Daily Limit Reached"
      } else if (error.message.includes('User not found')) {
        errorMessage = "Please connect your wallet and try again"
        errorTitle = "User Not Found"
      } else {
        errorMessage = error.message || "An unexpected error occurred"
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
    triggerSpin,
    lastSpinResult,
    resetSpinResult,
    isConnected,
    userAddress: address
  }
}