import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LootReelProps {
  symbol: string;
  isSpinning: boolean;
  delay?: number;
}

const lootItems = [
  {
    id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b',
    name: 'Mystic Crystal',
    rarity: 'legendary',
    icon: '💎',
    color: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/50'
  },
  {
    id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3',
    name: 'Golden Coin',
    rarity: 'epic',
    icon: '🪙',
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/50'
  },
  {
    id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f',
    name: 'Treasure Chest',
    rarity: 'rare',
    icon: '🏆',
    color: 'from-blue-400 to-cyan-500',
    glow: 'shadow-blue-500/50'
  }
];

const getLootItem = (tokenAddress: string) => {
  return lootItems.find(item => item.id === tokenAddress) || lootItems[0];
};

const rarityColors: Record<string, string> = {
  legendary: 'from-purple-600 via-pink-600 to-purple-800',
  epic: 'from-yellow-500 via-orange-500 to-red-600',
  rare: 'from-blue-500 via-cyan-500 to-teal-600'
};

export default function LootReel({ symbol, isSpinning, delay = 0 }: LootReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'stopping' | 'complete'>('idle');
  const [showLootParticles, setShowLootParticles] = useState(false);

  const currentLoot = getLootItem(displaySymbol);

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setAnimationPhase('spinning');
        
        // Rapid loot cycling
        const fastInterval = setInterval(() => {
          const randomItem = lootItems[Math.floor(Math.random() * lootItems.length)];
          setDisplaySymbol(randomItem.id);
        }, 100);

        // Slow down phase
        setTimeout(() => {
          clearInterval(fastInterval);
          setAnimationPhase('stopping');
          
          const slowInterval = setInterval(() => {
            const randomItem = lootItems[Math.floor(Math.random() * lootItems.length)];
            setDisplaySymbol(randomItem.id);
          }, 250);

          // Final reveal
          setTimeout(() => {
            clearInterval(slowInterval);
            setDisplaySymbol(symbol);
            setAnimationPhase('complete');
            setShowLootParticles(true);
            
            // Hide particles after animation
            setTimeout(() => setShowLootParticles(false), 2000);
          }, 1000);
        }, 1800);
      }, delay);
    } else {
      setAnimationPhase('idle');
      setShowLootParticles(false);
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
    <div className="loot-container relative w-28 h-28 md:w-24 md:h-24 flex items-center justify-center">
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${currentLoot.color} opacity-30 blur-lg`} />
      
      {/* Main container */}
      <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-slate-600 overflow-hidden shadow-2xl ${currentLoot.glow}`}>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent"
            animate={isSpinning ? { x: [-100, 100], y: [-100, 100] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Loot particles when spinning */}
        <AnimatePresence>
          {(isSpinning || showLootParticles) && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${20 + (i * 8)}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0],
                    rotate: [0, 360],
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 40],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isSpinning ? Infinity : 1,
                    delay: i * 0.1
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main loot content */}
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center relative z-10"
          animate={getAnimationVariants()}
          style={{
            filter: animationPhase === 'spinning' ? "blur(4px) brightness(1.5)" : 
                   animationPhase === 'stopping' ? "blur(1px) brightness(1.2)" : "none"
          }}
        >
          {/* Loot icon with epic styling */}
          <motion.div 
            className="text-4xl md:text-3xl mb-1 relative"
            animate={animationPhase === 'complete' ? {
              textShadow: [
                "0 0 0px rgba(255, 255, 255, 0)",
                "0 0 20px rgba(255, 255, 255, 0.8)",
                "0 0 0px rgba(255, 255, 255, 0)"
              ]
            } : {}}
            transition={{ duration: 0.5, repeat: animationPhase === 'complete' ? 2 : 0 }}
          >
            {currentLoot.icon}
            
            {/* Shine effect */}
            {animationPhase === 'complete' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            )}
          </motion.div>

          {/* Loot name */}
          <motion.div 
            className={`text-xs font-bold text-center bg-gradient-to-r ${rarityColors[currentLoot.rarity] || rarityColors.rare} bg-clip-text text-transparent`}
            style={{ fontSize: '10px' }}
            animate={animationPhase === 'complete' ? {
              scale: [1, 1.1, 1]
            } : {}}
          >
            {currentLoot.name}
          </motion.div>
        </motion.div>

        {/* Border glow animation */}
        <motion.div 
          className="absolute inset-0 rounded-2xl border-2"
          animate={isSpinning ? {
            borderColor: [
              "rgba(148, 163, 184, 0.5)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(168, 85, 247, 0.8)",
              "rgba(236, 72, 153, 0.8)",
              "rgba(148, 163, 184, 0.5)"
            ]
          } : animationPhase === 'complete' ? {
            borderColor: [
              "rgba(148, 163, 184, 0.5)",
              currentLoot.rarity === 'legendary' ? "rgba(168, 85, 247, 1)" :
              currentLoot.rarity === 'epic' ? "rgba(245, 158, 11, 1)" :
              "rgba(59, 130, 246, 1)",
              "rgba(148, 163, 184, 0.5)"
            ]
          } : {}}
          transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 1 }}
        />

        {/* Rarity indicator */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-br ${currentLoot.color} opacity-80`} />
      </div>
    </div>
  );
}