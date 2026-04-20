# Submission Overview

## Challenge Fit

This repository is built for Zama’s `Bounty Track` prompt:

- `Create FHEVM Skills for AI Coding Agents`

It is a compact build system for AI coding agents that:

- constrains generation to documented FHEVM patterns
- forces reasoning about encrypted inputs, ACL, proofs, and reveal logic
- includes a concrete validation target
- is backed by compile, test, and live replay evidence

## Strategic Fit

Zama is pushing toward confidential-finance-class applications where implementation details matter:

- encrypted inputs
- explicit ACL
- selective disclosure
- controlled reveal logic

This repository is aligned to that direction as developer infrastructure. It is not a finance product. It is a tool for keeping agents inside the correct path when building privacy-sensitive applications.

## What Makes It Distinct

The repository combines:

- `SKILL.md`
  - build instructions for the agent
- `references/`
  - high-risk FHEVM reasoning steps
- `templates/`
  - validated defaults for contract, test, and frontend paths
- `examples/`
  - one inspectable confidential-voting path
- `validation/`
  - results and run artifacts

## Validated Core

The validated core path is:

- one confidential-voting contract
- one Hardhat test file
- one minimal relayer-SDK frontend path

Validation evidence:

- compile-backed in the official `zama-ai/fhevm-hardhat-template`
- stress-extended Hardhat test suite passes
- live browser hybrid harness proves the `submit -> finalize -> decrypt` path on a fresh local deployment

See:

- `validation/results.md`
- `validation/run3_core_demo_output.md`
- `validation/run8_live_browser_hybrid_output.md`
- `LIVE_REPLAY.md`

## Why Confidential Voting

Confidential voting is the validation target because it exercises:

- encrypted input
- typed `externalE...` boundaries
- `inputProof`
- contract self-access
- explicit reveal rights
- client-side decryption flow
- tests

It is the smallest validated proof target, not the full limit of the repository’s intended application class.

## Reviewer Walkthrough

1. `README.md`
2. `SKILL.md`
3. `examples/confidential-voting-contract.sol`
4. `examples/confidential-voting.test.ts`
5. `validation/results.md`
6. `LIVE_REPLAY.md`

## What Is Proven vs Not Proven

Proven:

- the skill is anchored to documented FHEVM primitives
- the narrow contract/test target compiles and passes
- the repository encodes a real validation loop
- the browser proves a live wallet-connected hybrid path on a fresh local deployment

Not yet proven:

- a real browser-relayer service
- Sepolia deployment
- generalized correctness for every confidential-finance use case

## Evaluation Claim

This repository helps an AI coding agent stay inside a documented and validated FHEVM implementation path for a concrete confidential application while reducing common mistakes around proofs, ACL, reveal logic, and browser/runtime integration boundaries.
