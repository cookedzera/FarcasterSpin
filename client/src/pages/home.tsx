import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import SpinWheel from "@/components/spin-wheel-clean";
import CountdownTimer from "@/components/countdown-timer";
import Navigation from "@/components/navigation";
import { WalletConnectCompact } from "@/components/wallet-connect-compact";
import { type GameStats } from "@shared/schema";

export default function Home() {
  const { user, isLoading: userLoading } = useGameState();
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  // Optimized handlers with useCallback
  const handleSpinWheelOpen = useCallback(() => setShowSpinWheel(true), []);
  const handleSpinWheelClose = useCallback(() => setShowSpinWheel(false), []);

  // Show minimal loading state
  if (userLoading) {
    return (
      <div className="min-h-screen relative" style={{
        background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
      }}>
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
      {/* Compact Wallet Connect - Top Right */}
      <div className="fixed top-4 right-4 z-30">
        <WalletConnectCompact />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-4 pb-24">
        {/* User Profile - Compact */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            {user?.username?.charAt(0) || 'P'}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            ARB<span className="text-blue-400">CASINO</span>
          </h1>
          <p className="text-white/60 text-sm">Welcome, {user?.username || 'Player'}</p>
        </motion.div>

        {/* Game Stats Card */}
        <motion.div
          className="rounded-2xl p-4 mb-6 text-white relative"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">🎰 Daily Stats</h3>
              <p className="text-white/70 text-sm">Spins: {user?.spinsUsed || 0}/5</p>
              <p className="text-white/70 text-sm">Wins: {user?.totalWins || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">Total Claims</p>
              <p className="text-xl font-bold text-blue-400">{stats?.contractTxs || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Spin Wheel Card */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-white relative"
          style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">🎡 Spin Wheel</h2>
              <p className="text-white/70 text-sm mb-2">Win AIDOGE, BOOP & BOBOTRUM tokens</p>
              <CountdownTimer />
            </div>
            <div className="flex flex-col items-center ml-4">
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg"
                onClick={handleSpinWheelOpen}
                disabled={(user?.spinsUsed || 0) >= 5}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
              <p className="text-xs text-white/60 mt-1">
                {(user?.spinsUsed || 0) >= 5 ? 'Daily limit reached' : 'Tap to spin'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinWheel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSpinWheelClose}
          >
            <motion.div
              className="rounded-3xl p-6 max-w-md w-full relative"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  ARB<span className="text-blue-400">CASINO</span> Wheel
                </h3>
                <button
                  onClick={handleSpinWheelClose}
                  className="text-white/60 hover:text-white transition-colors text-xl"
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