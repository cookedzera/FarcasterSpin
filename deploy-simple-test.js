const { ethers } = require('hardhat');

async function main() {
  console.log("Deploying SimpleSpinTest contract...");

  const SimpleSpinTest = await ethers.getContractFactory("SimpleSpinTest");
  const simpleSpinTest = await SimpleSpinTest.deploy();

  await simpleSpinTest.waitForDeployment();

  const contractAddress = await simpleSpinTest.getAddress();
  console.log("SimpleSpinTest deployed to:", contractAddress);

  // Wait for a few confirmations
  await simpleSpinTest.deploymentTransaction().wait(3);

  // Test the contract
  console.log("Testing spin function...");
  const tx = await simpleSpinTest.spin();
  await tx.wait();
  
  const totalSpins = await simpleSpinTest.totalSpins();
  console.log("Total spins after test:", totalSpins.toString());

  console.log("Contract deployed and tested successfully!");
  console.log("Contract address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });