const hre = require("hardhat");

async function main() {
  // Define constructor parameters
  const pointPrice = hre.ethers.parseEther("0.001"); // 0.001 ETH per point
  const minimumRewardPoints = 100; // Minimum points needed for reward
  const minimumAgentPoints = 1000; // Minimum points agents need to purchase

  // Deploy the contract
  const EcoConnect = await hre.ethers.getContractFactory("EcoConnect");
  const ecoConnect = await EcoConnect.deploy(
    pointPrice,
    minimumRewardPoints,
    minimumAgentPoints
  );

  await ecoConnect.waitForDeployment();

  console.log("EcoConnect deployed to:", await ecoConnect.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});