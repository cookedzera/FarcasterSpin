import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import SpinWheel from "@/components/spin-wheel";
import CountdownTimer from "@/components/countdown-timer";
import { type GameStats } from "@shared/schema";
import aidogeLogo from "@assets/photo_2023-04-18_14-25-28_1754468465899.jpg";
import boopLogo from "@assets/Boop_resized_1754468548333.webp";
import catchLogo from "@assets/Logomark_colours_1754468507462.webp";

export default function Home() {
  const { user, isLoading: userLoading } = useGameState();
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      


      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 pb-24">
        {/* User Profile */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset',
              backdropFilter: 'blur(20px)'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {user?.username?.charAt(0) || 'P'}
          </motion.div>
          <div className="mb-3">
            <motion.h1 
              className="text-3xl font-bold text-white mb-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ARB<span className="text-blue-400">CASINO</span>
            </motion.h1>
            <div className="w-20 h-0.5 bg-blue-400 mx-auto mb-2 rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Hello, {user?.username || 'Player'}!
          </h2>
        </motion.div>

        {/* Main Action Cards */}
        <div className="space-y-6 mb-8">
          {/* Spin Challenge Card */}
          <motion.div
            className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(2deg) rotateY(-1deg)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
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
                <h2 className="text-xl font-bold mb-2">🎡 Spin a Wheel</h2>
                <p className="text-teal-100 text-sm mb-4">💰 Win meme tokens daily</p>
                <div className="text-sm text-teal-100">
                  <CountdownTimer />
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <motion.svg 
                    className="w-8 h-8 text-white" 
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
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg relative overflow-hidden"
                  onClick={() => setShowSpinWheel(true)}
                  disabled={(user?.spinsUsed || 0) >= 5}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 4px 15px rgba(59, 130, 246, 0.2)',
                      '0 6px 20px rgba(147, 51, 234, 0.3)',
                      '0 4px 15px rgba(59, 130, 246, 0.2)'
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <span className="relative z-10">🚀</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0"
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Rewards Card */}
          <motion.div
            className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(-1deg) rotateY(1deg)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
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
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15L8 19H16L12 15Z" fill="currentColor"/>
                    <path d="M7 9V4C7 3.45 7.45 3 8 3H16C16.55 3 17 3.45 17 4V9L19 11V12H5V11L7 9Z" fill="currentColor"/>
                    <rect x="8" y="13" width="8" height="2" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">🏆 Rewards</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-16 h-2 bg-white/30 rounded-full">
                      <div className="w-10 h-2 bg-white rounded-full"></div>
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">🎯 Goal Progress</h3>
            <span className="text-sm text-white/70">{user?.spinsUsed || 0}/5 days</span>
          </div>
          
          {/* Days of Week */}
          <div className="flex justify-between mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={index} className="text-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium mb-1 ${
                  index < (user?.spinsUsed || 0) 
                    ? index === 0 ? 'bg-red-500 text-white' :
                      index === 1 ? 'bg-purple-500 text-white' :
                      index === 2 ? 'bg-green-500 text-white' : 'bg-gray-300'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>

          {/* Current Challenge */}
          <motion.div 
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px) rotateX(1deg) rotateY(-0.5deg)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ 
              scale: 1.01, 
              y: -3,
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
              <h4 className="font-semibold">⚡ Daily Spin Challenge</h4>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 bg-white/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
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
          <h3 className="text-lg font-bold text-white mb-4">🪙 Token Collection</h3>
          <div className="space-y-3">
            {[
              { name: 'AIDOGE', icon: aidogeLogo, amount: '1.2K', time: '2h 14 min', emoji: '🐕' },
              { name: 'BOOP', icon: boopLogo, amount: '850', time: '5h 22 min', emoji: '🎭' },
              { name: 'CATCH', icon: catchLogo, amount: '2.1K', time: '1h 8 min', emoji: '🎯' }
            ].map((token, index) => (
              <motion.div
                key={index}
                className="rounded-2xl p-4 flex items-center justify-between relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transform: `perspective(1000px) rotateX(${index % 2 === 0 ? '0.5deg' : '-0.5deg'}) rotateY(${index % 2 === 0 ? '-0.3deg' : '0.3deg'})`,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -3,
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
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src={token.icon} alt={token.name} className="w-10 h-10 rounded-xl" />
                    <span className="absolute -top-1 -right-1 text-xs">{token.emoji}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{token.name}</div>
                    <div className="text-sm text-white/60">⏰ {token.time}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+{token.amount}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 relative z-20" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex justify-center space-x-8">
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'home' ? 'text-white' : 'text-white/60'
            }`}
            style={activeTab === 'home' ? {
              background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
              boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
            } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('home')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </motion.button>
          
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'stats' ? 'text-white' : 'text-white/60'
            }`}
            style={activeTab === 'stats' ? {
              background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
              boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
            } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('stats')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11V3H8v6H2v12h20V11h-6zM10 5h4v14h-4V5zM4 11h4v8H4v-8zm16 8h-4v-6h4v6z"/>
            </svg>
          </motion.button>
          
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'settings' ? 'text-white' : 'text-white/60'
            }`}
            style={activeTab === 'settings' ? {
              background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
              boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
            } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('settings')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinWheel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                <h3 className="text-xl font-bold text-white">Spin the Wheel!</h3>
                <button
                  onClick={() => setShowSpinWheel(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <SpinWheel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
