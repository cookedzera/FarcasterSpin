import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { useEffect, useState } from "react";
import { useFarcasterAuth } from "./use-farcaster-auth";
import { useAccount } from 'wagmi';

export function useGameState() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user: farcasterUser, isAuthenticated: isFarcasterAuth, isLoading: farcasterLoading } = useFarcasterAuth();
  const { address: connectedWallet, isConnected } = useAccount();

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

    // If we have a connected wallet, prioritize using it for user identification
    if (isConnected && connectedWallet) {
      // Check if user exists for this wallet address
      const checkExistingUser = async () => {
        try {
          const response = await apiRequest("POST", "/api/user", {
            username: isFarcasterAuth && farcasterUser 
              ? (farcasterUser.username || farcasterUser.displayName || `FarcasterUser${farcasterUser.fid}`)
              : `Player${Math.floor(Math.random() * 10000)}`,
            walletAddress: connectedWallet,
            farcasterFid: isFarcasterAuth && farcasterUser ? farcasterUser.fid : undefined
          });
          const userData = await response.json() as User;
          setUserId(userData.id);
          localStorage.setItem("arbcasino_user_id", userData.id);
          localStorage.setItem("arbcasino_wallet_address", connectedWallet);
        } catch (error) {
          console.error('Failed to create/get user:', error);
        }
      };
      
      // Check if we have the same wallet stored
      const storedWallet = localStorage.getItem("arbcasino_wallet_address");
      if (storedWallet !== connectedWallet) {
        // Wallet changed, need to find/create user for new wallet
        localStorage.removeItem("arbcasino_user_id");
        checkExistingUser();
      } else {
        // Same wallet, check stored user ID
        const storedUserId = localStorage.getItem("arbcasino_user_id");
        if (storedUserId && !error) {
          setUserId(storedUserId);
        } else {
          checkExistingUser();
        }
      }
    } else {
      // No wallet connected, fall back to stored user or create new one
      const storedUserId = localStorage.getItem("arbcasino_user_id");
      
      if (storedUserId && !error) {
        setUserId(storedUserId);
      } else {
        // Clear invalid stored user ID and create a new user
        if (storedUserId && error) {
          localStorage.removeItem("arbcasino_user_id");
          localStorage.removeItem("arbcasino_wallet_address");
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
    }
  }, [error, farcasterLoading, isFarcasterAuth, farcasterUser, isConnected, connectedWallet]);

  return {
    user,
    farcasterUser,
    isFarcasterAuthenticated: isFarcasterAuth,
    isLoading: isLoading || initUserMutation.isPending || farcasterLoading,
    initUser: initUserMutation.mutate,
  };
}
