import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type SpinResult } from "@shared/schema";

const wheelSegments = [
  { id: 'aidoge-1', name: 'AIDOGE', reward: '1000', color: '#3B82F6' },
  { id: 'bankrupt-1', name: 'BUST', reward: '0', color: '#EF4444' },
  { id: 'boop-1', name: 'BOOP', reward: '2000', color: '#10B981' },
  { id: 'bonus-1', name: 'BONUS', reward: '500', color: '#F59E0B' },
  { id: 'catch-1', name: 'CATCH', reward: '1500', color: '#8B5CF6' },
  { id: 'bankrupt-2', name: 'BUST', reward: '0', color: '#EF4444' },
  { id: 'aidoge-2', name: 'AIDOGE', reward: '1000', color: '#3B82F6' },
  { id: 'mega-1', name: 'JACKPOT', reward: '5000', color: '#F97316' }
];

export default function SpinWheelClean() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedSegment, setLandedSegment] = useState<number | null>(null);
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
      // Calculate landing segment
      const finalSegment = result.isWin ? 0 : 1; // Simple logic for demo
      const targetAngle = -(finalSegment * segmentAngle) + (segmentAngle / 2);
      const spins = 5 + Math.random() * 3;
      const finalRotation = wheelRotation + (spins * 360) + targetAngle;
      
      setWheelRotation(finalRotation);
      setLandedSegment(finalSegment);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
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
      toast({
        title: "Daily Limit Reached",
        description: "You've used all your spins for today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setLandedSegment(null);
    spinMutation.mutate();
  };

  return (
    <div className="w-full mx-auto">


      {/* Wheel */}
      <div className="relative flex items-center justify-center mb-4">
        <motion.div
          className="relative w-56 h-56"
          animate={{ rotate: wheelRotation }}
          transition={{ 
            duration: isSpinning ? 3 : 0,
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
          }}
        >
          <svg width="224" height="224" viewBox="0 0 224 224">
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
            
            {/* Center */}
            <circle cx="112" cy="112" r="20" fill="#1e293b" stroke="white" strokeWidth="2"/>
            <text x="112" y="118" textAnchor="middle" className="fill-white font-bold" fontSize="10">SPIN</text>
            
            {/* Pointer */}
            <polygon points="112,12 116,22 108,22" fill="white"/>
          </svg>
        </motion.div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl"
      >
        {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
      </Button>
      
      {!isSpinning && user && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          {5 - (user.spinsUsed || 0)} spins remaining
        </p>
      )}
    </div>
  );
}