import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Gift } from "lucide-react";
import { ethers } from "ethers";

const WHEEL_SEGMENTS = [
  { name: 'AIDOGE', color: '#3B82F6', reward: '1' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'BOOP', color: '#10B981', reward: '2' },
  { name: 'BONUS', color: '#F59E0B', reward: '2x' },
  { name: 'ABET', color: '#8B5CF6', reward: '0.5' },
  { name: 'BUST', color: '#EF4444', reward: '0' },
  { name: 'AIDOGE', color: '#3B82F6', reward: '1' },
  { name: 'JACKPOT', color: '#F97316', reward: '10x' },
];

interface SpinResult {
  segment: string;
  isWin: boolean;
  tokenType: string;
  tokenAddress: string;
  rewardAmount: string;
  spinsRemaining: number;
  totalAccumulated: {
    AIDOGE: string;
    BOOP: string;
    BOBOTRUM: string;
  };
}

interface SpinWheelFreeProps {
  onSpinComplete?: (result: SpinResult) => void;
  userSpinsUsed: number;
  userId: string;
  userAccumulated?: {
    AIDOGE: string;
    BOOP: string;
    BOBOTRUM: string;
  };
}

export default function SpinWheelFree({ 
  onSpinComplete, 
  userSpinsUsed, 
  userId,
  userAccumulated 
}: SpinWheelFreeProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showClaimOptions, setShowClaimOptions] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const spinsRemaining = Math.max(0, 3 - userSpinsUsed);
  const hasAccumulatedRewards = userAccumulated && (
    BigInt(userAccumulated.AIDOGE) > 0 ||
    BigInt(userAccumulated.BOOP) > 0 ||
    BigInt(userAccumulated.BOBOTRUM) > 0
  );

  const handleSpin = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to spin",
        variant: "destructive",
      });
      return;
    }

    if (spinsRemaining <= 0) {
      toast({
        title: "Daily Limit Reached",
        description: "Come back tomorrow for more spins!",
        variant: "destructive",
      });
      return;
    }

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

      const spinResult: SpinResult = await response.json();
      
      // Animate wheel to result
      const resultSegment = WHEEL_SEGMENTS.find(s => s.name === spinResult.segment) || WHEEL_SEGMENTS[0];
      const segmentIndex = WHEEL_SEGMENTS.indexOf(resultSegment);
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      const targetAngle = segmentIndex * segmentAngle;
      const spins = 3; // 3 full rotations
      const finalRotation = rotation + (spins * 360) - targetAngle;
      
      setRotation(finalRotation);
      
      // Show result after animation
      setTimeout(() => {
        setResult(spinResult);
        setIsSpinning(false);
        
        toast({
          title: spinResult.isWin ? "🎉 You Won!" : "💀 Better Luck Next Time!",
          description: spinResult.isWin 
            ? `${spinResult.segment} - ${ethers.formatEther(spinResult.rewardAmount)} tokens!`
            : `${spinResult.segment} - Try again!`,
          variant: spinResult.isWin ? "default" : "destructive",
        });
        
        if (onSpinComplete) {
          onSpinComplete(spinResult);
        }
      }, 3000);

    } catch (error: any) {
      console.error("Spin error:", error);
      setIsSpinning(false);
      
      toast({
        title: "Spin Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSingleClaim = async (tokenType: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/claim-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userAddress: address,
          tokenType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Claim failed');
      }

      const claimResult = await response.json();
      
      toast({
        title: "🎉 Tokens Claimed!",
        description: `${ethers.formatEther(claimResult.amount)} ${tokenType} sent to your wallet`,
      });

      // Refresh user data
      if (onSpinComplete) {
        // Trigger a refresh by calling parent callback
        onSpinComplete({
          ...result!,
          totalAccumulated: claimResult.remaining
        });
      }

    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBatchClaim = async () => {
    if (!address) return;

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

      // Refresh user data
      if (onSpinComplete) {
        onSpinComplete({
          ...result!,
          totalAccumulated: {
            AIDOGE: "0",
            BOOP: "0", 
            BOBOTRUM: "0"
          }
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

  return (
    <div className="flex flex-col items-center space-y-6">
      
      {/* Spin Status */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-bold">
            {spinsRemaining} Free Spins Remaining
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Reset in {new Date(Date.now() + 24*60*60*1000).toLocaleDateString()}
        </p>
      </div>

      {/* Wheel Container */}
      <div className="relative">
        <motion.div
          className="w-64 h-64 rounded-full border-4 border-primary relative overflow-hidden shadow-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {WHEEL_SEGMENTS.map((segment, index) => (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                backgroundColor: segment.color,
                transform: `rotate(${index * 45}deg)`,
                clipPath: 'polygon(0 100%, 100% 100%, 70.7% 29.3%)'
              }}
            >
              <div 
                className="absolute bottom-2 right-2 text-white text-xs font-bold"
                style={{ transform: `rotate(${22.5}deg)` }}
              >
                {segment.name}
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || spinsRemaining <= 0 || !isConnected}
        size="lg"
        className="w-48"
        data-testid="button-spin-free"
      >
        {isSpinning ? "Spinning..." : spinsRemaining > 0 ? "🎰 Spin FREE!" : "Daily Limit Reached"}
      </Button>

      {/* Accumulated Rewards Display */}
      {hasAccumulatedRewards && (
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              Accumulated Rewards
            </h3>
            <p className="text-sm text-muted-foreground">
              Your winnings are ready to claim!
            </p>
          </div>

          <div className="space-y-2">
            {userAccumulated?.AIDOGE && BigInt(userAccumulated.AIDOGE) > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">AIDOGE</Badge>
                  <span className="font-mono">{ethers.formatEther(userAccumulated.AIDOGE)}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSingleClaim('AIDOGE')}
                  data-testid="button-claim-aidoge"
                >
                  Claim
                </Button>
              </div>
            )}

            {userAccumulated?.BOOP && BigInt(userAccumulated.BOOP) > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">BOOP</Badge>
                  <span className="font-mono">{ethers.formatEther(userAccumulated.BOOP)}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSingleClaim('BOOP')}
                  data-testid="button-claim-boop"
                >
                  Claim
                </Button>
              </div>
            )}

            {userAccumulated?.BOBOTRUM && BigInt(userAccumulated.BOBOTRUM) > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">BOBOTRUM</Badge>
                  <span className="font-mono">{ethers.formatEther(userAccumulated.BOBOTRUM)}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSingleClaim('BOBOTRUM')}
                  data-testid="button-claim-bobotrum"
                >
                  Claim
                </Button>
              </div>
            )}
          </div>

          {/* Batch Claim Button */}
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleBatchClaim}
              data-testid="button-claim-all"
            >
              <Coins className="w-4 h-4 mr-2" />
              Claim All (Recommended - Save Gas!)
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Save gas fees by claiming all tokens in one transaction
            </p>
          </div>
        </div>
      )}

      {/* Latest Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-2"
          >
            <div className={`text-xl font-bold ${result.isWin ? 'text-green-500' : 'text-red-500'}`}>
              {result.isWin ? '🎉 You Won!' : '💀 Try Again!'}
            </div>
            <div className="text-lg">
              {result.segment}
              {result.isWin && (
                <span className="ml-2 text-sm text-muted-foreground">
                  +{ethers.formatEther(result.rewardAmount)} {result.tokenType}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}