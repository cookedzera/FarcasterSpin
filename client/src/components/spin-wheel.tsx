import { useState } from "react";
import { motion } from "framer-motion";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

const wheelSegments = [
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: '0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3', name: 'BOOP', image: boopLogo, isToken: true, reward: '2000', color: '#10B981' },
  { id: 'bonus', name: 'BONUS', image: '', isToken: false, reward: '500', color: '#F59E0B' },
  { id: '0xbc4c97fb9befaa8b41448e1dfcc5236da543217f', name: 'CATCH', image: catchLogo, isToken: true, reward: '1500', color: '#8B5CF6' },
  { id: 'bankrupt', name: 'BUST', image: '', isToken: false, reward: '0', color: '#EF4444' },
  { id: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', name: 'AIDOGE', image: aidogeLogo, isToken: true, reward: '1000', color: '#3B82F6' },
  { id: 'mega', name: 'JACKPOT', image: '', isToken: false, reward: '5000', color: '#F97316' }
];

export default function SpinWheel() {
  const [wheelRotation] = useState(0);
  const segmentAngle = 360 / wheelSegments.length;



  return (
    <>
      {/* Paper Texture Background */}
      <div 
        className="relative w-full max-w-lg mx-auto rounded-none p-8 select-none"
        style={{
          background: `
            linear-gradient(90deg, transparent 0%, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px, transparent 4px),
            linear-gradient(0deg, transparent 0%, transparent 24px, rgba(0,0,0,0.05) 24px, rgba(0,0,0,0.05) 26px, transparent 26px),
            linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)
          `,
          backgroundSize: '20px 20px, 100% 26px, 100% 100%',
          filter: 'contrast(1.02) brightness(0.98)',
          fontFamily: 'Georgia, serif'
        }}
      >
        {/* Hand-drawn Header */}
        <motion.div 
          className="text-center mb-8 relative"
        >
          {/* Title with hand-drawn underline */}
          <motion.h1 
            className="text-3xl font-normal mb-3 relative"
            style={{
              color: '#2d3748',
              fontFamily: 'Georgia, serif',
              letterSpacing: '1px',
              lineHeight: '1.2'
            }}
          >
            WHEEL OF FORTUNE
            {/* Hand-drawn underline */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 mt-1"
              style={{
                width: '280px',
                height: '3px',
                background: 'transparent',
                borderBottom: '2px solid #4a5568',
                borderRadius: '100px',
                transform: 'translateX(-50%) rotate(-0.5deg)',
                filter: 'blur(0.3px)'
              }}
            />
          </motion.h1>

          {/* Subtitle in smaller handwriting */}
          <motion.p 
            className="text-sm font-normal mt-4"
            style={{
              color: '#718096',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              letterSpacing: '0.5px'
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            "Spin the wheel & win meme tokens"
          </motion.p>
        </motion.div>

        {/* Hand-drawn Wheel Container */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer construction lines */}
          <div className="absolute w-96 h-96 pointer-events-none">
            {/* Light construction circle */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{
                border: '1px dashed #cbd5e0',
                opacity: 0.3
              }}
            />
            {/* Center guidelines */}
            <div 
              className="absolute left-1/2 top-0 w-0.5 h-full"
              style={{
                background: 'linear-gradient(to bottom, transparent 45%, #e2e8f0 45%, #e2e8f0 55%, transparent 55%)',
                transform: 'translateX(-50%)'
              }}
            />
            <div 
              className="absolute top-1/2 left-0 h-0.5 w-full"
              style={{
                background: 'linear-gradient(to right, transparent 45%, #e2e8f0 45%, #e2e8f0 55%, transparent 55%)',
                transform: 'translateY(-50%)'
              }}
            />
          </div>
          
          {/* Main Wheel - Hand-drawn style */}
          <motion.div
            className="relative w-80 h-80 rounded-full overflow-hidden"
            style={{
              border: '3px solid #2d3748',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: 'inset 0 0 20px rgba(45,55,72,0.1), 0 4px 15px rgba(45,55,72,0.15)',
              filter: 'contrast(1.02)'
            }}
            animate={{ rotate: wheelRotation }}
            transition={{ 
              duration: isSpinning ? 3 : 0,
              ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
            }}
          >
            {/* Wheel Segments - Architectural drawing style */}
            {wheelSegments.map((segment, index) => (
              <div
                key={index}
                className="absolute w-full h-full"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 40 * Math.cos((index * segmentAngle - 90) * Math.PI / 180)}% ${50 + 40 * Math.sin((index * segmentAngle - 90) * Math.PI / 180)}%, ${50 + 40 * Math.cos(((index + 1) * segmentAngle - 90) * Math.PI / 180)}% ${50 + 40 * Math.sin(((index + 1) * segmentAngle - 90) * Math.PI / 180)}%)`,
                  background: index % 2 === 0 ? '#ffffff' : '#f7fafc'
                }}
              >
                <div 
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    top: '25px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${index * segmentAngle + segmentAngle/2}deg)`,
                    width: '70px',
                    height: '70px'
                  }}
                >
                  {segment.image ? (
                    <div className="mb-1">
                      <img 
                        src={segment.image} 
                        alt={segment.name}
                        className="w-7 h-7 rounded object-cover"
                        style={{
                          border: '1.5px solid #2d3748',
                          filter: 'contrast(1.1) brightness(0.95)'
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-7 h-7 mb-1 flex items-center justify-center text-lg"
                      style={{
                        color: '#2d3748',
                        border: '1.5px solid #2d3748',
                        borderRadius: '3px',
                        background: '#ffffff'
                      }}
                    >
                      {segment.name === 'BUST' ? '✗' : 
                       segment.name === 'BONUS' ? '$' : '★'}
                    </div>
                  )}
                  <span 
                    className="font-normal text-center leading-tight"
                    style={{ 
                      fontSize: '7px',
                      color: '#2d3748',
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.3px',
                      fontWeight: '500'
                    }}
                  >
                    {segment.name}
                  </span>
                </div>
                
                {/* Hand-drawn segment divider */}
                <div 
                  className="absolute w-full h-0.5"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    transform: `rotate(${index * segmentAngle}deg)`,
                    background: '#4a5568',
                    opacity: 0.6
                  }}
                />
              </div>
            ))}

            {/* Center Hub - Hand-drawn */}
            <div 
              className="absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: '#ffffff',
                border: '2.5px solid #2d3748',
                boxShadow: '0 2px 8px rgba(45,55,72,0.2)'
              }}
            >
              <span 
                className="font-normal text-center"
                style={{
                  fontSize: '8px',
                  color: '#2d3748',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}
              >
                SPIN
              </span>
            </div>
          </motion.div>

          {/* Hand-drawn Pointer */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            {/* Pointer triangle */}
            <div 
              className="w-0 h-0 relative"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '30px solid #2d3748',
                filter: 'drop-shadow(1px 2px 3px rgba(45,55,72,0.3))'
              }}
            />
            {/* Small construction lines around pointer */}
            <div 
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 opacity-20"
              style={{ background: '#718096' }}
            />
          </div>
          
          {/* Pointer mounting */}
          <div 
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full z-30"
            style={{
              background: '#ffffff',
              border: '2px solid #2d3748',
              boxShadow: '0 1px 4px rgba(45,55,72,0.2)'
            }}
          />
        </div>

        {/* Hand-drawn Spin Button */}
        <div className="flex items-center justify-center">
          <motion.div
            whileHover={!isSpinning ? { scale: 1.02 } : {}}
            whileTap={!isSpinning ? { scale: 0.98 } : {}}
            className="relative"
          >
            <Button
              ref={spinButtonRef}
              onClick={handleSpin}
              disabled={isSpinning || !user || (user.spinsUsed || 0) >= 5}
              data-testid="button-spin"
              className="relative w-36 h-14 rounded-sm border-0 overflow-hidden touch-manipulation disabled:opacity-50 font-normal"
              style={{ 
                background: '#ffffff',
                color: '#2d3748',
                border: '2.5px solid #2d3748',
                boxShadow: '3px 3px 0px #4a5568',
                fontFamily: 'Georgia, serif',
                letterSpacing: '1px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <motion.div
                className="flex flex-col items-center justify-center h-full"
                animate={isSpinning ? {
                  scale: [1, 1.02, 1]
                } : {}}
                transition={{ 
                  scale: { duration: 1.5, repeat: isSpinning ? Infinity : 0 }
                }}
              >
                <span className="text-sm">
                  {isSpinning ? "SPINNING..." : "SPIN WHEEL"}
                </span>
                {!isSpinning && (
                  <span className="text-xs opacity-60 mt-0.5">
                    {user ? `${5 - (user.spinsUsed || 0)} spins remaining` : 'ready'}
                  </span>
                )}
              </motion.div>
            </Button>
            
            {/* Button construction lines */}
            <div 
              className="absolute -top-1 -left-1 w-2 h-2 opacity-20"
              style={{
                borderTop: '1px solid #718096',
                borderLeft: '1px solid #718096'
              }}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-2 h-2 opacity-20"
              style={{
                borderBottom: '1px solid #718096',
                borderRight: '1px solid #718096'
              }}
            />
          </motion.div>
        </div>

        {/* Hand-drawn Win Display */}
        {winResult && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="mt-6 p-5 rounded-sm relative overflow-hidden"
            style={{
              background: '#ffffff',
              border: '2.5px solid #2d3748',
              boxShadow: '3px 3px 0px #4a5568'
            }}
          >
            <div className="text-center relative z-10">
              <motion.div 
                className="text-2xl font-normal mb-3"
                style={{
                  color: '#2d3748',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '1px'
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                ★ WINNER! ★
              </motion.div>
              <div className="text-lg font-normal mb-2" style={{ color: '#2d3748', fontFamily: 'Georgia, serif' }}>
                <span className="text-xl">+{(Number(winResult.rewardAmount) / Math.pow(10, 18)).toFixed(4)}</span>
                <span className="ml-2 text-sm">TOKENS</span>
              </div>
              {winResult.transactionHash && (
                <div 
                  className="text-xs font-normal bg-gray-100 rounded px-3 py-1 inline-block"
                  style={{ 
                    fontFamily: 'monospace',
                    color: '#4a5568',
                    border: '1px solid #cbd5e0'
                  }}
                >
                  {winResult.transactionHash?.slice(0, 8)}...{winResult.transactionHash?.slice(-6)}
                </div>
              )}
            </div>
            
            {/* Corner construction marks */}
            <div className="absolute top-1 left-1 w-3 h-3 opacity-10" style={{ borderTop: '1px solid #2d3748', borderLeft: '1px solid #2d3748' }} />
            <div className="absolute top-1 right-1 w-3 h-3 opacity-10" style={{ borderTop: '1px solid #2d3748', borderRight: '1px solid #2d3748' }} />
            <div className="absolute bottom-1 left-1 w-3 h-3 opacity-10" style={{ borderBottom: '1px solid #2d3748', borderLeft: '1px solid #2d3748' }} />
            <div className="absolute bottom-1 right-1 w-3 h-3 opacity-10" style={{ borderBottom: '1px solid #2d3748', borderRight: '1px solid #2d3748' }} />
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