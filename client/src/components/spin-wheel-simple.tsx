import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_CONFIG } from "@/lib/config";

const WHEEL_SEGMENTS = [
  { name: 'AIDOGE', color: '#3B82F6', reward: '10000' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'BOOP', color: '#10B981', reward: '20000' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'BOBOTRUM', color: '#8B5CF6', reward: '15000' },
  { name: 'JACKPOT', color: '#F97316', reward: '50000' },
];

const WHEEL_ABI = [
  {
    type: "function",
    name: "spin",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

interface SpinResult {
  segment: string;
  isWin: boolean;
  reward: string;
  transactionHash: string;
}

interface SpinWheelSimpleProps {
  onSpinComplete?: (result: SpinResult) => void;
  userSpinsUsed: number;
}

export default function SpinWheelSimple({ onSpinComplete, userSpinsUsed }: SpinWheelSimpleProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && result) {
      toast({
        title: "🎉 Spin Complete!",
        description: `You landed on ${result.segment}! ${result.isWin ? 'You won!' : 'Try again!'}`,
        variant: result.isWin ? "default" : "destructive",
      });
      
      if (onSpinComplete) {
        onSpinComplete({
          ...result,
          transactionHash: hash
        });
      }
      
      // Reset after showing result
      setTimeout(() => {
        setResult(null);
        setIsSpinning(false);
      }, 3000);
    }
  }, [isSuccess, hash, result, onSpinComplete, toast]);

  const handleSpin = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to spin",
        variant: "destructive",
      });
      return;
    }

    if (userSpinsUsed >= 3) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all 3 spins for today!",
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

    // Generate random result (in real app, this would come from contract events)
    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const landedSegment = WHEEL_SEGMENTS[randomIndex];
    
    // Calculate wheel rotation to land on the segment
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = randomIndex * segmentAngle;
    const spins = 5; // 5 full rotations
    const finalRotation = rotation + (spins * 360) - targetAngle;
    
    setIsSpinning(true);
    setRotation(finalRotation);
    
    // Set result for later use
    setResult({
      segment: landedSegment.name,
      isWin: landedSegment.name !== 'BUST',
      reward: landedSegment.reward,
      transactionHash: '' // Will be set when transaction confirms
    });

    try {
      // Call contract
      writeContract({
        address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS as `0x${string}`,
        abi: WHEEL_ABI,
        functionName: 'spin',
      });
    } catch (error: any) {
      console.error('Contract call failed:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to call contract",
        variant: "destructive",
      });
      setIsSpinning(false);
      setResult(null);
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
        
        {/* Spinning Wheel */}
        <motion.div
          className="w-64 h-64 rounded-full relative overflow-hidden shadow-2xl border-4 border-yellow-400"
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full border-2 border-yellow-400 flex items-center justify-center">
            <span className="text-yellow-400 font-bold text-xs">SPIN</span>
          </div>
        </motion.div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={!isConnected || userSpinsUsed >= 3 || isSpinning || isProcessing}
        className="w-48 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg"
      >
        {!isConnected ? 'Connect Wallet' : 
         userSpinsUsed >= 3 ? 'Daily Limit Reached' :
         isProcessing ? 'Processing...' :
         isSpinning ? 'Spinning...' : 
         'SPIN (Pay Gas)'}
      </Button>
      
      {/* Spins Counter */}
      <div className="text-center">
        <p className="text-white/80 text-sm">
          {3 - userSpinsUsed} spins remaining today
        </p>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {result && isSuccess && (
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
                  Reward: {result.reward} tokens
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}