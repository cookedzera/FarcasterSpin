import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { updateConfig } from "@/lib/config";
import { useEffect, lazy, Suspense, useState, useCallback } from "react";
import { AudioManager } from "@/lib/audio-manager";

// Code splitting - lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const TokenCollection = lazy(() => import("@/pages/token-collection"));
const Admin = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));


// Preload commonly accessed pages after initial load
const preloadComponents = () => {
  // Preload most commonly used pages in background
  import("@/pages/profile");
  import("@/pages/leaderboard");
};

// Minimal loading component for instant navigation feel
const PageLoader = () => (
  <div className="min-h-screen page-transition gpu-accelerated" style={{
    background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
  }}>
    {/* No loading spinner for instant feel */}
  </div>
);

function Router() {
  return (
    <div className="page-transition gpu-accelerated">
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tokens" component={TokenCollection} />
          <Route path="/profile" component={Profile} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/admin" component={Admin} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [audioManager] = useState(() => AudioManager.getInstance());

  useEffect(() => {
    // Load contract configuration from API on app start
    updateConfig();
    
    // Initialize audio on app start
    audioManager.init();
    setIsMuted(audioManager.getMuted());
    
    // Preload commonly used components after a short delay for instant navigation
    const timer = setTimeout(preloadComponents, 500);
    return () => clearTimeout(timer);
  }, [audioManager]);

  const toggleMute = useCallback(() => {
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);
  }, [audioManager]);

  return (
    <TooltipProvider>
      <div className="app-container gpu-accelerated will-change-transform">
        {/* Music button integrated directly into main app */}
        <button
          onClick={toggleMute}
          className={`fixed top-4 left-4 z-50 w-10 h-10 rounded-md transition-all duration-300 font-mono text-xs font-bold backdrop-blur-sm ${
            isMuted 
              ? 'bg-red-900/80 border-2 border-red-400 text-red-400 shadow-lg hover:bg-red-800/90 hover:shadow-red-400/20' 
              : 'bg-emerald-900/80 border-2 border-emerald-400 text-emerald-400 neon-border hover:bg-emerald-800/90'
          }`}
          style={{
            textShadow: isMuted 
              ? '0 0 8px rgba(248, 113, 113, 0.8)' 
              : '0 0 8px rgba(52, 211, 153, 0.8)',
            boxShadow: isMuted
              ? '0 0 15px rgba(248, 113, 113, 0.3), inset 0 0 8px rgba(248, 113, 113, 0.1)'
              : '0 0 15px rgba(52, 211, 153, 0.3), inset 0 0 8px rgba(52, 211, 153, 0.1)'
          }}
          data-testid="button-mute-music"
        >
          {isMuted ? '🔇' : '♪'}
        </button>
        <Router />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
