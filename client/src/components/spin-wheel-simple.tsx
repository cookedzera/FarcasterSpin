import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_CONFIG } from "@/lib/config";
import { ethers } from "ethers";
import { Coins, Gift } from "lucide-react";

const WHEEL_SEGMENTS = [
  { name: 'IARB', color: '#3B82F6', reward: '1' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'JUICE', color: '#10B981', reward: '2' },
  { name: 'BONUS', color: '#F59E0B', reward: '2x' },
  { name: 'ABET', color: '#8B5CF6', reward: '0.5' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'IARB', color: '#3B82F6', reward: '1' },
  { name: 'JACKPOT', color: '#F97316', reward: '10x' },
];

const WHEEL_ABI = [
  {
    type: "function",
    name: "spin",
    inputs: [],
    outputs: [
      { name: "segment", type: "string" },
      { name: "isWin", type: "bool" },
      { name: "tokenAddress", type: "address" },
      { name: "rewardAmount", type: "uint256" }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "SpinResult",
    inputs: [
      { indexed: true, name: "player", type: "address" },
      { indexed: false, name: "segment", type: "string" },
      { indexed: false, name: "isWin", type: "bool" },
      { indexed: false, name: "tokenAddress", type: "address" },
      { indexed: false, name: "rewardAmount", type: "uint256" },
      { indexed: false, name: "randomSeed", type: "uint256" }
    ]
  }
] as const;

// Real contract mode only

interface SpinResult {
  segment: string;
  isWin: boolean;
  reward?: string;
  rewardAmount?: string;
  tokenAddress?: string;
  transactionHash?: string;
  tokenType?: string;
}

interface SpinWheelSimpleProps {
  onSpinComplete?: (result: SpinResult) => void;
  userSpinsUsed: number;
  userId?: string;
  userAccumulated?: {
    IARB: string;
    JUICE: string;
    ABET: string;
  };
}

export default function SpinWheelSimple({ onSpinComplete, userSpinsUsed, userId, userAccumulated }: SpinWheelSimpleProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [freeSpinsUsed, setFreeSpinsUsed] = useState(0);
  const [sessionSpinsUsed, setSessionSpinsUsed] = useState(userSpinsUsed);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  // Check if user has free spins available (3 per day)
  const hasFreeSpin = userSpinsUsed < 3;
  
  // Update session spins when props change
  useEffect(() => {
    setSessionSpinsUsed(userSpinsUsed);
  }, [userSpinsUsed]);
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful transaction - THIS IS WHERE ANIMATION AND RESULT HAPPEN
  useEffect(() => {
    if (isSuccess && hash) {
      // NOW we start the wheel animation and get results from blockchain
      const handleConfirmedTransaction = async () => {
        try {
          // Get the actual spin result from the blockchain transaction
          const response = await fetch('/api/spin-result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: localStorage.getItem('arbcasino_user_id') || '56cbf268-416e-4a46-b71f-e0e5082a7498',
              userAddress: address,
              transactionHash: hash
            })
          });
          
          if (response.ok) {
            const spinResult = await response.json();
            
            // NOW animate the wheel to the correct result - fix arrow pointing to center of segment
            const resultSegment = WHEEL_SEGMENTS.find(s => s.name === spinResult.segment) || WHEEL_SEGMENTS[0];
            const segmentIndex = WHEEL_SEGMENTS.indexOf(resultSegment);
            const segmentAngle = 360 / WHEEL_SEGMENTS.length;
            // Point arrow to center of segment (add half segment angle)
            const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;
            const spins = 5; // 5 full rotations for dramatic effect
            const finalRotation = rotation + (spins * 360) - targetAngle;
            
            // Start the wheel animation
            setRotation(finalRotation);
            
            // Set the confirmed result after animation
            setTimeout(() => {
              const finalResult = {
                segment: spinResult.segment,
                isWin: spinResult.isWin,
                reward: spinResult.rewardAmount || '0',
                transactionHash: hash
              };
              
              setResult(finalResult);
              
              // No popup toast - result will be shown directly on wheel interface
              
              // Update session spin count for contract spins
              setSessionSpinsUsed(prev => prev + 1);
              
              if (onSpinComplete) {
                onSpinComplete(finalResult);
              }
              
              // Reset after showing result
              setTimeout(() => {
                setResult(null);
                setIsSpinning(false);
              }, 4000);
            }, 3000); // Wait for wheel animation to complete
            
          } else {
            throw new Error('Failed to get spin result from API');
          }
        } catch (error) {
          console.error('Failed to handle transaction result:', error);
          
          // Fallback - generate random result for animation
          const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
          const landedSegment = WHEEL_SEGMENTS[randomIndex];
          
          const segmentAngle = 360 / WHEEL_SEGMENTS.length;
          // Point arrow to center of segment (add half segment angle)
          const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
          const spins = 5;
          const finalRotation = rotation + (spins * 360) - targetAngle;
          
          setRotation(finalRotation);
          
          setTimeout(() => {
            const fallbackResult = {
              segment: landedSegment.name,
              isWin: landedSegment.name !== 'BUST',
              reward: landedSegment.reward,
              transactionHash: hash
            };
            
            setResult(fallbackResult);
            
            toast({
              title: "Transaction Confirmed",
              description: `TX: ${hash.slice(0, 10)}...`,
              variant: "default",
            });
            
            // Update session spin count for contract spins
            setSessionSpinsUsed(prev => prev + 1);
            
            if (onSpinComplete) {
              onSpinComplete(fallbackResult);
            }
            
            setTimeout(() => {
              setResult(null);
              setIsSpinning(false);
            }, 4000);
          }, 3000);
        }
      };
      
      handleConfirmedTransaction();
    }
  }, [isSuccess, hash, rotation, address, onSpinComplete, toast]);

  // Handle transaction failure
  useEffect(() => {
    if (isPending) {
      toast({
        title: "Transaction Pending",
        description: "Waiting for blockchain confirmation...",
        variant: "default",
      });
    }
  }, [isPending, toast]);

  // Handle transaction errors
  useEffect(() => {
    if (hash && !isConfirming && !isSuccess && !isPending) {
      // Transaction was rejected or failed
      setIsSpinning(false);
      setResult(null);
      
      toast({
        title: "Transaction Failed",
        description: "The spin transaction was rejected or failed. Please try again.",
        variant: "destructive",
      });
    }
  }, [hash, isConfirming, isSuccess, isPending, toast]);

  const handleSpin = async () => {
    // Check for free spins first - no wallet connection required for free spins
    if (hasFreeSpin && userId) {
      await handleFreeSpin();
      return;
    }

    // If no free spins available, show limit reached message
    if (userSpinsUsed >= 3) {
      toast({
        title: "Daily Limit Reached",
        description: "You can spin 3 times per day. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    // For paid spins (disabled for now), require wallet connection
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet for paid spins",
        variant: "destructive",
      });
      return;
    }

    if (!CONTRACT_CONFIG.WHEEL_GAME_ADDRESS) {
      toast({
        title: "Contract Not Ready",
        description: "Contract address not configured",
        variant: "destructive",
      });
      return;
    }

    // Set spinning state but NO animation or result yet
    setIsSpinning(true);
    setResult(null); // Clear any previous result

    try {
      // First show user we're initiating transaction
      toast({
        title: "Initiating Spin",
        description: "Please confirm the transaction in your wallet",
        variant: "default",
      });

      // Call the contract directly from user's wallet (user pays gas)
      writeContract({
        address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS as `0x${string}`,
        abi: WHEEL_ABI,
        functionName: 'spin',
        args: [],
        gas: BigInt(200000), // Set reasonable gas limit
      });

      // Note: Animation and result will ONLY happen after transaction is confirmed in useEffect
    } catch (error: any) {
      console.error('Contract call failed:', error);
      let errorMessage = "Failed to call contract";
      
      if (error.message?.includes('execution reverted')) {
        errorMessage = "Transaction would fail. You may have reached your daily limit or insufficient gas.";
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient ETH for gas fees. Please add more ETH to your wallet.";
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSpinning(false);
      setResult(null);
    }
  };

  const handleFreeSpin = async () => {
    setIsSpinning(true);
    setResult(null);

    try {
      // Free server-side spin
      const response = await fetch('/api/spin-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userAddress: address
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Spin failed');
      }

      const spinResult = await response.json();
      
      // Animate wheel to result - fix arrow pointing to center of segment
      const resultSegment = WHEEL_SEGMENTS.find(s => s.name === spinResult.segment) || WHEEL_SEGMENTS[0];
      const segmentIndex = WHEEL_SEGMENTS.indexOf(resultSegment);
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      // Point arrow to center of segment (add half segment angle)
      const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;
      const spins = 3; // 3 full rotations
      const finalRotation = rotation + (spins * 360) - targetAngle;
      
      setRotation(finalRotation);
      // Don't update freeSpinsUsed - use userSpinsUsed from props
      
      // Show result after animation
      setTimeout(() => {
        const finalResult = {
          segment: spinResult.segment,
          isWin: spinResult.isWin,
          rewardAmount: spinResult.rewardAmount,
          tokenType: spinResult.tokenType,
          tokenAddress: spinResult.tokenAddress
        };
        
        setResult(finalResult);
        setIsSpinning(false);
        
        // No popup toast - result will be shown directly on wheel interface
        
        if (onSpinComplete) {
          onSpinComplete(finalResult);
        }
      }, 3000);

    } catch (error: any) {
      console.error("Free spin error:", error);
      setIsSpinning(false);
      
      toast({
        title: "Spin Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };



  const handleBatchClaim = async () => {
    if (!address || !userId) return;

    try {
      const response = await fetch('/api/claim-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userAddress: address
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Batch claim failed');
      }

      const claimResult = await response.json();
      
      toast({
        title: "🎉 All Tokens Claimed!",
        description: `All accumulated rewards sent to your wallet`,
      });

      // Refresh by calling parent callback
      if (onSpinComplete) {
        onSpinComplete({
          segment: 'CLAIM_ALL',
          isWin: true,
          rewardAmount: '0',
          tokenType: 'ALL'
        });
      }

    } catch (error: any) {
      toast({
        title: "Batch Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const isProcessing = isPending || isConfirming;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
        </div>
        
        {/* Result Overlay - Mobile-friendly winning display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div className={`${
              result.isWin 
                ? 'bg-gradient-to-br from-green-500/90 to-emerald-600/90 border-green-400' 
                : 'bg-gradient-to-br from-red-500/90 to-red-600/90 border-red-400'
            } backdrop-blur-sm rounded-full w-48 h-48 border-4 flex flex-col items-center justify-center text-center p-4 shadow-2xl`}>
              <div className="text-4xl mb-2">
                {result.isWin ? '🎉' : '💀'}
              </div>
              <div className="text-white font-bold text-lg mb-1">
                {result.segment}
              </div>
              <div className="text-white/90 text-sm">
                {result.isWin ? 'Winner!' : 'Try Again!'}
              </div>
              {result.isWin && result.rewardAmount && result.rewardAmount !== '0' && (
                <div className="text-yellow-300 font-bold text-xs mt-2">
                  +{(parseFloat(result.rewardAmount) / 1e18).toFixed(1)} tokens
                </div>
              )}
              {result.isWin && (
                <div className="text-green-200 text-xs mt-1">
                  Added to balance!
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Spinning Wheel */}
        <motion.div
          className={`w-64 h-64 rounded-full relative overflow-hidden shadow-2xl border-4 ${
            isProcessing ? 'border-blue-400 shadow-blue-400/50' : 
            isSpinning ? 'border-yellow-400' : 'border-yellow-400'
          }`}
          animate={{ rotate: rotation }}
          transition={{
            duration: isSpinning ? 4 : 0,
            ease: isSpinning ? [0.25, 0.1, 0.25, 1] : "linear"
          }}
        >
          {WHEEL_SEGMENTS.map((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            return (
              <div
                key={index}
                className="absolute w-full h-full"
                style={{
                  background: `conic-gradient(from ${startAngle}deg, ${segment.color} 0deg, ${segment.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute text-white font-bold text-sm"
                  style={{
                    left: `${50 + 35 * Math.cos((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}%`,
                    top: `${50 + 35 * Math.sin((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {segment.name}
                </div>
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full border-2 ${
            isProcessing ? 'border-blue-400' : 'border-yellow-400'
          } flex items-center justify-center`}>
            <span className={`font-bold text-xs ${
              isProcessing ? 'text-blue-400' : 'text-yellow-400'
            }`}>
              {isProcessing ? '⏳' : isSpinning ? '🎰' : 'SPIN'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Spin Status */}
      <div className="text-center space-y-2">
        <div className="text-lg font-bold text-white">
          {hasFreeSpin 
            ? `🆓 Free Spins: ${3 - userSpinsUsed} remaining`
            : `⛽ Daily Limit Reached`
          }
        </div>
        <p className="text-sm text-gray-300">
          {hasFreeSpin 
            ? "No gas fees - rewards accumulate until claimed"
            : "Pay gas per spin - immediate blockchain rewards"
          }
        </p>
      </div>

      <Button
        onClick={handleSpin}
        disabled={userSpinsUsed >= 3 || isSpinning || isProcessing}
        className="w-48 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg"
        data-testid="button-spin"
      >
        {userSpinsUsed >= 3 ? 'Daily Limit Reached' :
         isProcessing ? 'Confirming Transaction...' :
         isSpinning ? 'Spinning...' : 
         hasFreeSpin ? '🎰 FREE SPIN!' : 'No spins available'}
      </Button>
      
      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="text-center bg-blue-600/20 border border-blue-400 rounded-lg p-3">
          <p className="text-blue-300 text-sm font-medium">
            {isPending ? "⏳ Waiting for wallet confirmation..." : "🔄 Transaction confirming on blockchain..."}
          </p>
          {hash && (
            <p className="text-blue-400 text-xs mt-1">
              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          )}
        </div>
      )}
      
      {/* Spins Counter */}
      <div className="text-center">
        <p className="text-white/80 text-sm">
          Total daily spins: {userSpinsUsed}/3 used
        </p>
        <p className="text-white/60 text-xs">
          (Free: {userSpinsUsed}/3, Contract: 0/0)
        </p>
      </div>

      {/* Accumulated Rewards Display - Modern Casino UI */}
      {userAccumulated && (
        (userAccumulated.IARB && BigInt(userAccumulated.IARB) > 0) ||
        (userAccumulated.JUICE && BigInt(userAccumulated.JUICE) > 0) ||
        (userAccumulated.ABET && BigInt(userAccumulated.ABET) > 0)
      ) && (
        <div className="w-full max-w-md space-y-4">
          {/* Modern header with gradient background */}
          <div className="text-center p-4 rounded-2xl relative overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(139, 69, 19, 0.3) 100%)',
                 border: '1px solid rgba(255, 215, 0, 0.3)',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.2)'
               }}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent" />
            <div className="relative">
              <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-yellow-400" />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  Accumulated Rewards
                </span>
              </h3>
              <p className="text-sm text-yellow-200/80">
                {userSpinsUsed >= 3 ? "Your winnings are ready to claim!" : "Complete all spins to claim rewards!"}
              </p>
            </div>
          </div>

          {/* Modern token cards with gradients */}
          <div className="space-y-3">
            {userAccumulated?.IARB && BigInt(userAccumulated.IARB) > 0 && (
              <motion.div 
                className="relative p-4 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)'
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />
                <div className="relative flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-blue-600/80 backdrop-blur-sm rounded-full border border-blue-400/50">
                      <span className="text-white font-bold text-sm">IARB</span>
                    </div>
                    <span className="font-mono text-white text-lg font-bold">
                      {ethers.formatEther(userAccumulated.IARB)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {userAccumulated?.JUICE && BigInt(userAccumulated.JUICE) > 0 && (
              <motion.div 
                className="relative p-4 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)'
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent" />
                <div className="relative flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-green-600/80 backdrop-blur-sm rounded-full border border-green-400/50">
                      <span className="text-white font-bold text-sm">JUICE</span>
                    </div>
                    <span className="font-mono text-white text-lg font-bold">
                      {ethers.formatEther(userAccumulated.JUICE)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {userAccumulated?.ABET && BigInt(userAccumulated.ABET) > 0 && (
              <motion.div 
                className="relative p-4 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(126, 34, 206, 0.1) 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.1)'
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent" />
                <div className="relative flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm rounded-full border border-purple-400/50">
                      <span className="text-white font-bold text-sm">ABET</span>
                    </div>
                    <span className="font-mono text-white text-lg font-bold">
                      {ethers.formatEther(userAccumulated.ABET)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Claim All Button - Only show when all spins are used */}
          {userSpinsUsed >= 3 && (
            <motion.div 
              className="pt-2"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Button 
                className="w-full h-14 text-lg font-bold relative overflow-hidden group" 
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={handleBatchClaim}
                data-testid="button-claim-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Coins className="w-6 h-6 mr-3" />
                <span>Claim All Rewards</span>
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                One transaction to claim all your winnings
              </p>
            </motion.div>
          )}
          
          {/* Pending spins message - Modern design */}
          {userSpinsUsed < 3 && (
            <motion.div 
              className="text-center p-4 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.1)'
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
              <div className="relative">
                <p className="text-yellow-200 text-sm font-bold mb-1">
                  🎰 Complete {3 - userSpinsUsed} more spin{3 - userSpinsUsed !== 1 ? 's' : ''} to unlock claiming
                </p>
                <p className="text-yellow-300/80 text-xs">
                  Save gas fees by claiming all rewards together
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`p-4 rounded-xl border-2 ${result.isWin ? 'border-green-400 bg-green-400/20' : 'border-red-400 bg-red-400/20'} text-center`}
          >
            <h3 className={`text-xl font-bold ${result.isWin ? 'text-green-400' : 'text-red-400'}`}>
              {result.isWin ? '🎉 Winner!' : '💀 Better Luck Next Time!'}
            </h3>
            <p className="text-white mt-2">
              You landed on <span className="font-bold">{result.segment}</span>
              {result.isWin && (
                <span className="block text-sm text-white/80 mt-1">
                  Reward: {result.reward || result.rewardAmount} tokens
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}