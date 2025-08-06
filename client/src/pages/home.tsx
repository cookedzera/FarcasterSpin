import { useQuery } from "@tanstack/react-query";
import { useGameState } from "@/hooks/use-game-state";
import SpinWheel from "@/components/spin-wheel";
import Leaderboard from "@/components/leaderboard";
import LiveStats from "@/components/live-stats";
import CountdownTimer from "@/components/countdown-timer";
import { type GameStats } from "@shared/schema";

export default function Home() {
  const { user, isLoading: userLoading } = useGameState();
  
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading ArbCasino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* Header */}
      <header className="text-center py-4 border-b border-border">
        <h1 className="font-pixel text-primary text-xl neon-text mb-2">🎰 ArbCasino</h1>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="text-primary font-medium">Arbitrum One Only</span>
        </div>
      </header>

      {/* Spin Wheel */}
      <SpinWheel />

      {/* Spin Status */}
      <div className="bg-card rounded-xl border border-border neon-border p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">🔢 Your Spins Today:</span>
          <span className="font-bold text-green-400 neon-green-text">
            {user?.spinsUsed || 0} / 2
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">⏰ Resets in:</span>
          <CountdownTimer />
        </div>
      </div>

      {/* Live Stats */}
      <LiveStats stats={stats} />

      {/* Leaderboard */}
      <Leaderboard />

      {/* Footer */}
      <footer className="text-center py-4 text-muted-foreground text-xs">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Connected to Arbitrum One</span>
        </div>
        <p>Powered by Farcaster Mini Apps</p>
        <div className="mt-2">
          <a href="/admin" className="text-primary hover:text-primary/80 text-xs">
            🔧 Admin Panel
          </a>
        </div>
      </footer>
    </div>
  );
}
