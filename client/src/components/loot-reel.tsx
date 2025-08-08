import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

interface MemeReelProps {
  symbol: string;
  isSpinning: boolean;
  delay?: number;
}

const memeTokens = [
  {
    id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b',
    name: 'AIDOGE',
    image: aidogeLogo,
    emoji: '🐕',
    color: '#FF6B35'
  },
  {
    id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3',
    name: 'BOOP',
    image: boopLogo,
    emoji: '🎭',
    color: '#4ECDC4'
  },
  {
    id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f',
    name: 'CATCH',
    image: catchLogo,
    emoji: '🎯',
    color: '#45B7D1'
  }
];

const getMemeToken = (tokenAddress: string) => {
  return memeTokens.find(token => token.id === tokenAddress) || memeTokens[0];
};

export default function MemeReel({ symbol, isSpinning, delay = 0 }: MemeReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'stopping' | 'complete'>('idle');
  const [showSparkles, setShowSparkles] = useState(false);

  const currentMeme = getMemeToken(displaySymbol);

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setAnimationPhase('spinning');
        
        // Fast meme cycling
        const fastInterval = setInterval(() => {
          const randomMeme = memeTokens[Math.floor(Math.random() * memeTokens.length)];
          setDisplaySymbol(randomMeme.id);
        }, 80);

        // Slow down phase
        setTimeout(() => {
          clearInterval(fastInterval);
          setAnimationPhase('stopping');
          
          const slowInterval = setInterval(() => {
            const randomMeme = memeTokens[Math.floor(Math.random() * memeTokens.length)];
            setDisplaySymbol(randomMeme.id);
          }, 200);

          // Final reveal
          setTimeout(() => {
            clearInterval(slowInterval);
            setDisplaySymbol(symbol);
            setAnimationPhase('complete');
            setShowSparkles(true);
            
            // Hide sparkles after animation
            setTimeout(() => setShowSparkles(false), 1500);
          }, 800);
        }, 1500);
      }, delay);
    } else {
      setAnimationPhase('idle');
      setShowSparkles(false);
    }
  }, [isSpinning, symbol, delay]);

  const getAnimationVariants = () => {
    switch (animationPhase) {
      case 'spinning':
        return {
          y: [0, -300, 0, -300, 0],
          rotateY: [0, 360, 720, 1080, 1440],
          scale: [1, 0.7, 1, 0.7, 1],
          transition: {
            duration: 1.8,
            ease: "linear",
            repeat: Infinity
          }
        };
      case 'stopping':
        return {
          y: [0, -150, 0],
          rotateY: [0, 180, 360],
          scale: [1, 0.8, 1],
          transition: {
            duration: 1,
            ease: "easeOut"
          }
        };
      case 'complete':
        return {
          scale: [0.8, 1.3, 1],
          rotateY: [360, 0],
          transition: {
            duration: 0.8,
            ease: "backOut"
          }
        };
      default:
        return {};
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      {/* Reel content */}
      <motion.div
        className="w-full h-full flex flex-col items-center justify-center relative bg-white"
        animate={getAnimationVariants()}
        style={{
          filter: animationPhase === 'spinning' ? "blur(3px)" : "none"
        }}
      >
        {/* Meme image - larger and cleaner */}
        <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-300 mb-1 bg-white shadow-lg"
             style={{
               boxShadow: '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)'
             }}>
          <img 
            src={currentMeme.image} 
            alt={currentMeme.name}
            className="w-full h-full object-cover"
            style={{
              filter: animationPhase === 'spinning' ? "blur(2px) brightness(1.2)" : "brightness(1.1) contrast(1.1)"
            }}
          />
        </div>

        {/* Token name - cleaner typography */}
        <div className="text-xs font-bold text-gray-800 text-center px-1 leading-tight" 
             style={{ 
               fontSize: '9px',
               textShadow: '0 1px 2px rgba(255,255,255,0.8)'
             }}>
          {currentMeme.name}
        </div>

        {/* Win effects */}
        <AnimatePresence>
          {animationPhase === 'complete' && (
            <>
              {/* Victory sparkles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-500"
                  style={{
                    left: `${20 + (i % 2) * 40}%`,
                    top: `${20 + Math.floor(i / 2) * 40}%`,
                    fontSize: '14px'
                  }}
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.2
                  }}
                  exit={{ opacity: 0 }}
                >
                  ⭐
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Spinning blur overlay */}
        {animationPhase === 'spinning' && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
        )}
      </motion.div>
    </div>
  );
}