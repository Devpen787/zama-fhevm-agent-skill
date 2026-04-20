# Zama FHEVM Agent Skill

This repository is a submission for Zama's `Bounty Track` challenge:

- `Create FHEVM Skills for AI Coding Agents`

The submission is a Zama-specific build system for AI coding agents. It keeps agents inside a documented, validated FHEVM path for one concrete confidential application target.

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

## Fastest Reviewer Path

1. read `SUBMISSION_OVERVIEW.md`
2. read `SKILL.md`
3. inspect `examples/confidential-voting-contract.sol`
4. inspect `examples/confidential-voting.test.ts`
5. inspect `validation/results.md`
6. inspect `LIVE_REPLAY.md`

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
