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
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-gray-50 pt-4 px-6">
        <div className="flex justify-between items-center text-sm font-medium text-gray-900">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <svg className="w-6 h-4" viewBox="0 0 24 16" fill="currentColor">
              <path d="M1 5h22v6H1z" fill="currentColor"/>
              <path d="M23 6v4h1a1 1 0 001-1V7a1 1 0 00-1-1h-1z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 pb-24">
        {/* User Profile */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            {user?.username?.charAt(0) || 'P'}
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hello, {user?.username || 'Player'}!
          </h1>
        </motion.div>

        {/* Main Action Cards */}
        <div className="space-y-4 mb-8">
          {/* Spin Challenge Card */}
          <motion.div
            className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Spin a Wheel</h2>
                <p className="text-teal-100 text-sm mb-4">Win meme tokens daily</p>
                <div className="text-sm text-teal-100">
                  <CountdownTimer />
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🎰
                </div>
                <motion.button
                  className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg"
                  onClick={() => setShowSpinWheel(true)}
                  disabled={(user?.spinsUsed || 0) >= 5}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  →
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Rewards Card */}
          <motion.div
            className="bg-gradient-to-br from-orange-300 to-pink-400 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h3 className="font-bold text-lg">Rewards</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-16 h-2 bg-white/30 rounded-full">
                      <div className="w-10 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-white/80">{user?.totalWins || 0}/10</span>
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
            <h3 className="text-lg font-bold text-gray-900">Goal Progress</h3>
            <span className="text-sm text-gray-600">{user?.spinsUsed || 0}/5 days</span>
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
            className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-white shadow-md"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Daily Spin Challenge</h4>
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
            <p className="text-xs text-green-100">
              {5 - (user?.spinsUsed || 0)} spins remaining for today!
            </p>
          </motion.div>
        </motion.div>

        {/* Recent Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Token Collection</h3>
          <div className="space-y-3">
            {[
              { name: 'AIDOGE', icon: aidogeLogo, amount: '1.2K', time: '2h 14 min' },
              { name: 'BOOP', icon: boopLogo, amount: '850', time: '5h 22 min' },
              { name: 'CATCH', icon: catchLogo, amount: '2.1K', time: '1h 8 min' }
            ].map((token, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3">
                  <img src={token.icon} alt={token.name} className="w-10 h-10 rounded-xl" />
                  <div>
                    <div className="font-semibold text-gray-900">{token.name}</div>
                    <div className="text-sm text-gray-500">{token.time}</div>
                  </div>
                </div>
                <div className="text-green-600 font-bold">+{token.amount}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-center space-x-8">
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full ${
              activeTab === 'home' ? 'bg-green-500 text-white' : 'text-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('home')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </motion.button>
          
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full ${
              activeTab === 'stats' ? 'bg-green-500 text-white' : 'text-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('stats')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11V3H8v6H2v12h20V11h-6zM10 5h4v14h-4V5zM4 11h4v8H4v-8zm16 8h-4v-6h4v6z"/>
            </svg>
          </motion.button>
          
          <motion.button
            className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-full ${
              activeTab === 'settings' ? 'bg-green-500 text-white' : 'text-gray-600'
            }`}
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
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Spin the Wheel!</h3>
                <button
                  onClick={() => setShowSpinWheel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
