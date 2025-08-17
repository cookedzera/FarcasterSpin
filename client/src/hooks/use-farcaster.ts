/**
 * React hook for Farcaster Mini App integration
 * Uses official SDK Method 1: Auto FID from Context
 */

import { useState, useEffect } from 'react';
import { getFarcasterUser, type FarcasterUser } from '@/services/farcaster';

export function useFarcaster() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFarcasterUser() {
      try {
        console.log('🚀 Loading Farcaster user...');
        
        // Add small delay to ensure SDK is loaded
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const farcasterUser = await getFarcasterUser();
        
        if (mounted) {
          setUser(farcasterUser);
          setIsAuthenticated(!!farcasterUser);
          setLoading(false);
          
          if (farcasterUser) {
            console.log('✅ Farcaster user loaded:', farcasterUser.displayName || farcasterUser.username);
          } else {
            console.log('ℹ️ No Farcaster user - using fallback');
          }
        }
      } catch (error) {
        console.error('💥 Error loading Farcaster user:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    }

    loadFarcasterUser();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    fid: user?.fid,
    username: user?.username,
    displayName: user?.displayName,
    avatarUrl: user?.pfpUrl,
    bio: user?.bio,
    isAuthenticated,
    loading
  };
}