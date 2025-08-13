import { ethers } from "ethers";

// Arbitrum Sepolia testnet configuration
const ARBITRUM_RPC = "https://sepolia-rollup.arbitrum.io/rpc";
const WHEEL_GAME_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS || ""; // Contract address from environment

// Contract ABI for the WheelGameTestnet contract
const WHEEL_GAME_ABI = [
  "function spin() external",
  "function claimRewards(address tokenAddress) external", 
  "function getPlayerStats(address playerAddress) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getPendingRewards(address playerAddress) external view returns (uint256, uint256, uint256)",
  "function getWheelSegments() external view returns (string[] memory)",
  "event SpinResult(address indexed player, string segment, bool isWin, address tokenAddress, uint256 rewardAmount, uint256 randomSeed)",
  "event RewardsClaimed(address indexed player, address indexed token, uint256 amount)"
];

// Token addresses on Arbitrum Sepolia testnet
export const TOKEN_ADDRESSES = {
  IARB: "0x06d8c3f0e1cfb7e9d3f5B51D17DcD623AcC1B3b7",  // IntArbTestToken
  JUICE: "0x1842887De1C7fDD59e3948A93CD41aad48a19cB2", // TestJuicy
  ABET: "0x0BA7A82d415500BebFA254502B655732Cd678D07"  // ArbBETestt
} as const;

export class BlockchainService {
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

  async executeSpin(playerAddress: string): Promise<{
    txHash: string;
    isWin: boolean;
    tokenAddress: string;
    rewardAmount: string;
    segment: string;
  }> {
    if (!this.contract || !this.wallet) {
      throw new Error("Contract not initialized");
    }

    try {
      // Execute spin transaction (no parameters needed)
      const tx = await this.contract.spin();
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
        if (parsed && parsed.args) {
          return {
            txHash: receipt.hash,
            isWin: parsed.args.isWin,
            tokenAddress: parsed.args.tokenAddress,
            rewardAmount: parsed.args.rewardAmount.toString(),
            segment: parsed.args.segment
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

  async performSpin(userAddress: string): Promise<{
    symbols: string[];
    isWin: boolean;
    rewardAmount: string;
    tokenType: string;
    tokenAddress?: string;
    transactionHash?: string;
  }> {
    if (!this.contract || !this.wallet) {
      throw new Error("Contract not initialized - check WALLET_PRIVATE_KEY and DEPLOYED_CONTRACT_ADDRESS");
    }

    try {
      console.log(`🎰 Executing contract spin for ${userAddress}`);
      const tx = await this.contract.spin();
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
        if (parsed && parsed.args) {
          const tokenAddress = parsed.args.tokenAddress;
          const segment = parsed.args.segment;
          const isWin = parsed.args.isWin;
          const rewardAmount = parsed.args.rewardAmount.toString();

          // Map token address to type
          let tokenType = "";
          if (tokenAddress === TOKEN_ADDRESSES.IARB) tokenType = "TOKEN1";
          else if (tokenAddress === TOKEN_ADDRESSES.JUICE) tokenType = "TOKEN2";
          else if (tokenAddress === TOKEN_ADDRESSES.ABET) tokenType = "TOKEN3";

          return {
            symbols: [tokenAddress, tokenAddress, tokenAddress], // Simulate 3 matching symbols for win
            isWin,
            rewardAmount,
            tokenType,
            tokenAddress,
            transactionHash: receipt.hash
          };
        }
      }

      // Default response if no event found
      return {
        symbols: ["", "", ""],
        isWin: false,
        rewardAmount: "0",
        tokenType: "",
        transactionHash: receipt.hash
      };

    } catch (error: any) {
      console.error("Contract spin error:", error);
      throw new Error(`Spin failed: ${error.message}`);
    }
  }

  async claimRewards(
    userAddress: string,
    token1Amount: string,
    token2Amount: string,
    token3Amount: string
  ): Promise<{ transactionHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error("Contract not initialized - check WALLET_PRIVATE_KEY and DEPLOYED_CONTRACT_ADDRESS");
    }

    try {
      console.log(`🚀 Executing contract claims for ${userAddress}`);
      const txHashes: string[] = [];

      // Claim each token if amount > 0
      if (BigInt(token1Amount) > 0) {
        const tx = await this.contract.claimRewards(TOKEN_ADDRESSES.IARB);
        const receipt = await tx.wait();
        txHashes.push(receipt.hash);
        console.log(`✅ IARB claimed: ${receipt.hash}`);
      }

      if (BigInt(token2Amount) > 0) {
        const tx = await this.contract.claimRewards(TOKEN_ADDRESSES.JUICE);
        const receipt = await tx.wait();
        txHashes.push(receipt.hash);
        console.log(`✅ JUICE claimed: ${receipt.hash}`);
      }

      if (BigInt(token3Amount) > 0) {
        const tx = await this.contract.claimRewards(TOKEN_ADDRESSES.ABET);
        const receipt = await tx.wait();
        txHashes.push(receipt.hash);
        console.log(`✅ ABET claimed: ${receipt.hash}`);
      }

      return {
        transactionHash: txHashes[0] || "0x0" // Return first transaction hash
      };

    } catch (error: any) {
      console.error("Contract claim error:", error);
      throw new Error(`Claim failed: ${error.message}`);
    }
  }

  // Note: claimAllRewards not available in testnet contract, use claimRewards for individual tokens

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
    iarbRewards: string;
    juiceRewards: string;
    abetRewards: string;
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [iarbRewards, juiceRewards, abetRewards] = 
        await this.contract.getPendingRewards(playerAddress);

      return {
        iarbRewards: iarbRewards.toString(),
        juiceRewards: juiceRewards.toString(),
        abetRewards: abetRewards.toString()
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