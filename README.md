# Zama FHEVM Agent Skill

This repository is a submission scaffold for Zama’s `Bounty Track` challenge:

- `Create FHEVM Skills for AI Coding Agents`

The goal is to help an AI coding agent generate materially correct Zama / FHEVM code for confidential applications without falling into the most common implementation mistakes.

## What This Repo Is

This repo is:

- a `SKILL.md`-driven build system for AI coding agents
- a compact reference layer for Zama / FHEVM-specific concerns
- a validation surface for testing prompt-to-code generation

This repo is not:

- a generic privacy tutorial
- a complete FHEVM documentation mirror
- a finished product
- a generic Solidity helper

## What It Tries To Solve

AI coding agents are increasingly used to generate application code, but they do not come with strong built-in knowledge of:

- encrypted types
- access-control patterns for encrypted state
- proof-aware input handling
- decryption and visibility rules
- Zama / FHEVM-specific anti-patterns

This repo exists to narrow that gap.

## Intended Outcome

Given a natural-language request such as:

- `Build a confidential voting contract using Zama FHEVM with encrypted vote values, tests, and a minimal frontend flow`

the agent should be able to:

- reason about whether confidentiality is justified
- generate a narrow contract flow
- make access-control assumptions explicit
- acknowledge proof-handling requirements
- avoid obvious FHEVM mistakes
- return code and notes that are reviewable instead of hand-wavy

## Repo Structure

### `SKILL.md`

The core instruction layer for the agent.

### `references/`

Compact Zama-specific guidance used by the skill:

- anti-patterns
- access control
- input proofs

### `examples/`

One narrow validation target plus concrete example artifacts:

- confidential voting
- `confidential-voting-contract.sol`
- `confidential-voting.test.ts`
- `confidential-voting-frontend.ts`

### `validation/`

Prompt suite, review checklist, and results log.

### reviewer-facing docs

- `SUBMISSION_OVERVIEW.md`
- `VIDEO_DEMO_SCRIPT.md`
- `REPLAY_VALIDATION.md`
- `SECURITY_STRESS_FORWARD_VIEW.md`
- `STRESS_MATRIX.md`
- `VERSION_GATE.md`

## Validation Standard

The output does not count as successful just because it looks plausible.

It must:

- stay inside scope
- use confidentiality intentionally
- make access rules explicit
- acknowledge proof handling where relevant
- avoid the known anti-patterns
- be strong enough to review and refine as real code

## Validated Core Path

The current validated core path is:

- one narrow confidential-voting contract
- one Hardhat test file
- one minimal frontend integration path
- one prompt-to-code validation target

What is already proven:

- the contract template compiles in the official `zama-ai/fhevm-hardhat-template`
- the test template passes as a targeted Hardhat suite
- the skill now points at a compile-backed and test-backed validation surface instead of a generic privacy scaffold
- the browser now proves a live wallet-connected `submit -> finalize -> decrypt` flow against a fresh local deployment through the hybrid harness

Current proof artifact:

- `validation/run3_core_demo_output.md`
- `validation/run8_live_browser_hybrid_output.md`
- `REPLAY_VALIDATION.md`
- `LIVE_REPLAY.md`
- `AGENT_DEMO_ARTIFACT.md`

## Current Status

This is an active submission scaffold with one validated core demo path.

It is still not a finalized submission because:

- the live browser path is hybrid-verified, not relayer-verified
- no Sepolia or real relayer-network run has been performed yet
- the broader submission narrative still needs tightening around the proven artifact

## Recordable Demo

If you want the working product in a recordable state, use:

```bash
./scripts/prepare_live_video_demo.sh
```

That will:

- sync the validated contract, tests, and helper scripts into the scratch Hardhat repo
- run compile and test preflight checks
- build the browser live harness
- start the local Hardhat node if needed
- start the local preview server in the foreground

Leave that terminal open while recording.
Use `Ctrl-C` when you are done.

Then open:

```text
http://127.0.0.1:4177/
```

Expected results:

- `live-submit`: `PASS`
- `live-finalize`: `PASS`
- `live-decrypt`: `PASS`

## Validation Commands

Current validation commands for the narrow demo target:

```bash
cd /tmp/zama-validation
npm run compile
npx hardhat test test/ConfidentialVotingTemplate.ts
```

## Rule

If the skill only produces generic privacy-flavored Solidity output, it has failed.

If it produces Zama-specific, reviewable, confidentiality-aware output with explicit assumptions and risks, it is doing the right job.
