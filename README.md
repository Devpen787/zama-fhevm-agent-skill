# Zama FHEVM Agent Skill

This repository is a submission for Zama's `Bounty Track` challenge:

- `Create FHEVM Skills for AI Coding Agents`

This repository gives an AI coding agent a Zama-specific build path for one validated confidential application target. It is designed to keep the agent inside documented FHEVM patterns for encrypted inputs, access control, reveal logic, testing, and replayable proof.

## What This Proves

- a Zama/FHEVM skill can constrain an agent to a real implementation path instead of generic Solidity output
- in a strong generation lane, the skill improves repeatability against the same prompt instead of only describing the right path
- the confidential-voting target compiles and passes in the official `zama-ai/fhevm-hardhat-template`
- the browser replay proves the validated `submit -> finalize -> decrypt` path on a fresh local deployment

## Reviewer Path

1. read `SUBMISSION_OVERVIEW.md`
2. read `SKILL.md`
3. read `RELIABILITY_CONTRACT.md`
4. read `FAILURE_MODES.md`
5. read `LANE_POLICY.md`
6. inspect `examples/confidential-voting-contract.sol`
7. inspect `examples/confidential-voting.test.ts`
8. inspect `validation/results.md`
9. inspect `LIVE_REPLAY.md`

## What It Does

Given a prompt such as:

- `Build a confidential voting contract using Zama FHEVM with encrypted vote values, tests, and a minimal frontend flow`

the repository helps an agent:

- use Zama/FHEVM primitives instead of generic Solidity habits
- reason explicitly about encrypted inputs, ACL, proofs, and reveal rights
- avoid common anti-patterns
- land on a path that can be reviewed, replayed, compiled, and tested

## Strategic Fit

Zama is pushing toward confidential-finance-class applications where encrypted inputs, controlled disclosure, and correct ACL matter.

This repository is aligned to that direction as developer infrastructure:

- it is not a finance product itself
- it is a tool for reducing agent failure when building privacy-sensitive applications

The validated demo target is confidential voting because it is the smallest proof target that still exercises:

- encrypted input
- `inputProof`
- explicit ACL
- finalization
- decrypt rights
- frontend integration
- tests

## Repository Map

- `SKILL.md`
  - core instruction layer for the agent
- `references/`
  - compact Zama-specific guidance on encrypted types, ACL, proofs, decryption, frontend flow, and anti-patterns
- `templates/`
  - validated starting points for contract, test, and frontend paths
- `examples/`
  - confidential-voting validation target and inspectable artifacts
- `validation/`
  - results log and run artifacts
- `RELIABILITY_CONTRACT.md`
  - guarantees, refusals, and degraded-mode rules
- `DRIFT_AND_UPDATE_POLICY.md`
  - what must be rerun when Zama tooling changes
- `FAILURE_MODES.md`
  - explicit failure classes for privacy-sensitive agent generation
- `CONSISTENCY_AND_CANARY_PLAN.md`
  - repeatability and degradation checks beyond one passing run
- `LANE_POLICY.md`
  - which environments may generate, preserve, review, or are disallowed
- `SUBMISSION_OVERVIEW.md`
  - concise reviewer brief
- `LIVE_REPLAY.md`
  - replay path for the live browser proof
- `EXECUTION_COMPATIBILITY.md`
  - how the repository behaves across strong-model, weak-model, and deterministic replay environments

## Validated Core

The validated narrow path is:

- one confidential-voting contract
- one hardened Hardhat test suite
- one minimal frontend integration path
- one live browser proof surface

Current evidence includes:

- strong-lane `with_skill` versus `without_skill` comparison in `validation/run9_codex_strong_lane_output.md`
- compile-backed validation in the official `zama-ai/fhevm-hardhat-template`
- stress-extended Hardhat tests for malformed proof, wrong signer, wrong contract, boundary-time, decrypt authorization, and tally correctness cases
- browser-driven `submit -> finalize -> decrypt` proof against a fresh local deployment

## What Is Proven

- the skill is anchored to documented Zama/FHEVM primitives
- the repository covers encrypted types, FHE operations, access control, input proofs, decryption patterns, frontend integration, testing, and anti-patterns
- the confidential-voting target compiles, tests, and replays cleanly
- the live browser proof shows the generated path can hold end to end on a fresh local deployment

## Proof Boundary

This submission makes one explicit boundary clear:

- the browser owns the transaction path
- encrypted input generation and final tally decrypt are helper-backed in the live local demo
- this is not claiming Sepolia proof or a public relayer-backed browser run

## Reliability Layer

For privacy-sensitive and finance-adjacent use cases, the repository also makes four additional commitments explicit:

- `RELIABILITY_CONTRACT.md`
- `DRIFT_AND_UPDATE_POLICY.md`
- `FAILURE_MODES.md`
- `CONSISTENCY_AND_CANARY_PLAN.md`
- `LANE_POLICY.md`

These documents define what the skill guarantees, how it should degrade, what counts as drift, and how repeatability should be checked before stronger claims are made.

## Replay

To replay the current proof:

```bash
./scripts/prepare_live_video_demo.sh
```

Then open:

```text
http://127.0.0.1:4177/
```

and run the end-to-end proof in the browser.

## Validation Commands

For the narrow demo target:

```bash
cd /tmp/zama-validation
npm run compile
npx hardhat test test/ConfidentialVotingTemplate.ts
```

## Standard

If the repository only helps an agent produce privacy-flavored Solidity that looks plausible, it is not doing its job.

If it helps an agent stay inside a Zama-specific, reviewable, replayable, and error-aware FHEVM path, it is doing the right job.
