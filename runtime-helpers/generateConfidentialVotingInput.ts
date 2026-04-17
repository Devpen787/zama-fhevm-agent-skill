import hre from "hardhat";

function bytesLikeToHex(value: unknown): string {
  if (typeof value === "string") {
    return value.startsWith("0x") ? value : `0x${value}`;
  }

  if (value instanceof Uint8Array) {
    return `0x${Buffer.from(value).toString("hex")}`;
  }

  if (Array.isArray(value)) {
    return `0x${Buffer.from(value).toString("hex")}`;
  }

  if (typeof value === "object" && value !== null) {
    const ordered = Object.entries(value as Record<string, number>)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([, byte]) => byte);
    return `0x${Buffer.from(ordered).toString("hex")}`;
  }

  throw new Error("Unsupported bytes-like value");
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const userAddress = process.env.USER_ADDRESS;
  const vote = (process.env.VOTE ?? "true").toLowerCase() === "true";

  if (!contractAddress || !userAddress) {
    throw new Error("Missing CONTRACT_ADDRESS or USER_ADDRESS");
  }

  await hre.fhevm.initializeCLIApi();

  const encryptedInput = await hre.fhevm
    .createEncryptedInput(contractAddress, userAddress)
    .addBool(vote)
    .encrypt();

  console.log(
    JSON.stringify(
      {
        handle: bytesLikeToHex(encryptedInput.handles[0]),
        inputProofHex: bytesLikeToHex(encryptedInput.inputProof),
        vote,
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
