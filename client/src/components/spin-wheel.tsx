import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WinPopup from "./win-popup";
import { type SpinResult } from "@shared/schema";
import { HapticFeedback } from "@/lib/haptics";
import { GestureHandler } from "@/lib/gesture-handler";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

const wheelSegments = [
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0' },
  { id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', name: 'BOOP', image: boopLogo, isToken: true, reward: '2000' },
  { id: 'bonus', name: 'BONUS', image: '', isToken: false, reward: '500' },
  { id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f', name: 'CATCH', image: catchLogo, isToken: true, reward: '1500' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0' },
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000' },
  { id: 'mega', name: 'JACKPOT', image: '', isToken: false, reward: '5000' }
];

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<SpinResult | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedSegment, setLandedSegment] = useState<number | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useGameState();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const segmentAngle = 360 / wheelSegments.length;

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/spin", {
        userId: user?.id
      });
      return response.json() as Promise<SpinResult>;
    },
    onSuccess: (result) => {
      // Calculate which segment to land on
      const winningSegmentIndex = result.isWin 
        ? wheelSegments.findIndex(seg => seg.id === result.symbols?.[0])
        : wheelSegments.findIndex(seg => seg.id === 'bankrupt');
      
      const finalSegment = winningSegmentIndex >= 0 ? winningSegmentIndex : 1; // Default to bankrupt
      
      // Calculate rotation to land on the winning segment
      const targetAngle = -(finalSegment * segmentAngle) + (segmentAngle / 2);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = wheelRotation + (spins * 360) + targetAngle;
      
      setWheelRotation(finalRotation);
      setLandedSegment(finalSegment);
      
      if (result.isWin && result.rewardAmount) {
        setTimeout(() => {
          setWinResult(result);
          setShowWinPopup(true);
          setShowSparkles(true);
          HapticFeedback.success();
          setTimeout(() => setShowSparkles(false), 3000);
        }, 3000); // Wait for wheel to stop
      } else {
        setTimeout(() => {
          HapticFeedback.light();
        }, 3000);
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
      setTimeout(() => setIsSpinning(false), 3500);
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

    HapticFeedback.medium();
    setIsSpinning(true);
    setLandedSegment(null);
    spinMutation.mutate();
  };

  // Setup gesture handling
  useEffect(() => {
    if (containerRef.current) {
      const gestureHandler = new GestureHandler(containerRef.current);
      
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

      let lastTapTime = 0;
      gestureHandler.onTap = () => {
        const now = Date.now();
        if (now - lastTapTime < 300) {
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
      {/* Comic Book Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-lg mx-auto rounded-3xl p-8 select-none"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          border: '4px solid #ffffff',
          boxShadow: '0 0 0 4px #000000, 0 25px 50px -12px rgba(0,0,0,0.9)',
        }}
      >
        {/* Comic Book Style Sparkles */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 180],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1,
                    repeat: 2,
                  }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-white text-xl font-black">★</div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Comic Book Header */}
        <motion.div 
          className="text-center mb-8"
          animate={isSpinning ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: isSpinning ? Infinity : 0 }}
        >
          <motion.h1 
            className="text-4xl font-black mb-2 text-white"
            style={{
              textShadow: '4px 4px 0px #000000, -2px -2px 0px #ffffff',
              letterSpacing: '2px'
            }}
          >
            WHEEL OF FORTUNE
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-sm font-bold tracking-wider"
            style={{
              textShadow: '2px 2px 0px #000000'
            }}
          >
            SPIN • WIN • COLLECT TOKENS
          </motion.p>
        </motion.div>

        {/* Comic Book Wheel Container */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer Ring */}
          <div 
            className="absolute w-96 h-96 rounded-full"
            style={{
              border: '8px solid #ffffff',
              boxShadow: '0 0 0 4px #000000, inset 0 0 0 4px #000000'
            }}
          />
          
          {/* Inner Wheel */}
          <motion.div
            className="relative w-80 h-80 rounded-full overflow-hidden"
            style={{
              border: '6px solid #000000',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
            animate={{ rotate: wheelRotation }}
            transition={{ 
              duration: isSpinning ? 3 : 0,
              ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
            }}
          >
            {/* Wheel Segments */}
            {wheelSegments.map((segment, index) => (
              <div
                key={index}
                className="absolute w-full h-full"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 40 * Math.cos((index * segmentAngle - 90) * Math.PI / 180)}% ${50 + 40 * Math.sin((index * segmentAngle - 90) * Math.PI / 180)}%, ${50 + 40 * Math.cos(((index + 1) * segmentAngle - 90) * Math.PI / 180)}% ${50 + 40 * Math.sin(((index + 1) * segmentAngle - 90) * Math.PI / 180)}%)`,
                  background: index % 2 === 0 ? '#ffffff' : '#000000'
                }}
              >
                <div 
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    top: '20px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${index * segmentAngle + segmentAngle/2}deg)`,
                    width: '80px',
                    height: '80px'
                  }}
                >
                  {segment.image ? (
                    <div className="mb-1">
                      <img 
                        src={segment.image} 
                        alt={segment.name}
                        className="w-8 h-8 rounded-lg object-cover border-2 border-black"
                        style={{
                          filter: index % 2 === 0 ? 'none' : 'invert(1)'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 mb-1 flex items-center justify-center text-2xl font-black">
                      {segment.name === 'BUST' ? '💀' : 
                       segment.name === 'BONUS' ? '💰' : '👑'}
                    </div>
                  )}
                  <span 
                    className={`font-black text-center leading-tight ${index % 2 === 0 ? 'text-black' : 'text-white'}`}
                    style={{ 
                      fontSize: '8px',
                      letterSpacing: '0.5px',
                      textShadow: index % 2 === 0 ? '1px 1px 0px #ffffff' : '1px 1px 0px #000000'
                    }}
                  >
                    {segment.name}
                  </span>
                </div>
                
                {/* Segment border */}
                <div 
                  className="absolute w-full h-0.5 bg-black"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    transform: `rotate(${index * segmentAngle}deg)`
                  }}
                />
              </div>
            ))}

            {/* Center Hub */}
            <div 
              className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#000000',
                border: '4px solid #ffffff',
                boxShadow: '0 0 0 2px #000000'
              }}
            >
              <span className="text-white text-xs font-black tracking-wider">SPIN</span>
            </div>
          </motion.div>

          {/* Comic Book Style Pointer */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '35px solid #ffffff',
                filter: 'drop-shadow(2px 2px 0px #000000)'
              }}
            />
            <div 
              className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '30px solid #000000'
              }}
            />
          </div>
          
          {/* Pointer Base */}
          <div 
            className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full z-30"
            style={{
              background: '#ffffff',
              border: '3px solid #000000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          />
        </div>

        {/* Comic Book Style Spin Button */}
        <div className="flex items-center justify-center">
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
              className="relative w-40 h-16 rounded-2xl border-0 overflow-hidden touch-manipulation disabled:opacity-50 font-black text-lg"
              style={{ 
                background: isSpinning ? '#666666' : '#ffffff',
                color: isSpinning ? '#ffffff' : '#000000',
                border: '4px solid #000000',
                boxShadow: '4px 4px 0px #000000',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <motion.div
                className="flex flex-col items-center justify-center h-full"
                animate={isSpinning ? {
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  scale: { duration: 1, repeat: isSpinning ? Infinity : 0 }
                }}
                style={{
                  textShadow: isSpinning ? '2px 2px 0px #000000' : '2px 2px 0px #ffffff'
                }}
              >
                <span className="tracking-wider">
                  {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
                </span>
                {!isSpinning && (
                  <span className="text-xs font-bold opacity-70">
                    {user ? `${5 - (user.spinsUsed || 0)} SPINS LEFT` : 'READY TO PLAY'}
                  </span>
                )}
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Comic Book Win Display */}
        {winResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mt-6 p-6 rounded-2xl relative overflow-hidden"
            style={{
              background: '#ffffff',
              border: '4px solid #000000',
              boxShadow: '4px 4px 0px #000000'
            }}
          >
            <div className="text-center relative z-10">
              <motion.div 
                className="text-3xl font-black mb-3 text-black"
                style={{
                  textShadow: '2px 2px 0px #ffffff'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                💥 WINNER! 💥
              </motion.div>
              <div className="text-xl font-black text-black mb-2">
                <span className="text-2xl">+{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(4)}</span>
                <span className="ml-2 text-sm">TOKENS</span>
              </div>
              {winResult.transactionHash && (
                <div className="text-xs font-bold bg-black text-white rounded-lg px-3 py-1 inline-block">
                  {winResult.transactionHash?.slice(0, 8)}...{winResult.transactionHash?.slice(-6)}
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