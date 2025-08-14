import { motion } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { useFarcasterAuth } from "@/hooks/use-farcaster-auth";
import { Trophy, Zap, Target, Star, Award, Coins, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { WalletConnectCompact } from "@/components/wallet-connect-compact";

export default function Profile() {
  const { user, farcasterUser, isFarcasterAuthenticated, isLoading: userLoading } = useGameState();
  const { user: authUser, walletConnected } = useFarcasterAuth();

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
        {!shouldShowContent ? (
          // Loading state
          <div className="min-h-screen flex items-center justify-center -mt-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60 text-sm">Loading profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <motion.div 
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                }}
              >
                {user?.username?.charAt(0) || 'P'}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{user?.username || 'Player'}</h1>
              <p className="text-white/60 text-sm">Level {level} Casino Player</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                className="rounded-2xl p-4 text-white text-center"
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
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{user?.totalWins || 0}</p>
                <p className="text-xs text-white/60">Total Wins</p>
              </motion.div>

              <motion.div
                className="rounded-2xl p-4 text-white text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">{user?.totalSpins || 0}</p>
                <p className="text-xs text-white/60">Total Spins</p>
              </motion.div>

              <motion.div
                className="rounded-2xl p-4 text-white text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">{winRate.toFixed(0)}%</p>
                <p className="text-xs text-white/60">Win Rate</p>
              </motion.div>

              <motion.div
                className="rounded-2xl p-4 text-white text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-400">{level}</p>
                <p className="text-xs text-white/60">Level</p>
              </motion.div>
            </div>

            {/* Achievements */}
            <motion.div
              className="rounded-2xl p-4 mb-6 text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-bold mb-3">🏆 Achievements</h3>
              <div className="grid grid-cols-1 gap-3">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                        achievement.unlocked 
                          ? 'bg-white/10 border border-white/20' 
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <IconComponent 
                        className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-white/30'}`} 
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                          {achievement.name}
                        </p>
                        <p className={`text-xs ${achievement.unlocked ? 'text-white/70' : 'text-white/40'}`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}