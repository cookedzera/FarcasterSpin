// New game logic with server-side randomness and probability control
export interface SpinResult {
  segment: string;
  isWin: boolean;
  tokenType: string;
  tokenAddress: string;
  rewardAmount: string;
  randomSeed: string;
}

// Token configurations matching the contract
export const TOKEN_CONFIG = {
  AIDOGE: {
    address: "0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4",
    symbol: "AIDOGE", 
    rewardAmount: "1000000000000000000" // 1 token
  },
  BOOP: {
    address: "0x0E1CD6557D2BA59C61c75850E674C2AD73253952",
    symbol: "BOOP",
    rewardAmount: "2000000000000000000" // 2 tokens
  },
  BOBOTRUM: {
    address: "0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19", 
    symbol: "BOBOTRUM",
    rewardAmount: "500000000000000000" // 0.5 tokens
  }
} as const;

// Wheel segments with probabilities
const WHEEL_SEGMENTS = [
  { name: 'AIDOGE', weight: 15 }, // 15%
  { name: 'BUST', weight: 25 },   // 25%
  { name: 'BOOP', weight: 12 },   // 12%
  { name: 'BONUS', weight: 8 },   // 8% (2x BOOP)
  { name: 'BOBOTRUM', weight: 15 }, // 15%
  { name: 'BUST', weight: 20 },   // 20%
  { name: 'AIDOGE', weight: 3 },  // 3%
  { name: 'JACKPOT', weight: 2 }, // 2% (10x AIDOGE)
];

// Calculate winning probabilities based on user's daily spin count
export function calculateWinProbabilities(spinsUsedToday: number): {
  winAll3: number;
  win2: number;
  win1: number;
  winNone: number;
} {
  // Base probabilities for individual wins
  const baseWinRate = 0.35; // 35% base win rate per spin
  
  // Adjust based on spins used (slightly favor users who haven't won yet)
  const adjustedWinRate = spinsUsedToday === 0 ? baseWinRate * 1.1 : 
                         spinsUsedToday === 1 ? baseWinRate : 
                         baseWinRate * 0.9;

  // Calculate compound probabilities for 3 spins
  const winAll3 = Math.pow(adjustedWinRate, 3); // ~4.3%
  const win2 = 3 * Math.pow(adjustedWinRate, 2) * (1 - adjustedWinRate); // ~24%
  const win1 = 3 * adjustedWinRate * Math.pow(1 - adjustedWinRate, 2); // ~41%
  const winNone = Math.pow(1 - adjustedWinRate, 3); // ~27%

  return { winAll3, win2, win1, winNone };
}

// Generate weighted random segment
function getRandomSegment(): string {
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, segment) => sum + segment.weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const segment of WHEEL_SEGMENTS) {
    currentWeight += segment.weight;
    if (random <= currentWeight) {
      return segment.name;
    }
  }
  
  return 'BUST'; // Fallback
}

// Process a single spin
export function performSpin(): SpinResult {
  const segment = getRandomSegment();
  const randomSeed = Math.random().toString() + Date.now().toString();
  
  let isWin = false;
  let tokenType = "";
  let tokenAddress = "";
  let rewardAmount = "0";
  
  switch (segment) {
    case 'AIDOGE':
      isWin = true;
      tokenType = "AIDOGE";
      tokenAddress = TOKEN_CONFIG.AIDOGE.address;
      rewardAmount = TOKEN_CONFIG.AIDOGE.rewardAmount;
      break;
      
    case 'BOOP':
      isWin = true;
      tokenType = "BOOP";
      tokenAddress = TOKEN_CONFIG.BOOP.address;
      rewardAmount = TOKEN_CONFIG.BOOP.rewardAmount;
      break;
      
    case 'BOBOTRUM':
      isWin = true;
      tokenType = "BOBOTRUM";
      tokenAddress = TOKEN_CONFIG.BOBOTRUM.address;
      rewardAmount = TOKEN_CONFIG.BOBOTRUM.rewardAmount;
      break;
      
    case 'BONUS':
      isWin = true;
      tokenType = "BOOP";
      tokenAddress = TOKEN_CONFIG.BOOP.address;
      rewardAmount = "4000000000000000000"; // 2x BOOP = 4 tokens
      break;
      
    case 'JACKPOT':
      isWin = true;
      tokenType = "AIDOGE";
      tokenAddress = TOKEN_CONFIG.AIDOGE.address;
      rewardAmount = "10000000000000000000"; // 10x AIDOGE = 10 tokens
      break;
      
    default: // BUST
      isWin = false;
      tokenType = "BUST";
      tokenAddress = "0x0000000000000000000000000000000000000000";
      rewardAmount = "0";
  }
  
  return {
    segment,
    isWin,
    tokenType,
    tokenAddress,
    rewardAmount,
    randomSeed
  };
}

// Process daily spins with probability adjustments
export function performDailySpins(userId: string, userSpinsUsed: number): SpinResult[] {
  const spinsRemaining = Math.max(0, 3 - userSpinsUsed);
  
  if (spinsRemaining === 0) {
    throw new Error("Daily spin limit reached");
  }
  
  const results: SpinResult[] = [];
  
  for (let i = 0; i < spinsRemaining; i++) {
    const result = performSpin();
    results.push(result);
  }
  
  return results;
}