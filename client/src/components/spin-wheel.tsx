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
        className="bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 rounded-xl border-2 border-cyan-400 shadow-2xl p-6 relative overflow-hidden select-none"
        style={{
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 30px rgba(6, 182, 212, 0.1)'
        }}
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

        {/* Header with BrbCasino branding */}
        <motion.div 
          className="text-center mb-4"
          animate={isSpinning ? {
            scale: [1, 1.02, 1]
          } : {}}
          transition={{ duration: 2, repeat: isSpinning ? Infinity : 0 }}
        >
          <div className="mb-2">
            <h3 className="text-cyan-400 text-lg font-bold tracking-wider" 
                style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.8)' }}>
              BrbCasino
            </h3>
            <p className="text-cyan-300 text-xs">• Arbitrum One Only</p>
          </div>
          <h1 className="font-bold text-3xl md:text-4xl font-bold tracking-wider mb-1 text-red-400" 
              style={{ 
                textShadow: '0 0 20px rgba(248, 113, 113, 0.8), 2px 2px 4px rgba(0,0,0,0.8)',
                background: 'linear-gradient(45deg, #f87171, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
            MEME SLOT
          </h1>
          <h2 className="font-bold text-3xl md:text-4xl font-bold tracking-wider text-red-400" 
              style={{ 
                textShadow: '0 0 20px rgba(248, 113, 113, 0.8), 2px 2px 4px rgba(0,0,0,0.8)',
                background: 'linear-gradient(45deg, #f87171, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
            MACHINE
          </h2>
        </motion.div>

        <motion.p 
          className="text-center mb-6 text-green-400 font-mono text-sm px-4"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: isSpinning ? 0.4 : [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.6)' }}
        >
          Swipe or Double-Tap to Win Meme Coins!
        </motion.p>
      
        {/* Classic Slot Machine Reels */}
        <div className="flex justify-center space-x-3 mb-6 px-4">
          {slotResults.map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Reel Frame - Card Style */}
              <div className="w-24 h-32 bg-gradient-to-b from-gray-100 to-white border-4 border-gray-800 rounded-lg shadow-2xl relative overflow-hidden"
                   style={{
                     boxShadow: '0 8px 25px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.8)'
                   }}>
                {/* Inner content area */}
                <div className="absolute inset-2 bg-white rounded-sm overflow-hidden border border-gray-200">
                  <MemeReel 
                    symbol={symbol} 
                    isSpinning={isSpinning}
                    delay={index * 150}
                  />
                </div>
                
                {/* "ALMOST" text at bottom */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-red-600 rounded px-2 py-0.5">
                  <span className="text-white font-bold text-xs">ALMOST</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

          {/* Control Panel */}
          <div className="flex items-center justify-center space-x-8 px-6">
            
            {/* Classic Pull Handle */}
            <motion.div 
              className="relative cursor-pointer"
              animate={isSpinning ? { rotate: [0, -25, 0] } : {}}
              transition={{ duration: 0.6 }}
              onClick={handleSpin}
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {/* Handle Shaft */}
              <div className="w-5 h-24 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 rounded-full border-3 border-gray-800 shadow-xl relative"
                   style={{
                     boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 2px 0 8px rgba(255,255,255,0.3)'
                   }}>
                {/* Shaft highlights */}
                <div className="absolute top-2 left-1 w-1.5 h-20 bg-gradient-to-b from-white/70 to-transparent rounded-full"></div>
                {/* Shaft base */}
                <div className="absolute -bottom-1 -left-1 w-7 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg border-x-2 border-b-2 border-gray-900"></div>
              </div>
              
              {/* Handle Knob */}
              <div className="absolute -top-5 -left-5 w-16 h-16 bg-gradient-to-br from-red-400 via-red-500 to-red-700 rounded-full border-4 border-gray-800 shadow-2xl"
                   style={{
                     boxShadow: '0 6px 20px rgba(0,0,0,0.6), inset 2px 2px 10px rgba(255,255,255,0.3)'
                   }}>
                {/* Knob highlight */}
                <div className="absolute top-2 left-3 w-6 h-6 bg-white/50 rounded-full blur-sm"></div>
                {/* Knob detail rings */}
                <div className="absolute inset-2 border-3 border-red-300/40 rounded-full"></div>
                <div className="absolute inset-4 border-2 border-red-200/30 rounded-full"></div>
              </div>
            </motion.div>

            {/* Spin Button */}
            <motion.div
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              animate={isSpinning ? {
                rotate: [0, 360]
              } : {}}
              transition={{ 
                rotate: { duration: 3, repeat: isSpinning ? Infinity : 0, ease: "linear" }
              }}
            >
              <Button
                ref={spinButtonRef}
                onClick={handleSpin}
                disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
                data-testid="button-spin"
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 hover:from-orange-200 hover:via-orange-300 hover:to-orange-500 border-6 border-orange-100 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-manipulation"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 3px 15px rgba(255,255,255,0.4), 0 0 20px rgba(251, 146, 60, 0.4)'
                }}
              >
                {/* Button Center */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 border-3 border-orange-500 flex items-center justify-center"
                     style={{
                       boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                     }}>
                  <motion.span
                    animate={isSpinning ? { 
                      scale: [1, 1.2, 1],
                      textShadow: ['0 0 5px rgba(251, 146, 60, 0.8)', '0 0 15px rgba(251, 146, 60, 1)', '0 0 5px rgba(251, 146, 60, 0.8)']
                    } : {}}
                    transition={{ duration: 1, repeat: isSpinning ? Infinity : 0 }}
                    className="text-orange-900 font-bold text-lg"
                    style={{
                      textShadow: '0 0 8px rgba(251, 146, 60, 0.6)'
                    }}
                  >
                    {isSpinning ? "..." : "SPIN"}
                  </motion.span>
                </div>

                {/* Button shine effect */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/50 via-transparent to-transparent"></div>
                
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 blur-md -z-10"></div>
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
