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
    <div className="meme-reel relative w-24 h-32 flex items-center justify-center">
      {/* Main container with classic arcade styling */}
      <div className="relative w-full h-full rounded-lg bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 border-4 border-gray-800 shadow-lg overflow-hidden">
        
        {/* Inner frame */}
        <div className="absolute inset-1 bg-black rounded border-2 border-gray-600 overflow-hidden">
          
          {/* Meme content area */}
          <motion.div
            className="w-full h-full flex flex-col items-center justify-center bg-white relative"
            animate={getAnimationVariants()}
            style={{
              filter: animationPhase === 'spinning' ? "blur(2px)" : "none"
            }}
          >
            {/* Meme image */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 mb-1 bg-white">
              <img 
                src={currentMeme.image} 
                alt={currentMeme.name}
                className="w-full h-full object-cover"
                style={{
                  filter: animationPhase === 'spinning' ? "blur(1px) brightness(1.3)" : "none"
                }}
              />
            </div>

            {/* Token name */}
            <div className="text-xs font-bold text-gray-800 text-center px-1" style={{ fontSize: '9px' }}>
              {currentMeme.name}
            </div>

            {/* Emoji indicator */}
            <div className="text-sm mt-1">{currentMeme.emoji}</div>
          </motion.div>

          {/* Win sparkles */}
          <AnimatePresence>
            {(isSpinning || showSparkles) && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400"
                    style={{
                      left: `${15 + (i % 3) * 25}%`,
                      top: `${15 + Math.floor(i / 3) * 35}%`,
                      fontSize: '12px'
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1,
                      repeat: isSpinning ? Infinity : 1,
                      delay: i * 0.15
                    }}
                    exit={{ opacity: 0 }}
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Win glow effect */}
        {animationPhase === 'complete' && (
          <motion.div
            className="absolute inset-0 rounded-lg border-4"
            style={{ borderColor: currentMeme.color }}
            animate={{
              opacity: [0, 0.8, 0],
              boxShadow: [
                `0 0 0px ${currentMeme.color}`,
                `0 0 20px ${currentMeme.color}`,
                `0 0 0px ${currentMeme.color}`
              ]
            }}
            transition={{ duration: 1, repeat: 2 }}
          />
        )}
      </div>
    </div>
  );
}