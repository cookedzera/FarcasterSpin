import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, User, Gamepad2, Coins } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location === '/profile') return 'profile';
    if (location === '/tokens') return 'tokens';
    if (location === '/admin') return 'admin';
    return 'home';
  });

  const handleNavigation = (tab: string, path: string) => {
    setActiveTab(tab);
    setLocation(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 py-4 relative z-20" style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="flex justify-center space-x-4">
        <motion.button
          className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-full transition-all duration-150 ${
            activeTab === 'home' ? 'text-white' : 'text-white/60'
          }`}
          style={activeTab === 'home' ? {
            background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
            boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
          } : {}}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleNavigation('home', '/')}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </motion.button>
        
        <motion.button
          className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-full transition-all duration-150 ${
            activeTab === 'tokens' ? 'text-white' : 'text-white/60'
          }`}
          style={activeTab === 'tokens' ? {
            background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
            boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
          } : {}}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleNavigation('tokens', '/tokens')}
        >
          <Coins className="w-6 h-6" />
          <span className="text-xs font-medium">Tokens</span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center space-y-1 px-4 py-2 rounded-full transition-all duration-150 text-white/40 cursor-not-allowed relative"
          disabled={true}
        >
          <div className="relative">
            <Gamepad2 className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 flex space-x-0.5">
              <span className="text-xs">🎮</span>
              <span className="text-xs">🃏</span>
            </div>
          </div>
          <span className="text-xs font-medium">Games</span>
          <span className="text-[10px] text-white/30 absolute -bottom-1">Coming Soon</span>
        </motion.button>
        
        <motion.button
          className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-full transition-all duration-150 ${
            activeTab === 'profile' ? 'text-white' : 'text-white/60'
          }`}
          style={activeTab === 'profile' ? {
            background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
            boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
          } : {}}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleNavigation('profile', '/profile')}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </motion.button>
      </div>
    </div>
  );
}