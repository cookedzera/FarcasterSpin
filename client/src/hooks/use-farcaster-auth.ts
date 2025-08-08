import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  custody?: string;
  verifications?: string[];
}

interface FarcasterAuth {
  user: FarcasterUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
  signOut: () => void;
}

export function useFarcasterAuth(): FarcasterAuth {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticate = async () => {
    try {
      setIsLoading(true);
      
      // For development/testing, create a mock authenticated user
      // In production, this would use the real Farcaster Mini App SDK
      const mockUser = {
        fid: Math.floor(Math.random() * 100000) + 1000,
        username: `fc-user-${Math.floor(Math.random() * 1000)}`,
        displayName: 'Farcaster Test User',
        bio: 'Connected via Farcaster Mini App',
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        custody: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        verifications: []
      };
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('farcaster_user', JSON.stringify(mockUser));
      
    } catch (error) {
      console.error('Farcaster authentication failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('farcaster_user');
  };

  // Initialize on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored user data first
        const storedUser = localStorage.getItem('farcaster_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            localStorage.removeItem('farcaster_user');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Auto-authentication failed:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    authenticate,
    signOut
  };
}