import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SlotReel from "./slot-reel";
import { type SpinResult } from "@shared/schema";

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<SpinResult | null>(null);
  const [slotResults, setSlotResults] = useState<string[]>(['🎯', '🐸', '🪙']);
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
      
      if (result.isWin) {
        setWinResult(result);
        setTimeout(() => setWinResult(null), 3000);
        toast({
          title: "🎉 You Won!",
          description: `${result.rewardAmount} ${result.rewardToken} tokens!`,
          variant: "default",
        });
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
    
    if ((user.spinsUsed || 0) >= 2) {
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

  return (
    <div className="bg-card rounded-xl border border-border neon-border p-6">
      <h2 className="font-pixel text-center text-green-400 text-lg mb-6 neon-green-text">
        🎡 SPIN WHEEL
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
          disabled={isSpinning || !user || (user.spinsUsed || 0) >= 2}
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
              <span>{winResult.rewardAmount}</span> 
              <span className="text-green-400 ml-2">{winResult.rewardToken}</span> 
              <span className="text-2xl ml-2">🐸</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
