import { Button } from "@/components/ui/button";
import { useSimpleSpin } from "@/hooks/use-simple-spin";
import { useAccount, useConnect } from "wagmi";
import { CONTRACT_CONFIG } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export function TestButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { triggerGasPopup, isSpinning } = useSimpleSpin();
  const { toast } = useToast();

  const handleTestSpin = async () => {
    console.log("Test spin clicked");
    console.log("Wallet connected:", isConnected);
    console.log("Wallet address:", address);
    console.log("Current chain:", chain);
    console.log("Contract address:", contractAddress);
    console.log("Expected chain ID:", CONTRACT_CONFIG.CHAIN_ID);

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (chain?.id !== CONTRACT_CONFIG.CHAIN_ID) {
      toast({
        title: "Wrong Network",
        description: `Please switch to Arbitrum Sepolia (Chain ID: ${CONTRACT_CONFIG.CHAIN_ID})`,
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Starting Transaction",
        description: "Check your wallet for the transaction popup!",
        variant: "default",
      });
      await triggerGasPopup();
      toast({
        title: "Transaction Sent!",
        description: "Transaction has been sent to the network",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Test spin failed:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-800">
      <h3 className="text-white mb-2">Debug Panel</h3>
      <div className="text-sm text-gray-300 mb-4">
        <p>Connected: {isConnected ? "Yes" : "No"}</p>
        <p>Address: {address || "None"}</p>
        <p>Chain: {chain?.name || "None"} (ID: {chain?.id || "None"})</p>
        <p>Contract: {CONTRACT_CONFIG.WHEEL_GAME_ADDRESS}</p>
        <p>Expected Chain ID: {CONTRACT_CONFIG.CHAIN_ID}</p>
      </div>
      
      {!isConnected ? (
        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button 
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="w-full"
              variant="outline"
            >
              Connect {connector.name}
            </Button>
          ))}
        </div>
      ) : (
        <Button 
          onClick={handleTestSpin}
          disabled={isSpinning}
          className="w-full"
        >
          {isSpinning ? "Spinning..." : "Test Spin (Should Show Gas Popup)"}
        </Button>
      )}
    </div>
  );
}