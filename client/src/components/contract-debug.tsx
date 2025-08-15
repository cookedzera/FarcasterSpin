import { Button } from "@/components/ui/button";
import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_CONFIG } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

const WHEEL_GAME_ABI = [
  {
    "type": "function",
    "name": "MAX_DAILY_SPINS",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "players",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [
      {"type": "uint256", "name": "totalSpins"},
      {"type": "uint256", "name": "totalWins"},
      {"type": "uint256", "name": "lastSpinDate"},
      {"type": "uint256", "name": "dailySpins"}
    ],
    "stateMutability": "view"
  }
] as const;

export function ContractDebug() {
  const { address, isConnected, chain } = useAccount();
  const { toast } = useToast();

  // Read contract state
  const { data: maxDailySpins } = useReadContract({
    address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'MAX_DAILY_SPINS',
  });

  const { data: playerData } = useReadContract({
    address: CONTRACT_CONFIG.WHEEL_GAME_ADDRESS,
    abi: WHEEL_GAME_ABI,
    functionName: 'players',
    args: address ? [address] : undefined,
  });

  const handleContractCheck = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    console.log("=== CONTRACT DEBUG INFO ===");
    console.log("Contract Address:", CONTRACT_CONFIG.WHEEL_GAME_ADDRESS);
    console.log("Player Address:", address);
    console.log("Chain:", chain?.name, "ID:", chain?.id);
    console.log("Expected Chain ID:", CONTRACT_CONFIG.CHAIN_ID);
    console.log("Max Daily Spins:", maxDailySpins?.toString());
    console.log("Player Data:", playerData);
    if (playerData) {
      console.log("Player Total Spins:", playerData[0]?.toString());
      console.log("Player Total Wins:", playerData[1]?.toString());
      console.log("Player Last Spin Date:", playerData[2]?.toString());
      console.log("Player Daily Spins:", playerData[3]?.toString());
    }
    
    toast({
      title: "Contract Debug Info",
      description: "Check console for detailed contract information",
      variant: "default",
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-700 text-white">
      <h3 className="text-white mb-2">Contract Debug</h3>
      <div className="text-sm text-gray-300 mb-4 space-y-1">
        <p>Max Daily Spins: {maxDailySpins?.toString() || "Loading..."}</p>
        <p>Your Daily Spins: {playerData ? playerData[3]?.toString() : "0"} / {maxDailySpins?.toString() || "5"}</p>
        <p>Your Total Spins: {playerData ? playerData[0]?.toString() : "0"}</p>
        <p>Chain Match: {chain?.id === CONTRACT_CONFIG.CHAIN_ID ? "✅" : "❌"}</p>
        <p>Contract: {CONTRACT_CONFIG.WHEEL_GAME_ADDRESS.slice(0, 8)}...</p>
      </div>
      
      <Button 
        onClick={handleContractCheck}
        className="w-full"
        variant="outline"
      >
        Log Contract Details
      </Button>
    </div>
  );
}