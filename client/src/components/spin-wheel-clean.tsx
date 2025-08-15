import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useGameState } from "@/hooks/use-game-state";
import { useWheelGame } from "@/hooks/use-wheel-game";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/config';

const wheelSegments = [
  { id: 'aidoge-1', name: 'AIDOGE', reward: '10000', color: '#3B82F6', tokenAddress: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b' },
  { id: 'bankrupt-1', name: 'BUST', reward: '0', color: '#EF4444', tokenAddress: null },
  { id: 'boop-1', name: 'BOOP', reward: '20000', color: '#10B981', tokenAddress: '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3' },
  { id: 'bonus-1', name: 'BONUS', reward: '5000', color: '#F59E0B', tokenAddress: '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3' },
  { id: 'bobotrum-1', name: 'BOBOTRUM', reward: '15000', color: '#8B5CF6', tokenAddress: '0x60460971a3D79ef265dfafA393ffBCe97d91E8B8' },
  { id: 'bankrupt-2', name: 'BUST', reward: '0', color: '#EF4444', tokenAddress: null },
  { id: 'aidoge-2', name: 'AIDOGE', reward: '10000', color: '#3B82F6', tokenAddress: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b' },
  { id: 'mega-1', name: 'JACKPOT', reward: '50000', color: '#F97316', tokenAddress: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b' }
];

export default function SpinWheelClean() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedSegment, setLandedSegment] = useState<number | null>(null);
  const { user } = useGameState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { 
    spin, 
    isSpinning: isBlockchainSpinning, 
    isSpinConfirmed,
    spinHash 
  } = useWheelGame();

  const segmentAngle = 360 / wheelSegments.length;

  // Handle successful blockchain spin
  useEffect(() => {
    if (isSpinConfirmed && spinHash) {
      // Simulate a win for demonstration (in real app, parse events from transaction receipt)
      const isWin = Math.random() > 0.6; // 40% win rate
      
      // Calculate which segment to land on based on win/lose
      let targetSegmentIndex = 1; // Default to BUST
      
      if (isWin) {
        // If win, pick a random winning segment (not BUST)
        const winningSegments = wheelSegments.map((seg, idx) => ({ idx, seg }))
          .filter(({ seg }) => seg.name !== 'BUST');
        targetSegmentIndex = winningSegments[Math.floor(Math.random() * winningSegments.length)].idx;
      }
      
      // Calculate rotation needed to land on target segment
      const targetAngle = -(targetSegmentIndex * segmentAngle);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = wheelRotation + (spins * 360) + targetAngle;
      
      setWheelRotation(finalRotation);
      setLandedSegment(targetSegmentIndex);
      
      // Show success message
      toast({
        title: "Spin Complete!",
        description: `Transaction confirmed: ${spinHash.slice(0, 10)}...`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      setTimeout(() => setIsSpinning(false), 3500);
    }
  }, [isSpinConfirmed, spinHash, wheelRotation, segmentAngle, toast, queryClient]);

  const handleSpin = async () => {
    console.log('🎰 handleSpin called', { 
      isSpinning, 
      isBlockchainSpinning, 
      user: !!user, 
      isConnected, 
      address,
      contractAddress: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS
    });
    
    if (isSpinning || isBlockchainSpinning || !user || !isConnected) {
      console.log('❌ Spin blocked - requirements not met:', {
        isSpinning,
        isBlockchainSpinning,
        hasUser: !!user,
        isConnected,
        hasAddress: !!address
      });
      return;
    }
    
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to spin and pay gas fees.",
        variant: "destructive",
      });
      return;
    }
    
    if ((user.spinsUsed || 0) >= 5) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all your spins for today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setLandedSegment(null);
    
    toast({
      title: "Initiating Spin",
      description: "Confirm transaction in your wallet to pay gas fees and spin!",
      variant: "default",
    });
    
    try {
      console.log('Calling wagmi spin function to trigger MetaMask...');
      await spin(); // This should trigger MetaMask gas popup immediately
      console.log('Wagmi spin function initiated - waiting for user confirmation');
    } catch (error: any) {
      console.error('Spin error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to initiate spin transaction",
        variant: "destructive",
      });
      setIsSpinning(false);
    }
  };

  return (
    <div className="w-full mx-auto">


      {/* Wheel */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Rotating Wheel */}
        <motion.div
          className="relative w-56 h-56 drop-shadow-2xl"
          animate={{ rotate: wheelRotation }}
          transition={{ 
            duration: isSpinning ? 3 : 0,
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
          }}
        >
          <svg width="224" height="224" viewBox="0 0 224 224">
            <defs>
              <filter id="wheelShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
              </filter>
              <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </radialGradient>
            </defs>
            
            {/* Outer ring for premium effect */}
            <circle cx="112" cy="112" r="105" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8"/>
            <circle cx="112" cy="112" r="102" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
            {wheelSegments.map((segment, index) => {
              const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
              const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
              const largeArc = segmentAngle > 180 ? 1 : 0;
              
              const x1 = 112 + 100 * Math.cos(startAngle);
              const y1 = 112 + 100 * Math.sin(startAngle);
              const x2 = 112 + 100 * Math.cos(endAngle);
              const y2 = 112 + 100 * Math.sin(endAngle);
              
              return (
                <g key={index}>
                  <path
                    d={`M 112 112 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#wheelShadow)"
                  />
                  {/* Subtle gradient overlay for depth */}
                  <path
                    d={`M 112 112 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill="url(#wheelGlow)"
                    opacity="0.3"
                  />
                  
                  {(() => {
                    const midAngle = (startAngle + endAngle) / 2;
                    const textX = 112 + 60 * Math.cos(midAngle);
                    const textY = 112 + 60 * Math.sin(midAngle);
                    
                    return (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        className="fill-white font-bold"
                        fontSize="10"
                      >
                        {segment.name}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
            
            {/* Center Circle - only visual circle, no text */}
            <circle cx="112" cy="112" r="22" fill="#0f172a" stroke="#fbbf24" strokeWidth="3"/>
            <circle cx="112" cy="112" r="18" fill="#1e293b" stroke="white" strokeWidth="1"/>
          </svg>
        </motion.div>
        
        {/* Fixed Center Text (stays in place while wheel spins) */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-white font-bold text-xs bg-gradient-to-br from-slate-700 to-slate-900 rounded-full w-11 h-11 flex items-center justify-center border-2 border-amber-400 shadow-lg">
            SPIN
          </div>
        </div>
        
        {/* Fixed Premium Pointer (stays in place while wheel spins) */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="30%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#9ca3af" />
              </linearGradient>
              <linearGradient id="arrowStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
              <filter id="arrowShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5"/>
              </filter>
            </defs>
            {/* Main arrow pointing down into the wheel */}
            <polygon 
              points="15,5 22,18 8,18" 
              fill="url(#arrowGradient)" 
              stroke="url(#arrowStroke)" 
              strokeWidth="2"
              filter="url(#arrowShadow)"
            />
            {/* Inner highlight for 3D effect */}
            <polygon 
              points="15,7 20,16 10,16" 
              fill="rgba(255,255,255,0.4)" 
            />
            {/* Central ridge line for premium detail */}
            <line 
              x1="15" y1="7" 
              x2="15" y2="16" 
              stroke="rgba(255,255,255,0.7)" 
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || isBlockchainSpinning || !user || !isConnected || (user.spinsUsed || 0) >= 5}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl"
      >
        {isSpinning || isBlockchainSpinning ? "SPINNING..." : isConnected ? "SPIN WHEEL (Pay Gas)" : "CONNECT WALLET TO SPIN"}
      </Button>
      
      {!isSpinning && user && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          {5 - (user.spinsUsed || 0)} spins remaining
        </p>
      )}
    </div>
  );
}