import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WinPopup from "./win-popup";
import { type SpinResult } from "@shared/schema";
import { HapticFeedback } from "@/lib/haptics";
import { GestureHandler } from "@/lib/gesture-handler";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

const wheelSegments = [
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', name: 'BOOP', image: boopLogo, isToken: true, reward: '2000', color: '#10B981' },
  { id: 'bonus', name: 'BONUS', image: '', isToken: false, reward: '500', color: '#F59E0B' },
  { id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f', name: 'CATCH', image: catchLogo, isToken: true, reward: '1500', color: '#8B5CF6' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'mega', name: 'JACKPOT', image: '', isToken: false, reward: '5000', color: '#F97316' }
];

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<SpinResult | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedSegment, setLandedSegment] = useState<number | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useGameState();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const segmentAngle = 360 / wheelSegments.length;

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/spin", {
        userId: user?.id
      });
      return response.json() as Promise<SpinResult>;
    },
    onSuccess: (result) => {
      // Calculate which segment to land on
      const winningSegmentIndex = result.isWin 
        ? wheelSegments.findIndex(seg => seg.id === result.symbols?.[0])
        : wheelSegments.findIndex(seg => seg.id === 'bankrupt');
      
      const finalSegment = winningSegmentIndex >= 0 ? winningSegmentIndex : 1; // Default to bankrupt
      
      // Calculate rotation to land on the winning segment
      const targetAngle = -(finalSegment * segmentAngle) + (segmentAngle / 2);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = wheelRotation + (spins * 360) + targetAngle;
      
      setWheelRotation(finalRotation);
      setLandedSegment(finalSegment);
      
      if (result.isWin && result.rewardAmount) {
        setTimeout(() => {
          setWinResult(result);
          setShowWinPopup(true);
          setShowSparkles(true);
          HapticFeedback.success();
          setTimeout(() => setShowSparkles(false), 3000);
        }, 3000); // Wait for wheel to stop
      } else {
        setTimeout(() => {
          HapticFeedback.light();
        }, 3000);
      }
      
      // Invalidate queries to refresh user data and stats
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
    onError: (error: any) => {
      HapticFeedback.error();
      toast({
        title: "Spin Failed",
        description: error.message || "Failed to perform spin",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setTimeout(() => setIsSpinning(false), 3500);
    }
  });

  const handleSpin = () => {
    if (isSpinning || !user) return;
    
    if ((user.spinsUsed || 0) >= 5) {
      HapticFeedback.error();
      toast({
        title: "Daily Limit Reached",
        description: "You've used all your spins for today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    HapticFeedback.medium();
    setIsSpinning(true);
    setLandedSegment(null);
    spinMutation.mutate();
  };

  // Setup gesture handling
  useEffect(() => {
    if (containerRef.current) {
      const gestureHandler = new GestureHandler(containerRef.current);
      
      gestureHandler.onSwipeLeft = () => {
        if (!isSpinning) {
          HapticFeedback.light();
          handleSpin();
        }
      };
      
      gestureHandler.onSwipeRight = () => {
        if (!isSpinning) {
          HapticFeedback.light();
          handleSpin();
        }
      };

      let lastTapTime = 0;
      gestureHandler.onTap = () => {
        const now = Date.now();
        if (now - lastTapTime < 300) {
          if (!isSpinning) {
            HapticFeedback.medium();
            handleSpin();
          }
        }
        lastTapTime = now;
      };

      return () => gestureHandler.destroy();
    }
  }, [isSpinning, user]);

  const getTokenInfo = (tokenAddress: string | null | undefined) => {
    const tokenMap: Record<string, any> = {
      "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b": {
        name: "AiDoge",
        symbol: "AIDOGE",
        logo: "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg"
      },
      "0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3": {
        name: "Boop",
        symbol: "BOOP", 
        logo: "@assets/Boop_resized_1754468548333.webp"
      },
      "0xbc4c97fb9befaa8b41448e1dfcc5236da543217f": {
        name: "Catch",
        symbol: "CATCH",
        logo: "@assets/Logomark_colours_1754468507462.webp"
      }
    };
    return tokenAddress ? tokenMap[tokenAddress] : null;
  };

  return (
    <>
      {/* Modern Dark Container matching your UI */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto bg-card rounded-2xl p-6 select-none border border-border shadow-xl"
        style={{
          background: 'hsl(223, 29%, 12%)',
          borderColor: 'hsl(223, 18%, 22%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 1px 8px rgba(255, 255, 255, 0.05) inset'
        }}
      >
        {/* Sparkles for wins */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none text-yellow-400 text-2xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    zIndex: 50
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: 1,
                  }}
                  exit={{ opacity: 0 }}
                >
                  ✨
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            WHEEL OF FORTUNE
          </h1>
          <p className="text-sm text-muted-foreground italic">
            "Spin the wheel & win meme tokens"
          </p>
        </motion.div>

        {/* Wheel Container */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Main Wheel */}
          <motion.div
            className="relative w-64 h-64 rounded-full border-4 border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden"
            animate={{ rotate: wheelRotation }}
            transition={{ 
              duration: isSpinning ? 3 : 0,
              ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
            }}
          >
            {/* Wheel Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
            
            {/* Center Circle */}
            <div 
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-card border-2 border-white/30 flex items-center justify-center z-20"
              style={{ background: 'hsl(223, 29%, 12%)' }}
            >
              <span className="text-xs font-bold text-white">SPIN</span>
            </div>

            {/* Segment lines and labels */}
            {wheelSegments.map((segment, index) => (
              <div key={index} className="absolute inset-0">
                {/* Segment divider line */}
                <div 
                  className="absolute w-32 h-0.5 bg-white/30 origin-right"
                  style={{
                    top: '50%',
                    right: '50%',
                    transform: `rotate(${index * segmentAngle}deg) translateY(-50%)`
                  }}
                />
                
                {/* Segment content */}
                <div 
                  className="absolute flex flex-col items-center"
                  style={{
                    top: '20px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${index * segmentAngle + segmentAngle/2}deg)`,
                    transformOrigin: '50% 108px'
                  }}
                >
                  {segment.image ? (
                    <img 
                      src={segment.image} 
                      alt={segment.name}
                      className="w-6 h-6 rounded-full object-cover mb-1 border border-white/50"
                    />
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1 border border-white/50"
                      style={{ backgroundColor: segment.color }}
                    >
                      {segment.name === 'BUST' ? '✗' : 
                       segment.name === 'BONUS' ? '$' : 
                       segment.name === 'JACKPOT' ? '★' : '?'}
                    </div>
                  )}
                  <span 
                    className="text-xs text-white font-medium text-center leading-tight"
                    style={{ 
                      transform: `rotate(${-(index * segmentAngle + segmentAngle/2)}deg)`,
                      maxWidth: '40px'
                    }}
                  >
                    {segment.name}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Pointer */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
            <div 
              className="w-0 h-0 border-l-3 border-r-3 border-t-6 border-transparent border-t-white filter drop-shadow-md"
              style={{
                borderLeftWidth: '8px',
                borderRightWidth: '8px', 
                borderTopWidth: '20px',
                borderTopColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Spin Button */}
        <div className="flex flex-col items-center">
          <Button
            ref={spinButtonRef}
            onClick={handleSpin}
            disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
            data-testid="button-spin"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: 'hsl(207, 90%, 54%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <motion.span
              animate={isSpinning ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ 
                scale: { duration: 1, repeat: isSpinning ? Infinity : 0 }
              }}
            >
              {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
            </motion.span>
          </Button>
          
          {!isSpinning && user && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {5 - (user.spinsUsed || 0)} spins remaining
            </p>
          )}
        </div>

        {/* Win Display */}
        <AnimatePresence>
          {winResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30"
            >
              <div className="text-center">
                <motion.div 
                  className="text-xl font-bold text-green-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎉 WINNER! 🎉
                </motion.div>
                <div className="text-white">
                  <span className="text-lg font-bold">+{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(4)}</span>
                  <span className="ml-2 text-sm">TOKENS</span>
                </div>
                {winResult.transactionHash && (
                  <div className="text-xs text-muted-foreground mt-2 font-mono">
                    {winResult.transactionHash?.slice(0, 8)}...{winResult.transactionHash?.slice(-6)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Win Popup */}
      <WinPopup
        isOpen={showWinPopup}
        onClose={() => {
          setShowWinPopup(false);
          setWinResult(null);
        }}
        winResult={winResult}
        tokenInfo={getTokenInfo(winResult?.tokenAddress)}
      />
    </>
  );
}