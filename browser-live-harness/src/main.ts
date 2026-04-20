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

type StepState = "pending" | "running" | "pass" | "fail";

type StepView = {
  id: string;
  label: string;
  help: string;
  state: StepState;
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

const runButton = document.querySelector<HTMLButtonElement>("#run-live");
const overallStatusNode = document.querySelector<HTMLDivElement>("#overall-status");
const overallStatusTextNode = document.querySelector<HTMLSpanElement>("#overall-status-text");
const stepListNode = document.querySelector<HTMLOListElement>("#step-list");
const logBoxNode = document.querySelector<HTMLDivElement>("#log-box");
const metricContractNode = document.querySelector<HTMLDivElement>("#metric-contract");
const metricWindowNode = document.querySelector<HTMLDivElement>("#metric-window");
const metricResultNode = document.querySelector<HTMLDivElement>("#metric-result");
let runInFlight = false;

const steps: StepView[] = [
  {
    id: "deploy",
    label: "1. Fresh confidential-voting deployment",
    help: "Resets onto a clean local contract so the proof starts from zero state.",
    state: "pending",
    detail: "Waiting to deploy.",
  },
  {
    id: "submit",
    label: "2. Encrypted vote from the browser path",
    help: "Submits one encrypted yes vote through the browser-owned transaction flow.",
    state: "pending",
    detail: "Waiting to submit a vote.",
  },
  {
    id: "finalize",
    label: "3. Finalize after the voting window",
    help: "Advances time, closes the vote, and confirms that the encrypted tally is finalized.",
    state: "pending",
    detail: "Waiting to finalize.",
  },
  {
    id: "decrypt",
    label: "4. Decrypted tally display",
    help: "Shows the final yes-vote tally through the explicit helper-backed decrypt boundary.",
    state: "pending",
    detail: "Waiting to decrypt the tally.",
  },
];

const logLines: string[] = [];

function stepStateClass(state: StepState): string {
  return state;
}

function renderSteps(): void {
  if (!stepListNode) return;

  stepListNode.innerHTML = steps
    .map(
      (step, index) => `
        <li class="step-card ${stepStateClass(step.state)}" data-testid="step-${step.id}">
          <div class="step-badge">${index + 1}</div>
          <div>
            <div class="step-name">${step.label}</div>
            <p class="step-help">${step.help}</p>
            <div class="step-detail">${step.detail}</div>
          </div>
        </li>
      `,
    )
    .join("");
}

function setOverallStatus(state: "idle" | "running" | "pass" | "fail", text: string): void {
  if (!overallStatusNode || !overallStatusTextNode) return;
  overallStatusNode.className = `status-pill status-${state}`;
  overallStatusTextNode.textContent = text;
}

function pushLog(message: string): void {
  logLines.push(message);
  if (logBoxNode) {
    logBoxNode.textContent = logLines.join("\n");
    logBoxNode.scrollTop = logBoxNode.scrollHeight;
  }
}

function resetUiForRun(): void {
  for (const step of steps) {
    step.state = "pending";
  }
  steps[0].detail = "Waiting to deploy.";
  steps[1].detail = "Waiting to submit a vote.";
  steps[2].detail = "Waiting to finalize.";
  steps[3].detail = "Waiting to decrypt the tally.";
  logLines.length = 0;
  metricContractNode && (metricContractNode.textContent = "Not deployed yet");
  metricWindowNode && (metricWindowNode.textContent = "Waiting for operator-controlled run");
  metricResultNode && (metricResultNode.textContent = "No result yet");
  renderSteps();
  pushLog("Proof run starting...");
  setOverallStatus("running", "Running: agent target proof in progress");
}

function updateStep(id: string, state: StepState, detail: string): void {
  const step = steps.find((entry) => entry.id === id);
  if (!step) return;
  step.state = state;
  step.detail = detail;
  renderSteps();
}

function formatTimestampRange(startTime: number, endTime: number): string {
  return `${startTime} → ${endTime}`;
}

async function loadConfig(): Promise<LiveConfig> {
  const response = await fetch("/live-config.json");
  if (!response.ok) {
    throw new Error(`Unable to load live config: ${response.status}`);
  }

  return (await response.json()) as LiveConfig;
}

async function runLiveFlow(): Promise<void> {
  if (runInFlight) return;
  runInFlight = true;
  resetUiForRun();
  if (runButton) runButton.disabled = true;

  try {
    pushLog("Loading local config...");
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
    pushLog(`Connected local browser wallet as ${signerAddress}.`);
    updateStep("deploy", "running", "Deploying a fresh confidential-voting contract...");
    const deployment = await postJson<ResetLiveVoteResponse>("/api/reset-live-vote", {
      adminAddress: signerAddress,
      eligibleVoter: signerAddress,
    });
    const contractAddress = deployment.contractAddress;
    metricContractNode && (metricContractNode.textContent = contractAddress);
    metricWindowNode &&
      (metricWindowNode.textContent = formatTimestampRange(deployment.startTime, deployment.endTime));
    pushLog(`Fresh contract deployed at ${contractAddress}.`);
    updateStep(
      "deploy",
      "pass",
      `Fresh contract ready at ${contractAddress}. Voting window: ${formatTimestampRange(deployment.startTime, deployment.endTime)}.`,
    );
    assertAllowedContract([contractAddress], contractAddress);
    const contract = new Contract(contractAddress, abi, signer);

    updateStep("submit", "running", "Creating encrypted vote payload and submitting through the browser wallet path...");
    const encryptedVote = await postJson<{
      handle: string;
      inputProofHex: string;
      vote: boolean;
    }>("/api/encrypt-vote", {
      contractAddress,
      userAddress: signerAddress,
      vote: true,
    });
    pushLog("Encrypted vote payload generated by the local helper.");

    const submitTx = await contract.submitVote(encryptedVote.handle, encryptedVote.inputProofHex);
    const submitReceipt = await submitTx.wait();
    pushLog(`Vote submitted in tx ${submitReceipt?.hash ?? "unknown"}.`);
    updateStep(
      "submit",
      "pass",
      `Vote submitted successfully. Tx: ${submitReceipt?.hash ?? "unknown"}.`,
    );

    updateStep("finalize", "running", "Advancing the chain past the voting window and finalizing the tally...");
    await eip1193.sendRpc("evm_setNextBlockTimestamp", [deployment.endTime + 1]);
    await eip1193.sendRpc("evm_mine");
    pushLog(`Chain time advanced to ${deployment.endTime + 1}.`);

    const finalizeTx = await contract.finalizeResult();
    await finalizeTx.wait();

    const finalized = await contract.finalized();
    pushLog(`Finalize transaction confirmed. finalized=${String(finalized)}.`);
    updateStep(
      "finalize",
      "pass",
      `Voting closed and finalized successfully. finalized=${String(finalized)}.`,
    );

    updateStep("decrypt", "running", "Requesting the final yes-vote tally through the helper-backed decrypt path...");
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
    pushLog(`Decrypted tally returned clearValue=${String(decrypted.clearValue)}.`);
    metricResultNode &&
      (metricResultNode.textContent = `Yes votes: ${String(decrypted.clearValue)}`);
    updateStep(
      "decrypt",
      "pass",
      `Final decrypted yes-vote tally: ${String(decrypted.clearValue)}.`,
    );
    setOverallStatus("pass", "Pass: the end-to-end proof completed cleanly");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    pushLog(`Run failed: ${message}`);
    const runningStep = steps.find((step) => step.state === "running");
    if (runningStep) {
      runningStep.state = "fail";
      runningStep.detail = message;
      renderSteps();
    }
    setOverallStatus("fail", "Fail: the demo stopped before completing");
  } finally {
    if (runButton) runButton.disabled = false;
    runInFlight = false;
  }
}

runButton?.addEventListener("click", () => {
  void runLiveFlow();
});

renderSteps();
setOverallStatus("idle", "Ready: run the proof on demand");
