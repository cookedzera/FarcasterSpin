import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { updateConfig } from "@/lib/config";
import { useEffect } from "react";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import TokenCollection from "@/pages/token-collection";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Leaderboard from "@/pages/leaderboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tokens" component={TokenCollection} />
      <Route path="/profile" component={Profile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
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
