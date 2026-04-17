# Submission Copy

## Project Name

`Zama FHEVM Agent Skill: Validated Confidential App Build System`

## Short Description

A compact AI-agent skill system for Zama FHEVM that helps coding agents generate materially correct confidential app code while avoiding common mistakes around encrypted inputs, ACL, proofs, and reveal logic.

## One-Paragraph Submission Summary

This submission is a Zama-specific build system for AI coding agents. Instead of acting like a docs mirror or prompt pack, it gives the agent a constrained instruction layer, protocol-specific reference files, proof-bearing templates, and a validated core demo target. The current validated path is a narrow confidential-voting flow that exercises typed encrypted inputs, `inputProof`, contract self-access, explicit finalization, and actor-specific decryption. That path was compile-checked and test-checked in the official Zama Hardhat template, so the repo is anchored in a real working implementation path rather than generic privacy-flavored Solidity.

## Why This Submission

AI coding agents are getting better at generating Solidity quickly, but they still fail in predictable ways on FHEVM:

- they skip or blur proof handling
- they treat encrypted inputs like normal values
- they leave ACL assumptions implicit
- they drift into generic EVM code with weak Zama specificity
- they overclaim correctness without validation

This repository is designed to reduce exactly those failures.

## What’s Inside

- `SKILL.md`
  - the instruction contract for the agent
- `references/`
  - compact guidance on encrypted types, ACL, proofs, decryption, frontend flow, and anti-patterns
- `templates/`
  - proof-bearing defaults for contract, test, and frontend paths
- `examples/`
  - a concrete confidential-voting example set
- `validation/`
  - prompt suite, results log, and the Run 3 pass artifact

## Validated Core

The current validated core path is:

- confidential voting contract
- Hardhat test suite
- minimal frontend integration path

Validation environment:

- official `zama-ai/fhevm-hardhat-template`
- `npm run compile`
- `npx hardhat test test/ConfidentialVotingTemplate.ts`
- live browser hybrid harness against a fresh local deployment

Result:

- compile passed
- stress-extended targeted suite passed
- live browser hybrid path passed for:
  - submit
  - finalize
  - decrypt

## What Makes It Distinct

The point of this repo is not just “help agents write FHE code.”

The point is to give the agent a disciplined build path that:

- uses documented `externalE... + inputProof + FHE.fromExternal(...)` patterns
- forces ACL reasoning before code generation
- defaults to the validated actor-specific reveal path
- records assumptions and risks explicitly
- keeps one replayable proof loop attached to the repo

## Honest Scope

What is proven:

- the narrow contract/test target compiles
- the targeted FHEVM flow passes tests
- the repository encodes a real validation loop
- the browser can drive the live contract path through the hybrid harness

What is not yet proven:

- a real browser-relayer service
- Sepolia deployment
- generalized correctness for every confidential-finance app category

## Reviewer Path

Shortest review path:

1. `SUBMISSION_OVERVIEW.md`
2. `SKILL.md`
3. `examples/confidential-voting-contract.sol`
4. `examples/confidential-voting.test.ts`
5. `validation/run8_live_browser_hybrid_output.md`

## Video Intro Line

`This repo is a constrained FHEVM build system for AI coding agents, backed by compile-tested, stress-tested, and live browser-verified hybrid proof instead of generic privacy scaffolding.`
