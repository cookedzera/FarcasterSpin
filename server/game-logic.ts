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
  TOKEN1: {
    address: "",
    symbol: "TOKEN1", 
    rewardAmount: "1000000000000000000" // 1 token
  },
  TOKEN2: {
    address: "",
    symbol: "TOKEN2",
    rewardAmount: "2000000000000000000" // 2 tokens
  },
  TOKEN3: {
    address: "",
    symbol: "TOKEN3",
    rewardAmount: "500000000000000000" // 0.5 tokens
  }
} as const;

// Wheel segments with balanced probabilities for fair gameplay
const WHEEL_SEGMENTS = [
  { name: 'IARB', weight: 18 }, // 18% - Primary token
  { name: 'BUST', weight: 20 },   // 20% - Balanced losing chance
  { name: 'JUICE', weight: 17 },   // 17% - Secondary token
  { name: 'BONUS', weight: 10 },   // 10% - 2x multiplier for JUICE
  { name: 'ABET', weight: 18 }, // 18% - Third token
  { name: 'BUST', weight: 12 },   // 12% - Second bust segment
  { name: 'IARB', weight: 3 },  // 3% - Bonus IARB
  { name: 'JACKPOT', weight: 2 }, // 2% - 10x multiplier for IARB
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

// Generate truly random weighted segment with enhanced randomness
function getRandomSegment(): string {
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, segment) => sum + segment.weight, 0);
  
  // Use multiple sources of randomness for better entropy
  const baseRandom = Math.random();
  const timeComponent = (Date.now() % 10000) / 10000;
  const microsecondComponent = (performance.now() % 1000) / 1000;
  
  // Combine randomness sources and normalize
  const combinedRandom = (baseRandom + timeComponent + microsecondComponent) % 1;
  const random = combinedRandom * totalWeight;
  
  console.log(`🎲 Random generation: base=${baseRandom.toFixed(4)}, time=${timeComponent.toFixed(4)}, micro=${microsecondComponent.toFixed(4)}, combined=${combinedRandom.toFixed(4)}, weighted=${random.toFixed(2)}/${totalWeight}`);
  
  let currentWeight = 0;
  for (const segment of WHEEL_SEGMENTS) {
    currentWeight += segment.weight;
    if (random <= currentWeight) {
      console.log(`🎯 Selected segment: ${segment.name} (weight: ${segment.weight}, range: ${currentWeight - segment.weight}-${currentWeight})`);
      return segment.name;
    }
  }
  
  console.log('⚠️ Fallback to BUST triggered');
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
    case 'IARB':
      isWin = true;
      tokenType = "TOKEN1";
      tokenAddress = TOKEN_CONFIG.TOKEN1.address || "";
      rewardAmount = TOKEN_CONFIG.TOKEN1.rewardAmount;
      break;
      
    case 'JUICE':
      isWin = true;
      tokenType = "TOKEN2";
      tokenAddress = TOKEN_CONFIG.TOKEN2.address || "";
      rewardAmount = TOKEN_CONFIG.TOKEN2.rewardAmount;
      break;
      
    case 'ABET':
      isWin = true;
      tokenType = "TOKEN3";
      tokenAddress = TOKEN_CONFIG.TOKEN3.address || "";
      rewardAmount = TOKEN_CONFIG.TOKEN3.rewardAmount;
      break;
      
    case 'BONUS':
      isWin = true;
      tokenType = "TOKEN2";
      tokenAddress = TOKEN_CONFIG.TOKEN2.address || "";
      rewardAmount = "4000000000000000000"; // 2x TOKEN2 = 4 tokens
      break;
      
    case 'JACKPOT':
      isWin = true;
      tokenType = "TOKEN1";
      tokenAddress = TOKEN_CONFIG.TOKEN1.address || "";
      rewardAmount = "10000000000000000000"; // 10x TOKEN1 = 10 tokens
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