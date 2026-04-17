import {BrowserProvider, Contract, JsonRpcProvider, Wallet} from "ethers";

type LiveConfig = {
  contractAddress: string;
  privateKey: string;
  expectedChainId: number;
  rpcPath: string;
  userIndex?: number;
  fhevmInstance: {
    aclContractAddress: string;
    kmsContractAddress: string;
    inputVerifierContractAddress: string;
    verifyingContractAddressDecryption: string;
    verifyingContractAddressInputVerification: string;
    gatewayChainId: number;
    relayerUrl: string;
    chainId: number;
  };
};

type ScenarioResult = {
  id: string;
  passed: boolean;
  detail: string;
};

type ResetLiveVoteResponse = {
  contractAddress: string;
  adminAddress: string;
  eligibleVoter: string;
  startTime: number;
  endTime: number;
};

type RequestArguments = {
  method: string;
  params?: unknown[];
};

class LocalWalletEip1193Provider {
  private readonly rpc: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly chainId: bigint;
  private nextNonce?: number;

  constructor(rpcUrl: string, privateKey: string, chainId: bigint) {
    this.chainId = chainId;
    this.rpc = new JsonRpcProvider(rpcUrl, chainId, {staticNetwork: true});
    this.wallet = new Wallet(privateKey, this.rpc);
  }

  async request({method, params = []}: RequestArguments): Promise<unknown> {
    switch (method) {
      case "eth_chainId":
        return `0x${this.chainId.toString(16)}`;
      case "net_version":
        return this.chainId.toString();
      case "eth_accounts":
      case "eth_requestAccounts":
        return [this.wallet.address];
      case "eth_signTypedData_v4": {
        const [, rawTypedData] = params as [string, string | Record<string, unknown>];
        const typedData =
          typeof rawTypedData === "string"
            ? (JSON.parse(rawTypedData) as {
                domain: Record<string, unknown>;
                types: Record<string, Array<{name: string; type: string}>>;
                message: Record<string, unknown>;
              })
            : (rawTypedData as {
                domain: Record<string, unknown>;
                types: Record<string, Array<{name: string; type: string}>>;
                message: Record<string, unknown>;
              });

        const types = Object.fromEntries(
          Object.entries(typedData.types).filter(([key]) => key !== "EIP712Domain"),
        );

        return this.wallet.signTypedData(typedData.domain, types, typedData.message);
      }
      case "eth_sendTransaction": {
        const [tx] = params as [Record<string, unknown>];
        if (this.nextNonce === undefined) {
          this.nextNonce = await this.rpc.getTransactionCount(this.wallet.address, "pending");
        }
        const nonce = this.nextNonce;
        const response = await this.wallet.sendTransaction({
          ...tx,
          from: undefined,
          nonce,
          gasLimit: (tx.gasLimit ?? tx.gas) as string | bigint | undefined,
        });
        this.nextNonce += 1;
        return response.hash;
      }
      default:
        return this.rpc.send(method, params);
    }
  }

  on(): this {
    return this;
  }

  removeListener(): this {
    return this;
  }

  async sendRpc(method: string, params: unknown[] = []): Promise<unknown> {
    return this.rpc.send(method, params);
  }
}

const abi = [
  "function submitVote(bytes32 encryptedVote, bytes inputProof)",
  "function finalizeResult()",
  "function finalized() view returns (bool)",
  "function getEncryptedYesVotes() view returns (bytes32)",
  "function getEncryptedTotalVotes() view returns (bytes32)",
  "function canAdminDecryptTallies() view returns (bool)",
] as const;

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function assertAllowedContract(
  allowedContractAddresses: readonly string[],
  contractAddress: string,
): void {
  const allowed = allowedContractAddresses.map(normalizeAddress);
  if (!allowed.includes(normalizeAddress(contractAddress))) {
    throw new Error("Blocked contract address: not in the application allowlist");
  }
}

async function assertExpectedChain(
  provider: BrowserProvider,
  expectedChainId: bigint,
): Promise<void> {
  const network = await provider.getNetwork();
  if (network.chainId !== expectedChainId) {
    throw new Error(
      `Unexpected chain ID: expected ${expectedChainId.toString()}, got ${network.chainId.toString()}`,
    );
  }
}

async function postJson<TResponse>(path: string, payload: object): Promise<TResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as TResponse & {error?: string};
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return body;
}

const resultsNode = document.querySelector<HTMLUListElement>("#results");
const runButton = document.querySelector<HTMLButtonElement>("#run-live");

function renderResults(results: ScenarioResult[]): void {
  if (!resultsNode) return;

  resultsNode.innerHTML = results
    .map(
      (result) => `
        <li class="${result.passed ? "pass" : "fail"}" data-testid="${result.id}">
          <strong>${result.id}</strong>
          <div>${result.passed ? "PASS" : "FAIL"}: <code>${result.detail}</code></div>
        </li>
      `,
    )
    .join("");
}

async function loadConfig(): Promise<LiveConfig> {
  const response = await fetch("/live-config.json");
  if (!response.ok) {
    throw new Error(`Unable to load live config: ${response.status}`);
  }

  return (await response.json()) as LiveConfig;
}

async function runLiveFlow(): Promise<void> {
  const results: ScenarioResult[] = [];

  try {
    const config = await loadConfig();
    const eip1193 = new LocalWalletEip1193Provider(
      `${window.location.origin}${config.rpcPath}`,
      config.privateKey,
      BigInt(config.expectedChainId),
    );
    const provider = new BrowserProvider(eip1193);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const expectedChainId = BigInt(config.expectedChainId);
    await assertExpectedChain(provider, expectedChainId);
    const deployment = await postJson<ResetLiveVoteResponse>("/api/reset-live-vote", {
      adminAddress: signerAddress,
      eligibleVoter: signerAddress,
    });
    const contractAddress = deployment.contractAddress;
    assertAllowedContract([contractAddress], contractAddress);
    const contract = new Contract(contractAddress, abi, signer);

    const encryptedVote = await postJson<{
      handle: string;
      inputProofHex: string;
      vote: boolean;
    }>("/api/encrypt-vote", {
      contractAddress,
      userAddress: signerAddress,
      vote: true,
    });

    const submitTx = await contract.submitVote(encryptedVote.handle, encryptedVote.inputProofHex);
    const submitReceipt = await submitTx.wait();

    results.push({
      id: "live-submit",
      passed: Boolean(submitReceipt?.hash),
      detail: JSON.stringify({
        txHash: submitReceipt?.hash ?? null,
        contractAddress,
        startTime: deployment.startTime,
        endTime: deployment.endTime,
      }),
    });

    await eip1193.sendRpc("evm_setNextBlockTimestamp", [deployment.endTime + 1]);
    await eip1193.sendRpc("evm_mine");

    const finalizeTx = await contract.finalizeResult();
    await finalizeTx.wait();

    const finalized = await contract.finalized();
    results.push({
      id: "live-finalize",
      passed: finalized === true,
      detail: `finalized=${String(finalized)}`,
    });

    const decrypted = await postJson<{
      getter: string;
      signer: string;
      encryptedHandle: string;
      clearValue: number;
    }>("/api/decrypt-tally", {
      contractAddress,
      handleGetter: "getEncryptedYesVotes",
      userIndex: config.userIndex ?? 0,
    });

    results.push({
      id: "live-decrypt",
      passed: typeof decrypted.clearValue === "number",
      detail: JSON.stringify(decrypted),
    });
  } catch (error) {
    results.push({
      id: "live-flow",
      passed: false,
      detail: error instanceof Error ? error.message : "unknown error",
    });
  }

  renderResults(results);
}

runButton?.addEventListener("click", () => {
  void runLiveFlow();
});

void runLiveFlow();
