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
  { id: 'aidoge-1', tokenAddress: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'bankrupt-1', tokenAddress: null, name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: 'boop-1', tokenAddress: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', name: 'BOOP', image: boopLogo, isToken: true, reward: '2000', color: '#10B981' },
  { id: 'bonus-1', tokenAddress: null, name: 'BONUS', image: '', isToken: false, reward: '500', color: '#F59E0B' },
  { id: 'catch-1', tokenAddress: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f', name: 'CATCH', image: catchLogo, isToken: true, reward: '1500', color: '#8B5CF6' },
  { id: 'bankrupt-2', tokenAddress: null, name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: 'aidoge-2', tokenAddress: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'mega-1', tokenAddress: null, name: 'JACKPOT', image: '', isToken: false, reward: '5000', color: '#F97316' }
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
      let winningSegmentIndex = -1;
      
      if (result.isWin) {
        // Find a segment that matches the winning token address
        const winningTokenAddress = result.symbols?.[0];
        const tokenSegments = wheelSegments.filter(seg => seg.tokenAddress === winningTokenAddress);
        if (tokenSegments.length > 0) {
          // Choose a random matching segment for variety
          const randomTokenSegment = tokenSegments[Math.floor(Math.random() * tokenSegments.length)];
          winningSegmentIndex = wheelSegments.findIndex(seg => seg.id === randomTokenSegment.id);
        }
      } else {
        // Find a random BUST segment for loses
        const bustSegments = wheelSegments.filter(seg => seg.name === 'BUST');
        if (bustSegments.length > 0) {
          const randomBustSegment = bustSegments[Math.floor(Math.random() * bustSegments.length)];
          winningSegmentIndex = wheelSegments.findIndex(seg => seg.id === randomBustSegment.id);
        }
      }
      
      const finalSegment = winningSegmentIndex >= 0 ? winningSegmentIndex : 1; // Default to first bankrupt
      
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
      {/* Modern Dark Container matching your UI */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-xs mx-auto bg-card rounded-xl p-4 select-none border border-border shadow-xl"
        style={{
          background: 'hsl(223, 29%, 12%)',
          borderColor: 'hsl(223, 18%, 22%)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 1px 8px rgba(255, 255, 255, 0.05) inset'
        }}
      >
        {/* Sparkles for wins */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none text-yellow-400 text-2xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    zIndex: 50
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: 1,
                  }}
                  exit={{ opacity: 0 }}
                >
                  ●
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Header with ArbCasino Branding */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-white mb-1">
            ARB<span className="text-primary">CASINO</span>
          </h1>
          <div className="w-12 h-0.5 bg-primary mx-auto mb-2 rounded-full"></div>
          <h2 className="text-base font-semibold text-white mb-1">
            WHEEL OF FORTUNE
          </h2>
          <p className="text-xs text-muted-foreground">
            Spin the wheel & win meme tokens
          </p>
        </motion.div>

        {/* Wheel Container */}
        <div className="relative flex items-center justify-center mb-4">

          {/* Main Wheel - Fixed Design with SVG */}
          <motion.div
            className="relative w-56 h-56"
            animate={{ rotate: wheelRotation }}
            transition={{ 
              duration: isSpinning ? 3 : 0,
              ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
            }}
          >
            <svg width="224" height="224" viewBox="0 0 224 224" className="drop-shadow-2xl">
              <defs>
                {/* Define gradients for each segment */}
                {wheelSegments.map((segment, index) => (
                  <radialGradient key={`grad-${index}`} id={`gradient-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={segment.color + '40'} />
                    <stop offset="100%" stopColor={segment.color + '80'} />
                  </radialGradient>
                ))}
                {/* Center gradient definition */}
                <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
              </defs>
              
              {/* Top pointer triangle */}
              <polygon 
                points="112,8 118,20 106,20" 
                fill="white" 
                stroke="rgba(139, 92, 246, 0.6)" 
                strokeWidth="1"
              />
              
              {/* Outer border circle */}
              <circle cx="112" cy="112" r="108" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="3"/>
              
              {/* Wheel segments */}
              {wheelSegments.map((segment, index) => {
                const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                const largeArc = segmentAngle > 180 ? 1 : 0;
                
                const x1 = 112 + 104 * Math.cos(startAngle);
                const y1 = 112 + 104 * Math.sin(startAngle);
                const x2 = 112 + 104 * Math.cos(endAngle);
                const y2 = 112 + 104 * Math.sin(endAngle);
                
                const isWinning = landedSegment === index;
                
                return (
                  <g key={index}>
                    {/* Segment path */}
                    <path
                      d={`M 112 112 L ${x1} ${y1} A 104 104 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                      className={`transition-all duration-300 ${isWinning ? 'brightness-125' : ''}`}
                    />
                    
                    {/* Segment content */}
                    <g>
                      {/* Calculate position for text/image */}
                      {(() => {
                        const midAngle = (startAngle + endAngle) / 2;
                        const textRadius = 65;
                        const textX = 112 + textRadius * Math.cos(midAngle);
                        const textY = 112 + textRadius * Math.sin(midAngle);
                        
                        return (
                          <g transform={`translate(${textX}, ${textY})`}>
                            <text
                              x="0"
                              y="-2"
                              textAnchor="middle"
                              className="fill-white font-bold"
                              fontSize="11"
                              fontFamily="Arial, sans-serif"
                            >
                              {segment.name}
                            </text>
                            <text
                              x="0"
                              y="12"
                              textAnchor="middle"
                              className="fill-white"
                              fontSize="9"
                              fontFamily="Arial, sans-serif"
                            >
                              {segment.reward}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  </g>
                );
              })}
              
              {/* Center hub */}
              <circle cx="112" cy="112" r="22" fill="url(#centerGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              <text x="112" y="118" textAnchor="middle" className="fill-white font-bold" fontSize="11">SPIN</text>
            </svg>
          </motion.div>
        </div>

        {/* Spin Button */}
        <div className="flex flex-col items-center">
          <Button
            ref={spinButtonRef}
            onClick={handleSpin}
            disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
            data-testid="button-spin"
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: 'hsl(207, 90%, 54%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <motion.span
              animate={isSpinning ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ 
                scale: { duration: 1, repeat: isSpinning ? Infinity : 0 }
              }}
            >
              {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
            </motion.span>
          </Button>
          
          {!isSpinning && user && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {5 - (user.spinsUsed || 0)} spins remaining
            </p>
          )}
        </div>

        {/* Win Display */}
        <AnimatePresence>
          {winResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30"
            >
              <div className="text-center">
                <motion.div 
                  className="text-xl font-bold text-green-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  WINNER!
                </motion.div>
                <div className="text-white">
                  <span className="text-lg font-bold">+{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(4)}</span>
                  <span className="ml-2 text-sm">TOKENS</span>
                </div>
                {winResult.transactionHash && (
                  <div className="text-xs text-muted-foreground mt-2 font-mono">
                    {winResult.transactionHash?.slice(0, 8)}...{winResult.transactionHash?.slice(-6)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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