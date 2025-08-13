import { ethers } from "ethers";

// Arbitrum mainnet configuration
const ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc";
const WHEEL_GAME_ADDRESS = ""; // Will be set after deployment

// Contract ABI for the WheelGame contract
const WHEEL_GAME_ABI = [
  "function spin(string memory segment) external",
  "function claimRewards(address tokenAddress) external",
  "function claimAllRewards() external",
  "function getPlayerStats(address playerAddress) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getPendingRewards(address playerAddress) external view returns (uint256, uint256, uint256)",
  "event SpinResult(address indexed player, string segment, bool isWin, address tokenAddress, uint256 rewardAmount)",
  "event RewardsClaimed(address indexed player, address indexed token, uint256 amount)"
];

// Token addresses
export const TOKEN_ADDRESSES = {
  AIDOGE: "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b",
  BOOP: "0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3",
  BOBOTRUM: "0x60460971a3D79ef265dfafA393ffBCe97d91E8B8"
} as const;

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    
    if (process.env.WALLET_PRIVATE_KEY && WHEEL_GAME_ADDRESS) {
      this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(WHEEL_GAME_ADDRESS, WHEEL_GAME_ABI, this.wallet);
    }
  }

  async executeSpin(playerAddress: string, segment: string): Promise<{
    txHash: string;
    isWin: boolean;
    tokenAddress: string;
    rewardAmount: string;
  }> {
    if (!this.contract || !this.wallet) {
      throw new Error("Contract not initialized");
    }

    try {
      // Execute spin transaction
      const tx = await this.contract.spin(segment);
      const receipt = await tx.wait();

      // Parse the SpinResult event
      const spinEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed.name === "SpinResult";
        } catch {
          return false;
        }
      });

      if (spinEvent) {
        const parsed = this.contract.interface.parseLog(spinEvent);
        if (parsed) {
          return {
            txHash: receipt.hash,
            isWin: parsed.args.isWin,
            tokenAddress: parsed.args.tokenAddress,
            rewardAmount: parsed.args.rewardAmount.toString()
          };
        }
      }

      throw new Error("SpinResult event not found");
    } catch (error: any) {
      console.error("Blockchain spin error:", error);
      throw new Error(`Spin failed: ${error.message}`);
    }
  }

  async claimRewards(playerAddress: string, tokenAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.claimRewards(tokenAddress);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      console.error("Blockchain claim error:", error);
      throw new Error(`Claim failed: ${error.message}`);
    }
  }

  async claimAllRewards(playerAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.claimAllRewards();
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      console.error("Blockchain claim all error:", error);
      throw new Error(`Claim all failed: ${error.message}`);
    }
  }

  async getPlayerStats(playerAddress: string): Promise<{
    totalSpins: number;
    totalWins: number;
    lastSpinDate: number;
    dailySpins: number;
    spinsRemaining: number;
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [totalSpins, totalWins, lastSpinDate, dailySpins, spinsRemaining] = 
        await this.contract.getPlayerStats(playerAddress);

      return {
        totalSpins: Number(totalSpins),
        totalWins: Number(totalWins),
        lastSpinDate: Number(lastSpinDate),
        dailySpins: Number(dailySpins),
        spinsRemaining: Number(spinsRemaining)
      };
    } catch (error: any) {
      console.error("Get player stats error:", error);
      throw new Error(`Failed to get player stats: ${error.message}`);
    }
  }

  async getPendingRewards(playerAddress: string): Promise<{
    aidogeRewards: string;
    boopRewards: string;
    bobotrumRewards: string;
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [aidogeRewards, boopRewards, bobotrumRewards] = 
        await this.contract.getPendingRewards(playerAddress);

      return {
        aidogeRewards: aidogeRewards.toString(),
        boopRewards: boopRewards.toString(),
        bobotrumRewards: bobotrumRewards.toString()
      };
    } catch (error: any) {
      console.error("Get pending rewards error:", error);
      throw new Error(`Failed to get pending rewards: ${error.message}`);
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        this.provider
      );
      
      const balance = await tokenContract.balanceOf(userAddress);
      return balance.toString();
    } catch (error: any) {
      console.error("Get token balance error:", error);
      return "0";
    }
  }
}

export const blockchainService = new BlockchainService();