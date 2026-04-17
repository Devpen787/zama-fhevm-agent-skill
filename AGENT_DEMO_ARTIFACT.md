# Agent Demo Artifact

Purpose:

- give judges one clean `prompt -> agent -> working artifact` story
- reduce the chance that the repo is read as “good files, unclear demo”

## Exact Prompt

Primary prompt for the demo:

`Build a confidential voting contract using Zama FHEVM with encrypted vote values, clear access control, tests, and a minimal frontend flow for submitting a vote and revealing results at the end of the voting period.`

Source:

- `validation/prompts.md`

## Skill Surface The Agent Uses

Core instruction layer:

- `SKILL.md`

Critical support files:

- `references/encrypted-types.md`
- `references/fhe-operations.md`
- `references/access-control.md`
- `references/input-proofs.md`
- `references/decryption-patterns.md`
- `references/frontend-integration.md`
- `references/common-anti-patterns.md`

## Resulting Generated Path

The validated target path produced for that prompt is:

- contract:
  - `examples/confidential-voting-contract.sol`
- tests:
  - `examples/confidential-voting.test.ts`
- frontend:
  - `examples/confidential-voting-frontend.ts`
- use-case spec:
  - `examples/confidential-voting.md`

## What The Agent Had To Get Right

For the artifact to be valid, the agent had to stay inside:

- typed encrypted inputs
- `inputProof` handling
- explicit ACL and reveal logic
- admin-only finalization
- frontend submission and decrypt reasoning
- stress-tested edge cases

## Proof Chain

### Compile + Test Proof

- `validation/results.md`
- `validation/run3_core_demo_output.md`
- `validation/run5_deeper_stress_output.md`
- `validation/run6_security_hardening_output.md`

### Browser Proof

- `validation/run8_live_browser_hybrid_output.md`
- `output/playwright/run14-live-browser-hybrid-pass.png`
- `output/playwright/run14-live-browser-hybrid-pass.json`

## Honest Boundary

What this proves:

- the skill can be anchored to one narrow, real, validated FHEVM implementation path
- the resulting artifact compiles, passes stress-tested contract checks, and passes the live browser hybrid flow

What this does not prove:

- a real browser-relayer deployment
- Sepolia deployment
- correctness for every confidential-finance category

## How To Use This In The Video

Show this artifact after the prompt.

The point is:

- here is the prompt
- here is the skill
- here is the resulting artifact set
- here is the proof chain
