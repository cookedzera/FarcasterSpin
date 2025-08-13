import { ethers } from "ethers";

// Your original addresses (lowercase)
const addresses = [
  "0x06d8c3f0e1cfb7e9d3f5b51d17dcd623acc1b3b7", // IARB
  "0x1842887de1c7fdd59e3948a93cd41aad48a19cb2", // JUICE
  "0x0ba7a82d415500bebfa254502b655732cd678d07"  // ABET
];

console.log("🔍 Verifying correct checksums for your token addresses:\n");

addresses.forEach((addr, index) => {
  const tokenNames = ["IARB (IntArbTestToken)", "JUICE (TestJuicy)", "ABET (ArbBETestt)"];
  const checksummed = ethers.getAddress(addr);
  
  console.log(`${index + 1}. ${tokenNames[index]}`);
  console.log(`   Original: ${addr}`);
  console.log(`   Correct:  ${checksummed}`);
  console.log("");
});

console.log("✅ Use these correct checksummed addresses in your Solidity contract!");