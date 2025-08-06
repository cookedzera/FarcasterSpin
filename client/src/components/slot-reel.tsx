import { motion, AnimatePresence } from "framer-motion";
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
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'stopping' | 'complete'>('idle');

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setAnimationPhase('spinning');
        setIsAnimating(true);
        
        // Fast cycle phase - rapid symbol changes
        const fastInterval = setInterval(() => {
          setDisplaySymbol(tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]);
        }, 80);

        // Slow down phase after 1.5 seconds
        setTimeout(() => {
          clearInterval(fastInterval);
          setAnimationPhase('stopping');
          
          const slowInterval = setInterval(() => {
            setDisplaySymbol(tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)]);
          }, 200);

          // Final result
          setTimeout(() => {
            clearInterval(slowInterval);
            setDisplaySymbol(symbol);
            setAnimationPhase('complete');
            setIsAnimating(false);
          }, 800);
        }, 1500);
      }, delay);
    } else {
      setAnimationPhase('idle');
    }
  }, [isSpinning, symbol, delay]);

  const getAnimationVariants = () => {
    switch (animationPhase) {
      case 'spinning':
        return {
          y: [0, -400, 0, -400, 0],
          scale: [1, 0.8, 1, 0.8, 1],
          rotateY: [0, 180, 360, 540, 720],
          transition: {
            duration: 1.5,
            ease: "linear",
            repeat: Infinity
          }
        };
      case 'stopping':
        return {
          y: [0, -200, 0],
          scale: [1, 0.9, 1],
          rotateY: [0, 180, 360],
          transition: {
            duration: 0.8,
            ease: "easeOut"
          }
        };
      case 'complete':
        return {
          scale: [0.9, 1.1, 1],
          rotateY: [360, 0],
          boxShadow: [
            "0 0 0px rgba(59, 130, 246, 0)",
            "0 0 20px rgba(59, 130, 246, 0.8)",
            "0 0 0px rgba(59, 130, 246, 0)"
          ],
          transition: {
            duration: 0.6,
            ease: "backOut"
          }
        };
      default:
        return {};
    }
  };

  return (
    <div className="slot-container relative bg-gradient-to-br from-background via-background to-background/80 rounded-xl border-2 border-primary w-24 h-24 md:w-20 md:h-20 flex items-center justify-center neon-border overflow-hidden shadow-lg">
      {/* Premium background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 rounded-xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/10 to-transparent rounded-xl" />
      
      {/* Animated particles during spinning */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main reel content */}
      <motion.div
        className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center relative z-10"
        animate={getAnimationVariants()}
        style={{
          filter: isAnimating ? 
            animationPhase === 'spinning' ? "blur(3px) brightness(1.2)" : 
            animationPhase === 'stopping' ? "blur(1px) brightness(1.1)" : 
            "none" : "none"
        }}
      >
        <motion.img 
          src={getTokenLogo(displaySymbol)} 
          alt="Token" 
          className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border-2 border-primary/50 shadow-lg"
          animate={animationPhase === 'complete' ? {
            borderColor: ["rgba(59, 130, 246, 0.5)", "rgba(59, 130, 246, 1)", "rgba(59, 130, 246, 0.5)"]
          } : {}}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Premium border glow */}
      <motion.div 
        className="absolute inset-0 rounded-xl border-2 border-primary/30"
        animate={isAnimating ? {
          borderColor: [
            "rgba(59, 130, 246, 0.3)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(59, 130, 246, 0.3)"
          ]
        } : {}}
        transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
      />
    </div>
  );
}
