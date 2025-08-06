import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SlotReel from "./slot-reel";
import WinPopup from "./win-popup";
import { type SpinResult } from "@shared/schema";
import { HapticFeedback } from "@/lib/haptics";
import { GestureHandler } from "@/lib/gesture-handler";

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<SpinResult | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [slotResults, setSlotResults] = useState<string[]>(['🪙', '💎', '🏆']);
  const [showSparkles, setShowSparkles] = useState(false);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useGameState();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/spin", {
        userId: user?.id
      });
      return response.json() as Promise<SpinResult>;
    },
    onSuccess: (result) => {
      setSlotResults(result.symbols || ['🎯', '🐸', '🪙']);
      
      if (result.isWin && result.rewardAmount) {
        setWinResult(result);
        setShowWinPopup(true);
        setShowSparkles(true);
        // Heavy haptic feedback for wins
        HapticFeedback.success();
        // Hide sparkles after animation
        setTimeout(() => setShowSparkles(false), 3000);
      } else {
        // Light feedback for non-wins
        HapticFeedback.light();
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
      setTimeout(() => setIsSpinning(false), 2500);
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

    // Medium haptic feedback when starting spin
    HapticFeedback.medium();
    setIsSpinning(true);
    spinMutation.mutate();
  };

  // Setup gesture handling
  useEffect(() => {
    if (containerRef.current) {
      const gestureHandler = new GestureHandler(containerRef.current);
      
      // Swipe up or tap to spin
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

      // Double tap anywhere to spin
      let lastTapTime = 0;
      gestureHandler.onTap = () => {
        const now = Date.now();
        if (now - lastTapTime < 300) {
          // Double tap detected
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

  // Real token info from GeckoTerminal
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
      <div 
        ref={containerRef}
        className="bg-card rounded-xl border border-border neon-border p-6 relative overflow-hidden select-none"
      >
        {/* Premium sparkles effect for wins */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360, 720],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: 2,
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.h2 
          className="font-pixel text-center text-green-400 text-lg mb-6 neon-green-text"
          animate={isSpinning ? {
            textShadow: [
              "0 0 5px #22c55e",
              "0 0 15px #22c55e, 0 0 25px #22c55e",
              "0 0 5px #22c55e"
            ]
          } : {}}
          transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
        >
          🎰 SPIN MACHINE
        </motion.h2>

        {/* Gesture hint text */}
        <motion.p 
          className="text-xs text-muted-foreground text-center mb-4 font-mono"
          initial={{ opacity: 0.5 }}
          animate={{ 
            opacity: isSpinning ? 0.2 : [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Swipe left/right or double-tap to spin
        </motion.p>
      
        {/* Slot Machine Reels */}
        <div className="flex justify-center space-x-4 mb-6">
              {slotResults.map((symbol, index) => (
              <SlotReel 
                key={index} 
                symbol={symbol} 
                isSpinning={isSpinning}
                delay={index * 200}
              />
            ))}
          </div>

          {/* Spin Button */}
          <div className="text-center">
            <motion.div
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              animate={isSpinning ? {
                scale: [1, 1.02, 1],
                boxShadow: [
                  "0 4px 20px rgba(59, 130, 246, 0.3)",
                  "0 8px 30px rgba(59, 130, 246, 0.6)",
                  "0 4px 20px rgba(59, 130, 246, 0.3)"
                ]
              } : {}}
              transition={{ duration: 0.8, repeat: isSpinning ? Infinity : 0 }}
            >
              <Button
                ref={spinButtonRef}
                onClick={handleSpin}
                disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
                data-testid="button-spin"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-primary text-white font-pixel text-lg px-8 py-6 rounded-xl border-2 border-primary neon-border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden touch-manipulation"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-xl" />
                
                {/* Button text with animation */}
                <motion.span
                  animate={isSpinning ? {
                    color: ["#ffffff", "#fbbf24", "#ffffff"]
                  } : {}}
                  transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
                  className="relative z-10"
                >
                  {isSpinning ? "🎲 SPINNING..." : "🎯 SPIN TO WIN"}
                </motion.span>
                
                {/* Pulse effect when spinning */}
                {isSpinning && (
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </Button>
            </motion.div>
          </div>

      {/* Win Display */}
      {winResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="mt-4 bg-gradient-to-r from-green-900 to-green-800 rounded-xl border-2 border-green-400 neon-border p-4"
        >
          <div className="text-center">
            <motion.div 
              className="text-green-400 font-pixel text-lg mb-2 winning-glow"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              🎁 YOU WON!
            </motion.div>
            <div className="text-2xl font-bold text-white">
              <span>{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(6)}</span> 
              <span className="text-green-400 ml-2">TOKENS</span> 
              <span className="text-2xl ml-2">🪙</span>
            </div>
            {winResult.transactionHash && (
              <div className="text-xs text-green-300 mt-2">
                TX: {winResult.transactionHash?.slice(0, 10)}...{winResult.transactionHash?.slice(-8)}
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
