# Evaluation Scorecard

Purpose:

- make the submission evidence easy to inspect
- separate measured results from claims
- show where the skill improves agent behavior and where boundaries remain

## Current Scorecard

| Check | Result | Evidence |
| --- | ---: | --- |
| Smoke eval | `7/7 pass` | `scripts/run_smoke_eval.sh` |
| Artifact guard on examples | `pass` | `scripts/run_artifact_guard.sh` |
| Artifact guard on templates | `pass` | `scripts/run_artifact_guard.sh` |
| Strong-lane codegen with skill | `3/3 pass` | `validation/run9_codex_strong_lane_output.md` |
| Strong-lane codegen without skill | `1/2 pass` | `validation/run9_codex_strong_lane_output.md` |
| Official Hardhat template validation | `16 passing` | `validation/run3_core_demo_output.md` |
| Live browser replay | `pass` | `validation/run8_live_browser_hybrid_output.md` |

## What The Metrics Mean

### Smoke eval

The smoke eval checks that the skill still contains the required Zama/FHEVM clauses and that the retained proof artifacts exist.

It does not generate new code.

### Artifact guard

The artifact guard checks generated contract, test, and frontend files for the validated confidential-voting invariants:

- `externalEbool`
- `inputProof`
- `FHE.fromExternal(...)`
- `FHE.allowThis(...)`
- actor-specific reveal with `FHE.allow(...)`
- negative-path tests for proof, signer, contract binding, ACL, and decrypt behavior
- frontend allowlist, chain check, encrypted input, and typed-signature decrypt flow

### Strong-lane comparison

The same confidential-voting prompt was run through a strong Codex generation lane.

With the skill:

- `3/3` generated outputs passed the artifact guard and scratch Hardhat validation
- all passing runs preserved the actor-specific reveal path

Without the skill:

- `1/2` generated outputs passed
- the failing baseline drifted to a different public-reveal architecture and dropped required guardrails

This is the clearest evidence that the skill changes agent behavior rather than only documenting best practices.

## Proof Boundary

These results prove a narrow validated lane, not universal FHEVM correctness.

The current submission does not claim:

- Sepolia deployment proof
- a public relayer-backed browser run
- reliable fresh generation from weak local models
- generalized correctness across every confidential-finance design

The current submission does claim:

- a production-oriented `SKILL.md`
- a validated confidential-voting target
- deterministic artifact checks
- measured improvement over a no-skill baseline in a strong generation lane
- explicit degraded-mode and lane-policy handling for weaker or mismatched environments

## How To Reproduce

```bash
./scripts/run_smoke_eval.sh
./scripts/run_artifact_guard.sh \
  --profile confidential-voting \
  --contract examples/confidential-voting-contract.sol \
  --test examples/confidential-voting.test.ts \
  --frontend examples/confidential-voting-frontend.ts
bash ./scripts/run_codex_codegen_eval.sh
```

For the official Hardhat validation path:

```bash
cd /tmp/zama-validation
npm run compile
npx hardhat test test/ConfidentialVotingTemplate.ts
```
