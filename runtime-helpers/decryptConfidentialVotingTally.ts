import {FhevmType} from "@fhevm/hardhat-plugin";
import hre from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const getter = process.env.HANDLE_GETTER ?? "getEncryptedYesVotes";
  const userIndex = Number(process.env.USER_INDEX ?? "0");

  if (!contractAddress) {
    throw new Error("Missing CONTRACT_ADDRESS");
  }

  if (!["getEncryptedYesVotes", "getEncryptedTotalVotes"].includes(getter)) {
    throw new Error(`Unsupported HANDLE_GETTER: ${getter}`);
  }

  const {ethers, fhevm} = hre;
  await fhevm.initializeCLIApi();

  const signers = await ethers.getSigners();
  const signer = signers[userIndex];
  if (!signer) {
    throw new Error(`Missing signer at USER_INDEX=${userIndex}`);
  }

  const contract = await ethers.getContractAt("ConfidentialVotingTemplate", contractAddress);
  const encryptedHandle = await contract[getter]();
  const clearValue = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    encryptedHandle,
    contractAddress,
    signer,
  );

  console.log(
    JSON.stringify(
      {
        getter,
        signer: signer.address,
        encryptedHandle,
        clearValue: Number(clearValue),
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
