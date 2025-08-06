import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SlotReelProps {
  symbol: string;
  isSpinning: boolean;
  delay?: number;
}

const symbols = ['🎯', '🐸', '🪙', '💀', '🌈', '🍌'];

export default function SlotReel({ symbol, isSpinning, delay = 0 }: SlotReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setIsAnimating(true);
        
        // Cycle through random symbols during animation
        const interval = setInterval(() => {
          setDisplaySymbol(symbols[Math.floor(Math.random() * symbols.length)]);
        }, 100);

        // Stop animation and set final symbol
        setTimeout(() => {
          clearInterval(interval);
          setDisplaySymbol(symbol);
          setIsAnimating(false);
        }, 2000);
      }, delay);
    }
  }, [isSpinning, symbol, delay]);

  return (
    <div className="slot-container bg-background rounded-lg border-2 border-primary w-20 h-20 flex items-center justify-center neon-border overflow-hidden">
      <motion.div
        className="text-4xl"
        animate={isAnimating ? {
          y: [-200, 0, -200, 0],
          transition: {
            duration: 2,
            ease: "easeOut"
          }
        } : {}}
        style={{
          filter: isAnimating ? "blur(2px)" : "none"
        }}
      >
        {displaySymbol}
      </motion.div>
    </div>
  );
}
