import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { updateConfig } from "@/lib/config";
import { useEffect, lazy, Suspense } from "react";

// Code splitting - lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const TokenCollection = lazy(() => import("@/pages/token-collection"));
const Admin = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));

// Loading component for suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{
    background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)'
  }}>
    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function Router() {
  return (
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
  );
}

function App() {
  useEffect(() => {
    // Load contract configuration from API on app start
    updateConfig();
  }, []);

  return (
    <TooltipProvider>
      <div className="app-container">
        <Router />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
