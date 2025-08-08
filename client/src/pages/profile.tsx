import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { useQuery } from "@tanstack/react-query";

import { Trophy, Zap, Target, Clock, Star, Award, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const nextLevelProgress = ((user.totalWins || 0) % 5) * 20;

  const achievements = [
    {
      id: 'first_win',
      name: 'First Win',
      description: 'Win your first spin',
      icon: Star,
      unlocked: (user.totalWins || 0) >= 1,
      color: 'text-yellow-400'
    },
    {
      id: 'lucky_streak',
      name: 'Lucky Streak',
      description: 'Win 5 times in a row',
      icon: Trophy,
      unlocked: false, // Would need streak tracking
      color: 'text-green-400'
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
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
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
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{user.totalRewards || 0}</div>
            <div className="text-xs text-gray-400">Tokens Won</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-full p-1 border border-gray-700">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-full flex items-center transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'stats' && (
              <div className="grid gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                      Detailed Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Average Win Rate</div>
                        <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Level</div>
                        <div className="text-2xl font-bold text-white">{level}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Spins Today</div>
                        <div className="text-2xl font-bold text-white">{user.spinsToday || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Remaining Today</div>
                        <div className="text-2xl font-bold text-white">{Math.max(0, 5 - (user.spinsToday || 0))}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className={`
                      bg-gray-800/50 border-gray-700 transition-all duration-300
                      ${achievement.unlocked ? 'ring-2 ring-green-500/30' : 'opacity-60'}
                    `}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              p-3 rounded-full 
                              ${achievement.unlocked ? 'bg-green-500/20' : 'bg-gray-600/20'}
                            `}>
                              <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white mb-1">{achievement.name}</h3>
                              <p className="text-sm text-gray-400">{achievement.description}</p>
                            </div>
                          </div>
                          <div>
                            {achievement.unlocked ? (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                Unlocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-600 text-gray-500">
                                Locked
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
    </div>
  );
}