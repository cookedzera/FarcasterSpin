import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { useQuery } from "@tanstack/react-query";

import { Trophy, Zap, Target, Clock, Star, Award, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { type SpinResult } from "@shared/schema";

export default function Profile() {
  const { user, isLoading: userLoading } = useGameState();
  const [activeTab, setActiveTab] = useState('stats');

  // Mock recent spins for demonstration
  const { data: recentSpins } = useQuery<SpinResult[]>({
    queryKey: ["/api/user", user?.id, "recent-spins"],
    enabled: !!user?.id,
    queryFn: () => Promise.resolve([]), // Would fetch real data in production
  });

  // Render background immediately, show loading state for content only
  const shouldShowContent = !userLoading && user;

  // Only calculate when user data is available
  const winRate = user && (user.totalSpins || 0) > 0 ? ((user.totalWins || 0) / (user.totalSpins || 1) * 100) : 0;
  const level = user ? Math.floor((user.totalWins || 0) / 5) + 1 : 1;
  const nextLevelProgress = user ? ((user.totalWins || 0) % 5) / 5 * 100 : 0;

  // Calculate achievements - only when user data is available
  const achievements = user ? [
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first spin',
      icon: Trophy,
      unlocked: (user.totalWins || 0) >= 1,
      color: 'text-yellow-400'
    },
    {
      id: 'lucky_streak',
      name: 'Lucky Seven',
      description: 'Win 7 times',
      icon: Star,
      unlocked: (user.totalWins || 0) >= 7,
      color: 'text-purple-400'
    },
    {
      id: 'spinner',
      name: 'Spin Master',
      description: 'Complete 50 spins',
      icon: Target,
      unlocked: (user.totalSpins || 0) >= 50,
      color: 'text-blue-400'
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      description: 'Win 20 times',
      icon: Award,
      unlocked: (user.totalWins || 0) >= 20,
      color: 'text-green-400'
    }
  ] : [];

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'history', label: 'History', icon: Clock }
  ];

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

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pb-24 max-w-4xl">
        {!shouldShowContent ? (
          // Loading state with same background
          <div className="min-h-screen flex items-center justify-center -mt-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 opacity-60"></div>
              <p className="text-white/60 text-sm">Loading profile...</p>
            </div>
          </div>
        ) : (
          <>
        {/* All profile content wrapped here */}
        {/* Header Profile Card */}
        <motion.div
          className="rounded-3xl p-6 text-white mb-8 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transform: 'perspective(1000px) rotateX(2deg) rotateY(-1deg)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
          }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ 
            scale: 1.02, 
            y: -5,
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            transition: { duration: 0.3 }
          }}
        >
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              borderRadius: 'inherit'
            }}
          />
          
          <div className="relative z-10 text-center">
            {/* Avatar */}
            <motion.div
              className="relative inline-block mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {user?.username?.charAt(0) || 'P'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-gray-900">
                <span className="text-white text-xs font-bold">{level}</span>
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-1">{user?.username}</h1>
            <p className="text-white/60 text-sm mb-4">Level {level} Player</p>
            
            {/* Level Progress */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Level {level}</span>
                <span>Level {level + 1}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${nextLevelProgress}%`,
                    background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Total Spins Card */}
          <motion.div
            className="rounded-3xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              borderRadius: 'inherit'
            }} />
            <div className="relative z-10 text-center">
              <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user?.totalSpins || 0}</p>
              <p className="text-xs text-white/60">Total Spins</p>
            </div>
          </motion.div>

          {/* Total Wins Card */}
          <motion.div
            className="rounded-3xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 'inherit'
            }} />
            <div className="relative z-10 text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user?.totalWins || 0}</p>
              <p className="text-xs text-white/60">Total Wins</p>
            </div>
          </motion.div>

          {/* Win Rate Card */}
          <motion.div
            className="rounded-3xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: 'inherit'
            }} />
            <div className="relative z-10 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
              <p className="text-xs text-white/60">Win Rate</p>
            </div>
          </motion.div>

          {/* Today's Spins Card */}
          <motion.div
            className="rounded-3xl p-4 text-white relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 'inherit'
            }} />
            <div className="relative z-10 text-center">
              <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{5 - (user?.spinsUsed || 0)}/5</p>
              <p className="text-xs text-white/60">Today's Spins</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div 
            className="rounded-2xl p-1"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`mx-1 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                } : {}}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'stats' && (
              <motion.div
                className="rounded-3xl p-6 text-white relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
                }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  borderRadius: 'inherit'
                }} />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <TrendingUp className="w-6 h-6 mr-3 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Performance Statistics</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-2xl" style={{
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      <span className="text-white/70">Win Rate</span>
                      <span className="text-white font-bold text-lg">{winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl" style={{
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      <span className="text-white/70">Spins Used Today</span>
                      <span className="text-white font-bold text-lg">{user?.spinsUsed || 0}/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl" style={{
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      <span className="text-white/70">Last Activity</span>
                      <span className="text-white/80 text-sm">
                        {user?.lastSpinDate ? (
                          new Date(user.lastSpinDate).toLocaleDateString()
                        ) : (
                          "No recent spins"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className="rounded-3xl p-4 text-white relative overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="absolute inset-0 opacity-10" style={{
                      background: achievement.unlocked 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      borderRadius: 'inherit'
                    }} />
                    
                    <div className="relative z-10 flex items-center space-x-4">
                      <div 
                        className="p-3 rounded-2xl"
                        style={{
                          background: achievement.unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                        }}
                      >
                        <achievement.icon className={`w-8 h-8 ${
                          achievement.unlocked ? achievement.color : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${
                          achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${
                          achievement.unlocked ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="px-3 py-1 rounded-full text-xs font-bold text-green-400" style={{
                          background: 'rgba(16, 185, 129, 0.2)'
                        }}>
                          ✓ Unlocked
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <motion.div
                className="rounded-3xl p-6 text-white relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(255, 255, 255, 0.1) inset'
                }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  borderRadius: 'inherit'
                }} />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <Clock className="w-6 h-6 mr-3 text-orange-400" />
                    <h3 className="text-xl font-bold text-white">Spin History</h3>
                  </div>
                  
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/70 text-lg mb-2">No recent spin history available</p>
                    <p className="text-white/50 text-sm">Start spinning to see your history here!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
        </>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}