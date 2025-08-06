import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SlotReel from "./slot-reel";
import WinPopup from "./win-popup";
import { type SpinResult } from "@shared/schema";

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<SpinResult | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [slotResults, setSlotResults] = useState<string[]>(['🪙', '💎', '🏆']);
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
      }
      
      // Invalidate queries to refresh user data and stats
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
    onError: (error: any) => {
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
      toast({
        title: "Daily Limit Reached",
        description: "You've used all your spins for today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    spinMutation.mutate();
  };

  // Real token info from GeckoTerminal
  const getTokenInfo = (tokenAddress: string | null | undefined) => {
    const tokenMap: Record<string, any> = {
      "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b": {
        name: "AiDoge",
        symbol: "AIDOGE",
        logo: "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg"
      },
      "0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3": {
        name: "Second Token", 
        symbol: "TOKEN2",
        logo: "/api/placeholder/32/32" // Waiting for token info
      },
      "0xbc4c97fb9befaa8b41448e1dfcc5236da543217f": {
        name: "Third Token",
        symbol: "TOKEN3", 
        logo: "/api/placeholder/32/32" // Waiting for token info
      }
    };
    return tokenAddress ? tokenMap[tokenAddress] : null;
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border neon-border p-6">
        <h2 className="font-pixel text-center text-green-400 text-lg mb-6 neon-green-text">
          🎰 SPIN MACHINE
        </h2>
      
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
        <Button
          onClick={handleSpin}
          disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
          className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-primary text-white font-pixel text-lg px-8 py-6 rounded-xl border-2 border-primary neon-border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "🎲 SPINNING..." : "🎯 SPIN TO WIN"}
        </Button>
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
