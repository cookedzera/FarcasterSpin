import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useGameState() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize user
  const initUserMutation = useMutation({
    mutationFn: async (userData: { username: string; walletAddress?: string }) => {
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
        // Create a new user with a mock wallet address
        const mockUsername = `Player${Math.floor(Math.random() * 10000)}`;
        // Generate a proper 40-character hex address (20 bytes = 40 hex chars)
        const mockWallet = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        initUserMutation.mutate({
          username: mockUsername,
          walletAddress: mockWallet
        });
      }
    }
  }, [error]);

  return {
    user,
    isLoading: isLoading || initUserMutation.isPending,
    initUser: initUserMutation.mutate,
  };
}
