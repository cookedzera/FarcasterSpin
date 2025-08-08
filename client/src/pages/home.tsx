import { useState, useEffect } from "react";
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
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  const challenges = [
    {
      id: 1,
      title: "Daily Spin Reward",
      description: "Complete your daily spins",
      reward: "1000 Tokens",
      progress: (user?.spinsUsed || 0),
      maxProgress: 5,
      type: "daily",
      icon: "🎯",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      title: "Lucky Winner",
      description: "Win 3 spins in a row",
      reward: "2500 Tokens",
      progress: 1,
      maxProgress: 3,
      type: "achievement",
      icon: "🍀",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: 3,
      title: "Token Collector",
      description: "Collect all meme tokens",
      reward: "5000 Tokens",
      progress: 2,
      maxProgress: 3,
      type: "collection",
      icon: "💎",
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  const recentWins = [
    { token: "AIDOGE", amount: "1.2K", time: "2m ago", logo: aidogeLogo },
    { token: "BOOP", amount: "850", time: "5m ago", logo: boopLogo },
    { token: "CATCH", amount: "2.1K", time: "8m ago", logo: catchLogo }
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 font-medium">Loading Rewards Hub...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      {/* Header with User Profile */}
      <motion.header 
        className="relative z-10 px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user?.username?.charAt(0) || 'P'}
            </motion.div>
            <div>
              <h2 className="font-bold text-lg text-white">Welcome back!</h2>
              <p className="text-gray-400 text-sm">{user?.username || 'Player'}</p>
            </div>
          </div>
          
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-xs text-gray-400 mb-1">Daily Spins</div>
            <div className="font-bold text-white">{5 - (user?.spinsUsed || 0)}/5</div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-xs text-gray-400 mb-1">Total Wins</div>
            <div className="font-bold text-green-400">{user?.totalWins || 0}</div>
          </motion.div>
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-xs text-gray-400 mb-1">Rank</div>
            <div className="font-bold text-blue-400">#42</div>
          </motion.div>
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-xs text-gray-400 mb-1">Streak</div>
            <div className="font-bold text-purple-400">3🔥</div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 px-6 space-y-6">
        
        {/* Challenge Cards */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Daily Challenges</h3>
            <div className="text-xs text-gray-400">2/3 Complete</div>
          </div>
          
          <div className="space-y-3">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                className={`bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 cursor-pointer ${
                  selectedChallenge === index ? 'ring-2 ring-purple-500' : ''
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChallenge(index)}
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${challenge.gradient} rounded-xl flex items-center justify-center text-xl`}>
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{challenge.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full bg-gray-700/50 rounded-full h-2 mb-1">
                        <motion.div 
                          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${challenge.gradient} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {challenge.progress}/{challenge.maxProgress} Complete
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Reward</div>
                    <div className="font-bold text-green-400 text-sm">{challenge.reward}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Spin to Win Button */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl p-6 shadow-xl border border-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSpinWheel(true)}
            disabled={(user?.spinsUsed || 0) >= 5}
          >
            <div className="flex items-center justify-center space-x-3">
              <motion.div 
                className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl"
                animate={{ rotate: showSpinWheel ? 360 : 0 }}
                transition={{ duration: 2, repeat: showSpinWheel ? Infinity : 0 }}
              >
                🎰
              </motion.div>
              <div className="text-left">
                <h3 className="font-bold text-xl text-white mb-1">Spin to Win!</h3>
                <p className="text-purple-200 text-sm">
                  {(user?.spinsUsed || 0) >= 5 ? 'Come back tomorrow!' : 'Try your luck with meme tokens'}
                </p>
                <div className="flex items-center mt-2">
                  <CountdownTimer />
                </div>
              </div>
            </div>
          </motion.button>
        </motion.section>

        {/* Recent Wins */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Wins</h3>
            <div className="text-xs text-green-400">🔥 Hot streak!</div>
          </div>
          
          <div className="space-y-2">
            {recentWins.map((win, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3">
                  <img src={win.logo} alt={win.token} className="w-8 h-8 rounded-lg" />
                  <div>
                    <div className="font-semibold text-white text-sm">{win.token}</div>
                    <div className="text-xs text-gray-400">{win.time}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+{win.amount}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center py-6 text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connected to Base Network</span>
          </div>
          <p>Powered by Meme Token Rewards</p>
        </motion.footer>
      </div>

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinWheel && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSpinWheel(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Spin the Wheel!</h3>
                <button
                  onClick={() => setShowSpinWheel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
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
