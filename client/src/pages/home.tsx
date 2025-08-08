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
  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  // Remove loading state for smooth navigation
  if (userLoading) return null;

  return (
    <div className="px-6 py-8 pb-24">
      {/* User Profile */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
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
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
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
      <motion.div 
        className="space-y-6 mb-8"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {/* Spin Card */}
        <motion.div 
          className="relative rounded-3xl p-6 overflow-hidden cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(74, 222, 128, 0.1), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
          }}
          onClick={() => setShowSpinWheel(true)}
          whileHover={{ 
            scale: 1.02, 
            y: -4,
            boxShadow: '0 15px 50px rgba(74, 222, 128, 0.2), 0 1px 8px rgba(255, 255, 255, 0.15) inset'
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.5), transparent)'
            }}
          />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Spin to Win!</h3>
              <p className="text-white/70">Try your luck and win PEPE tokens</p>
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-green-400 text-2xl">💰</span>
                <span className="text-white/80 text-sm">Up to 1000 PEPE</span>
              </div>
            </div>
            <motion.div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
                boxShadow: '0 8px 25px rgba(74, 222, 128, 0.3)'
              }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
            >
              🎰
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(255, 255, 255, 0.05) inset'
          }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            }}
          />
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {user?.totalSpins || 0}
              </div>
              <div className="text-white/60 text-sm">Total Spins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {user?.totalWins || 0}
              </div>
              <div className="text-white/60 text-sm">Total Wins</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-sm">Spins remaining today:</span>
              <span className="text-white font-semibold">{Math.max(0, 5 - (user?.spinsToday || 0))}/5</span>
            </div>
            <CountdownTimer />
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Wins */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Community Wins 🎉</h3>
        <div className="space-y-3">
          {[
            { name: 'AIDOGE', amount: '500', icon: aidogeLogo, emoji: '🐕', time: '2 min ago' },
            { name: 'BOOP', amount: '750', icon: boopLogo, emoji: '👻', time: '5 min ago' },
            { name: 'CATCH', amount: '1000', icon: catchLogo, emoji: '🎣', time: '8 min ago' },
          ].map((token, i) => (
            <motion.div
              key={token.name}
              className="relative rounded-2xl p-4 flex items-center justify-between overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
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