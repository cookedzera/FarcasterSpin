import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import SpinWheel from "@/components/spin-wheel-clean";
import CountdownTimer from "@/components/countdown-timer";
import Navigation from "@/components/navigation";
import { WalletConnectCompact } from "@/components/wallet-connect-compact";
import { TestButton } from "@/components/test-button";
import { ContractDebug } from "@/components/contract-debug";
import { WalletDebug } from "@/components/wallet-debug";
import { Button } from "@/components/ui/button";
import { formatUnits } from "ethers";
import { type GameStats } from "@shared/schema";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

interface TokenBalances {
  token1: string;
  token2: string;
  token3: string;
  canClaim: boolean;
  totalValueUSD: string;
}

export default function Home() {
  const { user, isLoading: userLoading } = useGameState();
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  // Get token balances for real data
  const { data: balances, isLoading: balancesLoading } = useQuery<TokenBalances>({
    queryKey: ['/api/user', user?.id, 'balances'],
    enabled: !!user?.id,
  });





  const formatTokenAmount = (amount: string, decimals = 18) => {
    try {
      const parsed = parseFloat(formatUnits(amount, decimals));
      if (parsed >= 1000) {
        return `${(parsed / 1000).toFixed(1)}K`;
      } else if (parsed >= 1) {
        return `${parsed.toFixed(0)}`;
      }
      return "0";
    } catch {
      return "0";
    }
  };

  // Show minimal loading state while preserving background
  if (userLoading) {
    return (
      <div className="min-h-screen relative" style={{
        background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
      }}>
        {/* Loading spinner */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
    }}>
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      {/* Radial gradient overlay */}
      <div className="fixed inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)'
      }} />
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
      


      {/* Compact Wallet Connect - Top Right */}
      <div className="fixed top-6 right-6 z-30">
        <WalletConnectCompact />
      </div>

      {/* Debug Panel - Top Left */}
      <div className="fixed top-6 left-6 z-30">
        <WalletDebug />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-4 pb-24">
        {/* User Profile - Compact */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset',
              backdropFilter: 'blur(20px)'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {user?.username?.charAt(0) || 'P'}
          </motion.div>
          <div className="mb-2">
            <motion.h1 
              className="text-2xl font-bold text-white mb-1"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              ARB<span className="text-blue-400">CASINO</span>
            </motion.h1>
            <div className="w-16 h-0.5 bg-blue-400 mx-auto mb-1 rounded-full"></div>
          </div>
          <h2 className="text-lg font-semibold text-white">
            Hello, {user?.username || 'Player'}!
          </h2>
        </motion.div>

        {/* Main Action Cards - Compact */}
        <div className="space-y-4 mb-4">
          {/* Spin Challenge Card */}
          <motion.div
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(2deg) rotateY(-1deg)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ 
              scale: 1.02, 
              y: -3,
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
                opacity: 0.9
              }}
            />
            {/* Top highlight */}
            <div 
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
              }}
            />
            <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">🎡 Spin a Wheel</h2>
                <p className="text-teal-100 text-sm mb-2">💰 Win meme tokens daily</p>
                <div className="text-xs text-teal-100">
                  <CountdownTimer />
                </div>
              </div>
              <div className="relative z-20">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                  <motion.svg 
                    className="w-6 h-6 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* Outer wheel circle */}
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    {/* Inner segments */}
                    <path 
                      d="M12 2 L12 12 L22 12" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path 
                      d="M12 12 L22 12 L12 22" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      fill="rgba(255,255,255,0.05)"
                    />
                    <path 
                      d="M12 12 L12 22 L2 12" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path 
                      d="M12 12 L2 12 L12 2" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      fill="rgba(255,255,255,0.05)"
                    />
                    {/* Center circle */}
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="2" 
                      fill="currentColor"
                    />
                    {/* Pointer/indicator */}
                    <polygon 
                      points="12,1 10,4 14,4" 
                      fill="currentColor"
                    />
                  </motion.svg>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setShowSpinWheel(true)}
                    disabled={(user?.spinsUsed || 0) >= 5}
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M5 12H19M19 12L12 5M19 12L12 19" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <p className="text-xs text-white/80 mt-1 font-medium">
                    Spin
                  </p>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Rewards Card */}
          <motion.div
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(-1deg) rotateY(1deg)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            whileHover={{ 
              scale: 1.02, 
              y: -3,
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                opacity: 0.9
              }}
            />
            {/* Top highlight */}
            <div 
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
              }}
            />
            <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15L8 19H16L12 15Z" fill="currentColor"/>
                    <path d="M7 9V4C7 3.45 7.45 3 8 3H16C16.55 3 17 3.45 17 4V9L19 11V12H5V11L7 9Z" fill="currentColor"/>
                    <rect x="8" y="13" width="8" height="2" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base">🏆 Rewards</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full">
                      <div className="w-8 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-white/80">{user?.totalWins || 0}/10</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>

        {/* Goal Progress */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">🎯 Goal Progress</h3>
            <span className="text-xs text-white/70">{user?.spinsUsed || 0}/5 days</span>
          </div>
          
          {/* Progress Bar Instead of Days */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Daily Progress</span>
              <span className="text-xs text-white/60">{user?.spinsUsed || 0}/5</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, index) => (
                <div 
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    index < (user?.spinsUsed || 0) 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Challenge */}
          <motion.div 
            className="rounded-xl p-3 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(1deg) rotateY(-0.5deg)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ 
              scale: 1.01, 
              y: -2,
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
                opacity: 0.8
              }}
            />
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">⚡ Daily Spin Challenge</h4>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex-1 bg-white/30 rounded-full h-1.5">
                <div 
                  className="bg-white rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${((user?.spinsUsed || 0) / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{((user?.spinsUsed || 0) / 5 * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-white/80">
              {5 - (user?.spinsUsed || 0)} spins remaining for today!
            </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-base font-bold text-white mb-3">🪙 Token Collection</h3>
          <div className="space-y-2">
            {[
              { name: 'AIDOGE', icon: aidogeLogo, amount: balances?.token1 || '0', time: '2h 14 min', emoji: '🐕' },
              { name: 'BOOP', icon: boopLogo, amount: balances?.token2 || '0', time: '5h 22 min', emoji: '🎭' },
              { name: 'CATCH', icon: catchLogo, amount: balances?.token3 || '0', time: '1h 8 min', emoji: '🎯' }
            ].map((token, index) => {
              const hasBalance = BigInt(token.amount) > 0;
              const formattedAmount = formatTokenAmount(token.amount);
              
              return (
                <motion.div
                  key={index}
                  className="rounded-xl p-3 relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: `perspective(1000px) rotateX(${index % 2 === 0 ? '0.5deg' : '-0.5deg'}) rotateY(${index % 2 === 0 ? '-0.3deg' : '0.3deg'})`,
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    transition: { duration: 0.3 }
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Top highlight */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                    }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <img src={token.icon} alt={token.name} className="w-8 h-8 rounded-lg" />
                        <span className="absolute -top-1 -right-1 text-xs">{token.emoji}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{token.name}</div>
                        <div className="text-xs text-white/60">🔒 {token.time}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${hasBalance ? 'text-green-400' : 'text-gray-500'}`}>
                      +{formattedAmount}
                    </div>
                  </div>

                  {/* Claim button for tokens with balance */}
                  {hasBalance && (
                    <motion.div 
                      className="mt-2 pt-2 border-t border-white/10"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        onClick={() => {}}
                        disabled={false}
                        size="sm"
                        className={`w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border border-white/20 transition-all duration-200`}
                      >
                        Claim (Pay Gas)
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Global Claim All Button */}
          {balances && (Number(balances.token1) > 0 || Number(balances.token2) > 0 || Number(balances.token3) > 0) && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => {}}
                disabled={false}
                className="w-full h-10 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200 rounded-xl"
              >
                Claim All Tokens (Pay Gas)
              </Button>
            </motion.div>
          )}

          {/* Testing Panel - Force Win and Claim */}
          <motion.div
            className="mt-6 mb-4 p-4 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-sm font-bold text-white mb-3 text-center">🧪 Testing Panel</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {}}
                disabled={false}
                className="h-10 text-xs bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border border-orange-400/30"
              >
                🚀 Force Claim (Gas)
              </Button>
              <Button
                onClick={() => setShowSpinWheel(true)}
                disabled={!user}
                className="h-10 text-xs bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border border-green-400/30"
              >
                🎯 Spin (Pay Gas)
              </Button>
            </div>
            <p className="text-xs text-white/60 mt-2 text-center">
              Testing mode: 90% win rate, bypass claim thresholds
            </p>
          </motion.div>

        </motion.div>
      </div>

      {/* Navigation */}
      <Navigation />


      
      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinWheel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-8 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSpinWheel(false)}
          >
            <motion.div
              className="rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                }}
              />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  ARB<span className="text-blue-400">CASINO</span> - Wheel of Fortune
                </h3>
                <button
                  onClick={() => setShowSpinWheel(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <SpinWheel />
              {/* Debug Panel */}
              <div className="mt-4 space-y-4">
                <TestButton />
                <ContractDebug />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
