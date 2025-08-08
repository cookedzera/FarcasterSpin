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
      {/* Modern Glass Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-md mx-auto rounded-3xl p-8 select-none"
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
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
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
                    delay: i * 0.05,
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
            MEME SLOTS
          </motion.h1>
          <motion.p 
            className="text-slate-400 text-sm font-medium tracking-wide"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Win Real Meme Tokens • Base Network
          </motion.p>
        </motion.div>
      
        {/* Modern Slot Reels */}
        <div className="flex justify-center gap-4 mb-8">
          {slotResults.map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Glass Reel Container */}
              <div 
                className="w-20 h-24 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <MemeReel 
                  symbol={symbol} 
                  isSpinning={isSpinning}
                  delay={index * 150}
                />
                
                {/* Reel Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-50"
                  style={{
                    background: isSpinning 
                      ? 'linear-gradient(45deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                      : 'transparent',
                    animation: isSpinning ? 'pulse 1s infinite' : 'none'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Section */}
        <div className="flex items-center justify-center">
          {/* Modern Spin Button */}
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
              className="relative w-24 h-24 rounded-full border-0 overflow-hidden touch-manipulation disabled:opacity-50"
              style={{ 
                background: isSpinning 
                  ? 'linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)'
                  : 'linear-gradient(135deg, #f97316, #eab308, #22c55e)',
                boxShadow: `0 10px 40px -10px ${isSpinning ? 'rgba(139,92,246,0.6)' : 'rgba(249,115,22,0.6)'}, 0 0 0 1px rgba(255,255,255,0.1)`,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {/* Button Content */}
              <motion.div
                className="flex flex-col items-center justify-center h-full"
                animate={isSpinning ? {
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  rotate: { duration: 2, repeat: isSpinning ? Infinity : 0, ease: "linear" },
                  scale: { duration: 1, repeat: isSpinning ? Infinity : 0 }
                }}
              >
                <span className="text-white font-black text-sm tracking-wider drop-shadow-lg">
                  {isSpinning ? "⚡" : "SPIN"}
                </span>
                {!isSpinning && (
                  <span className="text-white/80 text-xs font-medium">
                    {user ? `${5 - (user.spinsUsed || 0)} left` : 'Ready'}
                  </span>
                )}
              </motion.div>
              
              {/* Animated Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={isSpinning ? {
                  rotate: [0, -360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ 
                  duration: 3, 
                  repeat: isSpinning ? Infinity : 0, 
                  ease: "linear" 
                }}
              />
            </Button>
            
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 rounded-full -z-10 blur-xl opacity-60"
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
                🎉 JACKPOT! 🎉
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
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-repeat" style={{
                backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
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