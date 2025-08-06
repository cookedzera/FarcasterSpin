import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

interface SlotReelProps {
  symbol: string;
  isSpinning: boolean;
  delay?: number;
}

const tokenSymbols = [
  '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', // AIDOGE
  '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', // BOOP
  '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f'  // CATCH
];

const getTokenLogo = (tokenAddress: string) => {
  switch(tokenAddress) {
    case '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b':
      return aidogeLogo;
    case '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3':
      return boopLogo;
    case '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f':
      return catchLogo;
    default:
      return aidogeLogo;
  }
};

export default function SlotReel({ symbol, isSpinning, delay = 0 }: SlotReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setIsAnimating(true);
        
        // Cycle through random symbols during animation
        const interval = setInterval(() => {
          setDisplaySymbol(tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]);
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
        className="w-12 h-12 flex items-center justify-center"
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
        <img 
          src={getTokenLogo(displaySymbol)} 
          alt="Token" 
          className="w-10 h-10 rounded-full object-cover border border-primary/30"
        />
      </motion.div>
    </div>
  );
}
