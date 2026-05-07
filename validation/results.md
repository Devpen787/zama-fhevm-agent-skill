# Validation Results

Purpose:

- summarize the retained proof set for this submission
- point reviewers to the narrow validated path rather than the full iteration history

## Final Status

- `skill packaging`: pass
- `strong-lane codex generation`: pass
- `contract and test path`: pass
- `live browser replay`: pass

## Retained Evidence

### 1. Core contract/test validation

Artifact:

- `validation/run3_core_demo_output.md`

What it proves:

- the confidential-voting contract template compiles in the official `zama-ai/fhevm-hardhat-template`
- the test path is grounded in the documented `externalE... + inputProof + FHE.fromExternal(...)` flow
- the validated reveal model is actor-specific decryption after finalization

### 2. Live browser replay

Artifact:

- `validation/run8_live_browser_hybrid_output.md`

What it proves:

- a real browser session can drive the validated wallet-connected flow
- a fresh contract is deployed for each replay
- the browser can submit an encrypted vote, finalize the contract, and render the decrypted result

### 3. Strong-lane Codex evaluation

Artifact:

- `validation/run9_codex_strong_lane_output.md`

What it proves:

- in a strong generation lane, the skill materially changes model behavior
- `with_skill` code generation passed `3/3`
- `without_skill` code generation passed `1/2`
- the failing baseline run drifted to a different public-reveal architecture and dropped validated guardrails

### 4. Replay artifacts

Artifacts:

- `output/playwright/run14-live-browser-hybrid-pass.png`
- `output/playwright/run14-live-browser-hybrid-pass.json`

What they prove:

- the replay surface completed successfully
- the browser-visible end state is a clean pass

## Current Validation Gate

The repository is treated as validated only if all of the following hold:

1. the skill remains aligned with the Zama/FHEVM path in `SKILL.md`
2. strong-lane code generation still holds on the validated target
3. the contract/test path still passes in the Hardhat template
4. the live browser replay still completes end to end

## Current Proof Boundary

This repository does **not** claim:

- Sepolia deployment proof
- a public relayer-backed browser run
- generalized correctness for every confidential-finance use case

This repository **does** claim:

- a narrow, reviewable, replayable Zama/FHEVM skill path for one confidential application target
- stronger repeatability in a strong generation lane when the skill is applied
- compile-backed and test-backed validation for the core contract/test target
- a live browser replay for the validated local path
