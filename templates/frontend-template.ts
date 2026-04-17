/*
  Purpose:
  - source-grounded minimal frontend integration path for confidential voting
  - keeps the current relayer-SDK flow explicit

  Notes:
  - package names and network wiring should be aligned with the target app scaffold
  - this is a narrow example, not a full UI layer
*/

import {BrowserProvider, Contract} from "ethers";
import {createInstance, initSDK} from "@zama-fhe/relayer-sdk/web";

type ZamaNetworkName = "local" | "testnet";

type ZamaFhevmInstanceConfig = {
  aclContractAddress: string;
  kmsContractAddress: string;
  inputVerifierContractAddress: string;
  verifyingContractAddressDecryption: string;
  verifyingContractAddressInputVerification: string;
  gatewayChainId: number;
  relayerUrl: string;
  chainId: number;
  network: BrowserProvider | ZamaNetworkName;
};

type ZamaSecurityConfig = {
  expectedChainId: bigint;
  allowedContractAddresses: readonly string[];
  fhevmInstance: ZamaFhevmInstanceConfig;
  onDecryptConfirmation?: (
    request: DecryptConfirmationRequest,
  ) => boolean | Promise<boolean>;
};

type DecryptConfirmationRequest = {
  contractAddress: string;
  ciphertextHandle: string;
  handleSource: string;
  chainId: bigint;
  signerAddress: string;
};

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function normalizeHandle(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "bigint" || typeof value === "number") return value.toString();
  return String(value).toLowerCase();
}

function assertAllowedContract(security: ZamaSecurityConfig, contractAddress: string): void {
  const allowed = security.allowedContractAddresses.map(normalizeAddress);
  if (!allowed.includes(normalizeAddress(contractAddress))) {
    throw new Error("Blocked contract address: not in the application allowlist");
  }
}

async function assertExpectedChain(
  provider: BrowserProvider,
  expectedChainId: bigint,
): Promise<bigint> {
  const network = await provider.getNetwork();
  if (network.chainId !== expectedChainId) {
    throw new Error(
      `Unexpected chain ID: expected ${expectedChainId.toString()}, got ${network.chainId.toString()}`,
    );
  }

  return network.chainId;
}

async function createSecuredInstance(provider: BrowserProvider, security: ZamaSecurityConfig) {
  await assertExpectedChain(provider, security.expectedChainId);

  return createInstance({
    ...security.fhevmInstance,
    network: provider,
  });
}

async function requireDecryptConfirmation(
  security: ZamaSecurityConfig,
  request: DecryptConfirmationRequest,
): Promise<void> {
  if (security.onDecryptConfirmation) {
    const approved = await security.onDecryptConfirmation(request);
    if (!approved) throw new Error("User rejected decrypt request");
    return;
  }

  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    const approved = window.confirm(
      `Decrypt ${request.handleSource} from ${request.contractAddress} on chain ${request.chainId.toString()}?`,
    );
    if (!approved) throw new Error("User rejected decrypt request");
    return;
  }

  throw new Error("Missing decrypt confirmation hook");
}

export type SubmitVoteArgs = {
  contractAddress: string;
  abi: readonly unknown[];
  provider: BrowserProvider;
  vote: boolean;
  security: ZamaSecurityConfig;
};

export async function submitEncryptedVote(
  args: SubmitVoteArgs,
): Promise<{ status: "submitted" | "failed"; txHash?: string; error?: string }> {
  try {
    await initSDK();

    assertAllowedContract(args.security, args.contractAddress);

    const signer = await args.provider.getSigner();
    const userAddress = await signer.getAddress();
    const contract = new Contract(args.contractAddress, args.abi, signer);

    const instance = await createSecuredInstance(args.provider, args.security);

    const encryptedInput = instance
      .createEncryptedInput(args.contractAddress, userAddress)
      .addBool(args.vote)
      .encrypt();

    const tx = await contract.submitVote(encryptedInput.handles[0], encryptedInput.inputProof);
    const receipt = await tx.wait();

    return { status: "submitted", txHash: receipt?.hash };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown submission error",
    };
  }
}

export async function fetchFinalizationState(
  contractAddress: string,
  abi: readonly unknown[],
  provider: BrowserProvider,
): Promise<{ finalized: boolean }> {
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, abi, signer);
  const finalized = await contract.finalized();

  return { finalized };
}

export async function decryptSingleHandleForUser(args: {
  ciphertextHandle: string;
  contractAddress: string;
  abi: readonly unknown[];
  handleGetter: "getEncryptedYesVotes" | "getEncryptedTotalVotes";
  provider: BrowserProvider;
  security: ZamaSecurityConfig;
}): Promise<unknown> {
  await initSDK();

  assertAllowedContract(args.security, args.contractAddress);

  const signer = await args.provider.getSigner();
  const signerAddress = await signer.getAddress();
  const chainId = await assertExpectedChain(args.provider, args.security.expectedChainId);
  const contract = new Contract(args.contractAddress, args.abi, signer);
  const onChainHandle = await contract[args.handleGetter]();

  if (normalizeHandle(onChainHandle) !== normalizeHandle(args.ciphertextHandle)) {
    throw new Error("Blocked decrypt request: ciphertext handle did not come from the expected contract getter");
  }

  await requireDecryptConfirmation(args.security, {
    contractAddress: args.contractAddress,
    ciphertextHandle: normalizeHandle(args.ciphertextHandle),
    handleSource: args.handleGetter,
    chainId,
    signerAddress,
  });

  const instance = await createSecuredInstance(args.provider, args.security);

  const keypair = instance.generateKeypair();
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10";
  const contractAddresses = [args.contractAddress];
  const eip712 = instance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays,
  );

  const signature = await signer.signTypedData(
    eip712.domain,
    {
      UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
    },
    eip712.message,
  );

  const result = await instance.userDecrypt(
    [
      {
        handle: args.ciphertextHandle,
        contractAddress: args.contractAddress,
      },
    ],
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    signerAddress,
    startTimeStamp,
    durationDays,
  );

  return result[args.ciphertextHandle];
}

/*
  Example UI flow:

  1. connect wallet
  2. initialize the relayer SDK
  3. create encrypted input bound to contract + user
  4. submit handle + inputProof
  5. confirm the transaction
  6. after finalization, the admin retrieves the encrypted tally handle
  7. the admin runs the relayer SDK userDecrypt flow with an EIP-712 signature
*/
