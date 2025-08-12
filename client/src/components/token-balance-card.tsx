import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Coins, Zap, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "ethers";

interface TokenBalanceCardProps {
  userId: string;
}

interface TokenBalances {
  token1: string;
  token2: string;
  token3: string;
  canClaim: boolean;
  totalValueUSD: string;
}

interface TokenClaim {
  id: string;
  userId: string;
  token1Amount: string;
  token2Amount: string;
  token3Amount: string;
  totalValueUSD: string;
  transactionHash: string | null;
  status: string;
  timestamp: string;
}

export function TokenBalanceCard({ userId }: TokenBalanceCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: balances, isLoading } = useQuery<TokenBalances>({
    queryKey: ['/api/user', userId, 'balances'],
    enabled: !!userId,
  });

  const { data: claims } = useQuery<TokenClaim[]>({
    queryKey: ['/api/user', userId, 'claims'],
    enabled: !!userId,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/claim', {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim tokens');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Tokens Claimed!",
        description: data.message || "Tokens claimed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'claims'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim tokens",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTokenAmount = (amount: string, decimals = 18) => {
    try {
      return parseFloat(formatUnits(amount, decimals)).toFixed(6);
    } catch {
      return "0.000000";
    }
  };

  const tokenData = [
    {
      symbol: "TOKEN1",
      name: "Casino Token 1",
      amount: balances?.token1 || "0",
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      symbol: "TOKEN2", 
      name: "Casino Token 2",
      amount: balances?.token2 || "0",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      symbol: "TOKEN3",
      name: "Casino Token 3", 
      amount: balances?.token3 || "0",
      icon: Award,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  const hasTokens = tokenData.some(token => BigInt(token.amount) > 0);
  const canClaim = balances?.canClaim || false;
  const totalValueUSD = balances?.totalValueUSD || "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            Accumulated Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Balances */}
          <div className="grid gap-3">
            {tokenData.map((token) => {
              const Icon = token.icon;
              const formattedAmount = formatTokenAmount(token.amount);
              const hasBalance = BigInt(token.amount) > 0;
              
              return (
                <motion.div
                  key={token.symbol}
                  className={`p-3 rounded-lg border ${token.bgColor} ${
                    hasBalance ? 'border-gray-600' : 'border-gray-800'
                  } transition-all duration-200`}
                  whileHover={hasBalance ? { scale: 1.02 } : {}}
                  data-testid={`balance-${token.symbol.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${token.bgColor}`}>
                        <Icon className={`h-4 w-4 ${token.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-gray-400">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm ${hasBalance ? 'text-white' : 'text-gray-500'}`}>
                        {formattedAmount}
                      </div>
                      <div className="text-xs text-gray-400">
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Total Value and Claim Button */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Total Value (USD)</div>
              <div className="text-lg font-bold text-white">
                ${parseFloat(totalValueUSD).toFixed(6)}
              </div>
            </div>

            <Button
              onClick={() => claimMutation.mutate()}
              disabled={!canClaim || claimMutation.isPending}
              className={`w-full ${
                canClaim 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                  : 'bg-gray-700 cursor-not-allowed'
              } text-white transition-all duration-200`}
              data-testid="button-claim-tokens"
            >
              {claimMutation.isPending ? (
                "Processing..."
              ) : canClaim ? (
                "Claim Tokens"
              ) : (
                "Minimum $1.00 required"
              )}
            </Button>

            {!hasTokens && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Win spins to accumulate tokens
              </p>
            )}
          </div>

          {/* Recent Claims */}
          {claims && claims.length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-white mb-2">Recent Claims</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {claims.slice(0, 3).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between text-xs p-2 bg-gray-800/50 rounded">
                    <div className="text-gray-400">
                      {new Date(claim.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-white font-mono">
                      ${parseFloat(claim.totalValueUSD).toFixed(4)}
                    </div>
                    {claim.transactionHash && (
                      <ExternalLink className="h-3 w-3 text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}