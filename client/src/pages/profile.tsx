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

  // Remove loading state for smooth navigation
  if (userLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-gray-600">Please return to the game to create your profile.</p>
        </div>
      </div>
    );
  }

  const winRate = (user.totalSpins || 0) > 0 ? ((user.totalWins || 0) / (user.totalSpins || 1) * 100) : 0;
  const level = Math.floor((user.totalWins || 0) / 5) + 1;
  const nextLevelProgress = ((user.totalWins || 0) % 5) / 5 * 100;

  // Calculate achievements
  const achievements = [
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
  ];

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'history', label: 'History', icon: Clock }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
    }}>
      {/* Background effects */}
      <div className="fixed inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      <div className="fixed inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)'
      }} />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <motion.div
            className="relative inline-block mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-gray-900">
              <span className="text-white text-xs font-bold">{level}</span>
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
          <p className="text-gray-400 text-sm">Level {level} Player</p>
          
          {/* Level Progress */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{user.totalSpins}</div>
              <div className="text-xs text-gray-400">Total Spins</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{user.totalWins || 0}</div>
              <div className="text-xs text-gray-400">Total Wins</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{user.spinsUsed || 0}/5</div>
              <div className="text-xs text-gray-400">Today's Spins</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-gray-800/30 rounded-lg p-1 backdrop-blur-sm">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`mx-1 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
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
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                      Performance Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Win Rate</span>
                          <span className="text-white font-semibold">{winRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={winRate} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Daily Progress</span>
                          <span className="text-white font-semibold">{user.spinsUsed || 0}/5</span>
                        </div>
                        <Progress value={((user.spinsUsed || 0) / 5) * 100} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-white font-semibold mb-3">Recent Activity</h4>
                      <div className="text-gray-400 text-sm">
                        {user.lastSpinDate ? (
                          `Last spin: ${new Date(user.lastSpinDate).toLocaleDateString()}`
                        ) : (
                          "No recent activity"
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${
                      achievement.unlocked 
                        ? 'bg-gray-800/50 border-gray-600' 
                        : 'bg-gray-900/30 border-gray-800'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.unlocked 
                              ? 'bg-gray-700' 
                              : 'bg-gray-800/50'
                          }`}>
                            <achievement.icon className={`w-6 h-6 ${
                              achievement.unlocked 
                                ? achievement.color 
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              achievement.unlocked ? 'text-white' : 'text-gray-500'
                            }`}>
                              {achievement.name}
                            </h3>
                            <p className={`text-sm ${
                              achievement.unlocked ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {achievement.description}
                            </p>
                            {achievement.unlocked && (
                              <Badge variant="secondary" className="mt-2 bg-green-900/50 text-green-400">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Spin History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent spin history available</p>
                    <p className="text-sm">Start spinning to see your history here!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}