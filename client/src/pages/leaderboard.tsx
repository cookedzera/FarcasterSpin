import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Coins, Zap, Target } from "lucide-react";
import { Link } from "wouter";

interface LeaderboardEntry {
  id: string;
  username: string;
  walletAddress: string;
  farcasterUsername?: string;
  farcasterPfpUrl?: string;
  totalWins?: number;
  totalSpins?: number;
  totalRewards?: string;
  weeklyWins?: number;
  weeklySpins?: number;
  weeklyRewards?: string;
}

interface WeeklyEntry {
  userId: string;
  username: string;
  walletAddress: string;
  farcasterUsername?: string;
  farcasterPfpUrl?: string;
  weeklyWins: number;
  weeklySpins: number;
  weeklyRewards: string;
}

export default function Leaderboard() {
  const [category, setCategory] = useState<'wins' | 'spins' | 'rewards'>('wins');

  // Fetch main leaderboard
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', category],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?category=${category}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json() as Promise<LeaderboardEntry[]>;
    }
  });

  // Fetch weekly leaderboard
  const { data: weeklyLeaderboard, isLoading: weeklyLoading } = useQuery({
    queryKey: ['/api/leaderboard/weekly'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard/weekly?limit=10');
      if (!response.ok) throw new Error('Failed to fetch weekly leaderboard');
      return response.json() as Promise<WeeklyEntry[]>;
    }
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</div>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'wins': return 'Most Wins';
      case 'spins': return 'Most Spins';
      case 'rewards': return 'Biggest Rewards';
      default: return 'Leaderboard';
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry, cat: string) => {
    switch (cat) {
      case 'wins': return entry.totalWins || 0;
      case 'spins': return entry.totalSpins || 0;
      case 'rewards': return `${(parseFloat(entry.totalRewards || '0') / 1e18).toFixed(0)} tokens`;
      default: return 0;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            ArbCasino Leaderboard
          </h1>
          <p className="text-blue-200">
            Top players competing for crypto rewards on Arbitrum
          </p>
        </div>

        <Tabs value={category} onValueChange={(value) => setCategory(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border-blue-500/20">
            <TabsTrigger value="wins" className="data-[state=active]:bg-blue-600">
              <Target className="w-4 h-4 mr-2" />
              Most Wins
            </TabsTrigger>
            <TabsTrigger value="spins" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              Most Spins  
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-green-600">
              <Coins className="w-4 h-4 mr-2" />
              Biggest Rewards
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-orange-600">
              <Trophy className="w-4 h-4 mr-2" />
              This Week
            </TabsTrigger>
          </TabsList>

          {/* All-Time Leaderboards */}
          <TabsContent value="wins" className="space-y-4">
            <LeaderboardCard 
              title={getCategoryLabel(category)}
              data={leaderboard || []}
              category={category}
              getRankIcon={getRankIcon}
              getCategoryValue={getCategoryValue}
              formatAddress={formatAddress}
            />
          </TabsContent>

          <TabsContent value="spins" className="space-y-4">
            <LeaderboardCard 
              title={getCategoryLabel(category)}
              data={leaderboard || []}
              category={category}
              getRankIcon={getRankIcon}
              getCategoryValue={getCategoryValue}
              formatAddress={formatAddress}
            />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <LeaderboardCard 
              title={getCategoryLabel(category)}
              data={leaderboard || []}
              category={category}
              getRankIcon={getRankIcon}
              getCategoryValue={getCategoryValue}
              formatAddress={formatAddress}
            />
          </TabsContent>

          {/* Weekly Leaderboard */}
          <TabsContent value="weekly" className="space-y-4">
            <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  Weekly Champions
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Top performers this week • Resets every Monday
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weeklyLeaderboard?.map((entry, index) => (
                      <div 
                        key={entry.userId} 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <Avatar className="w-8 h-8 border-2 border-orange-500/30">
                            <AvatarImage src={entry.farcasterPfpUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-xs">
                              {entry.farcasterUsername?.[0]?.toUpperCase() || entry.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white font-medium">
                              {entry.farcasterUsername || entry.username}
                            </div>
                            <div className="text-orange-200 text-xs">
                              {formatAddress(entry.walletAddress)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-orange-400 font-bold">
                            {entry.weeklyWins} wins
                          </div>
                          <div className="text-orange-300 text-xs">
                            {entry.weeklySpins} spins • {(parseFloat(entry.weeklyRewards) / 1e18).toFixed(0)} tokens
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Game */}
        <div className="text-center">
          <Link href="/">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105">
              Back to Game
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reusable leaderboard card component
function LeaderboardCard({ 
  title, 
  data, 
  category, 
  getRankIcon, 
  getCategoryValue, 
  formatAddress 
}: {
  title: string;
  data: LeaderboardEntry[];
  category: string;
  getRankIcon: (position: number) => JSX.Element;
  getCategoryValue: (entry: LeaderboardEntry, cat: string) => any;
  formatAddress: (address: string) => string;
}) {
  return (
    <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription className="text-blue-200">
          All-time leaderboard based on on-chain contract events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players found. Start spinning to join the leaderboard!
            </div>
          ) : (
            data.map((entry, index) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(index + 1)}
                  <Avatar className="w-8 h-8 border-2 border-blue-500/30">
                    <AvatarImage src={entry.farcasterPfpUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                      {entry.farcasterUsername?.[0]?.toUpperCase() || entry.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium">
                      {entry.farcasterUsername || entry.username}
                    </div>
                    <div className="text-blue-200 text-xs">
                      {formatAddress(entry.walletAddress)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold">
                    {getCategoryValue(entry, category)}
                  </div>
                  {category !== 'rewards' && (
                    <div className="text-blue-300 text-xs">
                      {entry.totalSpins} total spins
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}