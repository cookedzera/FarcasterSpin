import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MemeReel from "./loot-reel";
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
      // For wins, ensure all symbols match the winning symbol
      if (result.isWin && result.symbols && result.symbols.length > 0) {
        const winningSymbol = result.symbols[0];
        setSlotResults([winningSymbol, winningSymbol, winningSymbol]);
      } else {
        setSlotResults(result.symbols || ['🎯', '🐸', '🪙']);
      }
      
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
          className="font-pixel text-center text-2xl mb-6 text-yellow-400"
          animate={isSpinning ? {
            color: ["#facc15", "#f97316", "#dc2626", "#facc15"]
          } : {}}
          transition={{ duration: 1, repeat: isSpinning ? Infinity : 0 }}
        >
          🎰 MEME SLOT MACHINE 🎰
        </motion.h2>

        {/* Fun hint text */}
        <motion.p 
          className="text-sm text-center mb-6 text-green-400 font-mono"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: isSpinning ? 0.4 : [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🚀 Swipe or Double-Tap to Win Meme Coins! 🚀
        </motion.p>
      
        {/* Meme Slot Reels */}
        <div className="flex justify-center space-x-4 mb-8 relative">
          {/* Classic arcade background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black blur-lg rounded-2xl opacity-30" />
          
          {slotResults.map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
            >
              <MemeReel 
                symbol={symbol} 
                isSpinning={isSpinning}
                delay={index * 150}
              />
            </motion.div>
          ))}
        </div>

          {/* Slot Machine Pull Handle & Spin Button */}
          <div className="flex items-center justify-center space-x-6">
            
            {/* Classic Slot Machine Pull Handle */}
            <motion.div 
              className="relative"
              animate={isSpinning ? { rotate: [0, -20, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Handle Base */}
              <div className="w-3 h-16 bg-gradient-to-b from-gray-300 to-gray-600 rounded-full border-2 border-gray-700 shadow-lg"></div>
              
              {/* Handle Ball */}
              <motion.div 
                className="absolute -top-3 -left-3 w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-3 border-black shadow-2xl cursor-pointer"
                whileHover={!isSpinning ? { scale: 1.1 } : {}}
                whileTap={!isSpinning ? { scale: 0.9 } : {}}
                onClick={handleSpin}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                {/* Ball highlight */}
                <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full"></div>
              </motion.div>
              
              {/* Handle connecting rod */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gray-500"></div>
            </motion.div>

            {/* Compact Spin Button */}
            <motion.div
              whileHover={!isSpinning ? { scale: 1.02 } : {}}
              whileTap={!isSpinning ? { scale: 0.98 } : {}}
              animate={isSpinning ? {
                rotate: [0, 360],
                boxShadow: [
                  "0 2px 10px rgba(255, 193, 7, 0.3)",
                  "0 4px 20px rgba(255, 193, 7, 0.6)",
                  "0 2px 10px rgba(255, 193, 7, 0.3)"
                ]
              } : {}}
              transition={{ 
                rotate: { duration: 2, repeat: isSpinning ? Infinity : 0, ease: "linear" },
                boxShadow: { duration: 1, repeat: isSpinning ? Infinity : 0 }
              }}
            >
              <Button
                ref={spinButtonRef}
                onClick={handleSpin}
                disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
                data-testid="button-spin"
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-4 border-yellow-200 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-manipulation"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                {/* Gear teeth around the edge */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: `conic-gradient(from 0deg, 
                    transparent 0deg, transparent 10deg,
                    rgba(0,0,0,0.2) 10deg, rgba(0,0,0,0.2) 20deg,
                    transparent 20deg, transparent 30deg,
                    rgba(0,0,0,0.2) 30deg, rgba(0,0,0,0.2) 40deg,
                    transparent 40deg, transparent 50deg,
                    rgba(0,0,0,0.2) 50deg, rgba(0,0,0,0.2) 60deg,
                    transparent 60deg, transparent 70deg,
                    rgba(0,0,0,0.2) 70deg, rgba(0,0,0,0.2) 80deg,
                    transparent 80deg, transparent 90deg,
                    rgba(0,0,0,0.2) 90deg, rgba(0,0,0,0.2) 100deg,
                    transparent 100deg, transparent 110deg,
                    rgba(0,0,0,0.2) 110deg, rgba(0,0,0,0.2) 120deg,
                    transparent 120deg)`
                }}></div>

                {/* Inner circle */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 border-2 border-orange-600 flex items-center justify-center">
                  
                  {/* Center icon */}
                  <motion.div
                    animate={isSpinning ? { rotate: [0, -360] } : {}}
                    transition={{ duration: 1.5, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
                    className="text-2xl font-bold text-orange-800 drop-shadow-sm"
                  >
                    {isSpinning ? "⚡" : "🎲"}
                  </motion.div>
                </div>

                {/* Highlight shine */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
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
