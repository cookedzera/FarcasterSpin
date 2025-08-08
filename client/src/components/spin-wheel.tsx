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
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, color: '#FF6B35', reward: '1000' },
  { id: 'bankrupt', name: 'BANKRUPT', image: '', color: '#DC2626', reward: '0' },
  { id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', name: 'BOOP', image: boopLogo, color: '#4ECDC4', reward: '2000' },
  { id: 'bonus', name: 'BONUS', image: '', color: '#F59E0B', reward: '500' },
  { id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f', name: 'CATCH', image: catchLogo, color: '#45B7D1', reward: '1500' },
  { id: 'bankrupt', name: 'BANKRUPT', image: '', color: '#DC2626', reward: '0' },
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, color: '#FF6B35', reward: '1000' },
  { id: 'mega', name: 'MEGA WIN', image: '', color: '#8B5CF6', reward: '5000' }
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
      {/* Modern Glass Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-lg mx-auto rounded-3xl p-8 select-none"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 50%, rgba(0,0,0,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(99,102,241,0.3)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Premium sparkles effect for wins */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    filter: 'blur(0.5px)'
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.03,
                    repeat: 3,
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          animate={isSpinning ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: isSpinning ? Infinity : 0 }}
        >
          <motion.h1 
            className="text-4xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #f97316 75%, #eab308 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))'
            }}
          >
            WHEEL OF FORTUNE
          </motion.h1>
          <motion.p 
            className="text-slate-400 text-sm font-medium tracking-wide"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Spin to Win Meme Tokens • Base Network
          </motion.p>
        </motion.div>

        {/* Wheel Container */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Wheel */}
          <motion.div
            className="relative w-80 h-80 rounded-full overflow-hidden"
            style={{
              background: 'conic-gradient(from 0deg, ' + 
                wheelSegments.map((segment, index) => 
                  `${segment.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`
                ).join(', ') + ')',
              border: '6px solid rgba(255,255,255,0.3)',
              boxShadow: '0 0 50px rgba(99,102,241,0.4), inset 0 0 20px rgba(0,0,0,0.5)'
            }}
            animate={{ rotate: wheelRotation }}
            transition={{ 
              duration: isSpinning ? 3 : 0,
              ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
            }}
          >
            {/* Wheel Segments */}
            {wheelSegments.map((segment, index) => (
              <div
                key={index}
                className="absolute w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotate(${index * segmentAngle}deg)`,
                  transformOrigin: '50% 50%'
                }}
              >
                <div 
                  className="flex flex-col items-center justify-center absolute"
                  style={{
                    top: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  {segment.image ? (
                    <img 
                      src={segment.image} 
                      alt={segment.name}
                      className="w-8 h-8 rounded-lg object-cover mb-1 border border-white/30"
                    />
                  ) : (
                    <div className="w-8 h-8 mb-1 flex items-center justify-center text-white text-lg">
                      {segment.name === 'BANKRUPT' ? '💀' : 
                       segment.name === 'BONUS' ? '🎁' : '👑'}
                    </div>
                  )}
                  <span 
                    className="text-white text-xs font-bold text-center leading-tight"
                    style={{ 
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      fontSize: '9px'
                    }}
                  >
                    {segment.name}
                  </span>
                </div>
                
                {/* Segment separator line */}
                <div 
                  className="absolute w-0.5 h-full bg-white/30"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    transformOrigin: '50% 100%'
                  }}
                />
              </div>
            ))}

            {/* Center circle */}
            <div 
              className="absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1f2937, #111827)',
                border: '3px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
              }}
            >
              <span className="text-white text-xs font-bold">SPIN</span>
            </div>
          </motion.div>

          {/* Pointer */}
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 z-10"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '30px solid #fbbf24',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
            }}
          />
          
          {/* Pointer base */}
          <div 
            className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full z-20"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
            }}
          />
        </div>

        {/* Spin Button */}
        <div className="flex items-center justify-center">
          <motion.div
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            className="relative"
          >
            <Button
              ref={spinButtonRef}
              onClick={handleSpin}
              disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
              data-testid="button-spin"
              className="relative w-32 h-16 rounded-2xl border-0 overflow-hidden touch-manipulation disabled:opacity-50 font-black text-lg"
              style={{ 
                background: isSpinning 
                  ? 'linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)'
                  : 'linear-gradient(135deg, #f97316, #eab308, #22c55e)',
                boxShadow: `0 10px 40px -10px ${isSpinning ? 'rgba(139,92,246,0.6)' : 'rgba(249,115,22,0.6)'}, 0 0 0 1px rgba(255,255,255,0.1)`,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <motion.div
                className="flex flex-col items-center justify-center h-full text-white"
                animate={isSpinning ? {
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  scale: { duration: 1, repeat: isSpinning ? Infinity : 0 }
                }}
              >
                <span className="drop-shadow-lg">
                  {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
                </span>
                {!isSpinning && (
                  <span className="text-white/80 text-xs font-medium">
                    {user ? `${5 - (user.spinsUsed || 0)} spins left` : 'Ready to play'}
                  </span>
                )}
              </motion.div>
            </Button>
            
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 rounded-2xl -z-10 blur-xl opacity-60"
              style={{
                background: isSpinning 
                  ? 'radial-gradient(circle, #8b5cf6, transparent)'
                  : 'radial-gradient(circle, #f97316, transparent)'
              }}
            />
          </motion.div>
        </div>

        {/* Win Display */}
        {winResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mt-6 p-6 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.15) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 10px 30px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <div className="text-center relative z-10">
              <motion.div 
                className="text-2xl font-black mb-3"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #10b981, #059669)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.5))'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🎉 WINNER! 🎉
              </motion.div>
              <div className="text-xl font-bold text-white mb-2">
                <span className="text-2xl">+{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(4)}</span>
                <span className="text-green-400 ml-2 text-sm">TOKENS</span>
              </div>
              {winResult.transactionHash && (
                <div className="text-xs text-green-300/80 font-mono bg-black/20 rounded-lg px-3 py-1 inline-block">
                  {winResult.transactionHash?.slice(0, 8)}...{winResult.transactionHash?.slice(-6)}
                </div>
              )}
            </div>
          </motion.div>
        )}
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