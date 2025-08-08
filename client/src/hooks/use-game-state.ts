import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { useEffect, useState } from "react";
import { useFarcasterAuth } from "./use-farcaster-auth";

export function useGameState() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user: farcasterUser, isAuthenticated: isFarcasterAuth, isLoading: farcasterLoading } = useFarcasterAuth();

  // Initialize user
  const initUserMutation = useMutation({
    mutationFn: async (userData: { username: string; walletAddress?: string; farcasterFid?: number }) => {
      const response = await apiRequest("POST", "/api/user", userData);
      return response.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setUserId(user.id);
      localStorage.setItem("arbcasino_user_id", user.id);
    }
  });

  // Get user data
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
    retry: false,
  });

  // Initialize user on mount
  useEffect(() => {
    // Wait for Farcaster auth to complete
    if (farcasterLoading) return;

    const storedUserId = localStorage.getItem("arbcasino_user_id");
    
    if (storedUserId && !error) {
      setUserId(storedUserId);
    } else {
      // Clear invalid stored user ID and create a new user
      if (storedUserId && error) {
        localStorage.removeItem("arbcasino_user_id");
        setUserId(null);
      }
      
      if (!storedUserId || error) {
        // Create user with Farcaster data if available, otherwise use mock data
        const username = isFarcasterAuth && farcasterUser 
          ? (farcasterUser.username || farcasterUser.displayName || `FarcasterUser${farcasterUser.fid}`)
          : `Player${Math.floor(Math.random() * 10000)}`;
          
        const walletAddress = isFarcasterAuth && farcasterUser?.custody
          ? farcasterUser.custody
          : `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        initUserMutation.mutate({
          username,
          walletAddress,
          farcasterFid: isFarcasterAuth && farcasterUser ? farcasterUser.fid : undefined
        });
      }
    }
  }, [error, farcasterLoading, isFarcasterAuth, farcasterUser]);

  return {
    user,
    farcasterUser,
    isFarcasterAuthenticated: isFarcasterAuth,
    isLoading: isLoading || initUserMutation.isPending || farcasterLoading,
    initUser: initUserMutation.mutate,
  };
}
