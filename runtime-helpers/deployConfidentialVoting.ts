import hre from "hardhat";

async function main() {
  const adminAddress = process.env.ADMIN_ADDRESS;
  const eligibleVoter = process.env.ELIGIBLE_VOTER ?? adminAddress;

  if (!adminAddress || !eligibleVoter) {
    throw new Error("Missing ADMIN_ADDRESS or ELIGIBLE_VOTER");
  }

  const {ethers} = hre;
  const latestBlock = await ethers.provider.getBlock("latest");
  const now = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);
  // Keep the live demo resilient to browser delays and local process jitter.
  const startTime = now - 300;
  const endTime = now + 1800;

  const factory = await ethers.getContractFactory("ConfidentialVotingTemplate");
  const contract = await factory.deploy(adminAddress, startTime, endTime, [eligibleVoter]);
  await contract.waitForDeployment();

  console.log(
    JSON.stringify(
      {
        contractAddress: await contract.getAddress(),
        adminAddress,
        eligibleVoter,
        startTime,
        endTime,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
