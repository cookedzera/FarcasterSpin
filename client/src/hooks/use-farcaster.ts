/**
 * React hook for Farcaster integration
 * Provides real user data instead of generic player IDs
 */

import { useState, useEffect } from 'react';
import { initializeFarcaster } from '@/services/farcaster-service';

interface FarcasterUser {
  fid: number;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
}

interface UseFarcasterResult {
  farcasterUser: FarcasterUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  displayName: string;
  username: string;
  avatarUrl?: string;
}

export function useFarcaster(): UseFarcasterResult {
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFarcasterUser() {
      try {
        console.log('Loading Farcaster user...');
        const user = await initializeFarcaster();
        
        if (isMounted) {
          setFarcasterUser(user);
          setIsLoading(false);
          
          if (user) {
            console.log('Farcaster user loaded:', {
              fid: user.fid,
              displayName: user.displayName,
              username: user.username
            });
          } else {
            console.log('No Farcaster user found - using fallback');
          }
        }
      } catch (error) {
        console.error('Error loading Farcaster user:', error);
        if (isMounted) {
          setFarcasterUser(null);
          setIsLoading(false);
        }
      }
    }

    loadFarcasterUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Derived values with fallbacks
  const isAuthenticated = !!farcasterUser?.fid;
  const displayName = farcasterUser?.displayName || farcasterUser?.username || 'Player';
  const username = farcasterUser?.username || `user${farcasterUser?.fid || ''}`;
  const avatarUrl = farcasterUser?.avatarUrl;

  return {
    farcasterUser,
    isLoading,
    isAuthenticated,
    displayName,
    username,
    avatarUrl
  };
}