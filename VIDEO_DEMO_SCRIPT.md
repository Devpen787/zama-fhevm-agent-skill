# Video Demo Script

Target:

- `3 minutes`
- one take or lightly edited
- focused on the proven core

## 1. Opening

What this is:

`This repo is a Zama FHEVM skill system for AI coding agents. The goal is not to summarize docs. The goal is to help an agent generate code that stays inside real FHEVM constraints around encrypted input, access control, proofs, and decryption.`

## 2. Show The Repo Shape

Briefly show:

- `SKILL.md`
- `references/`
- `templates/`
- `examples/`
- `validation/`

Line:

`The repo is structured so the agent has one instruction layer, compact protocol-specific references, proof-bearing templates, concrete examples, and a validation log.`

## 3. Explain The Validated Target

Show:

- `examples/confidential-voting.md`
- `examples/confidential-voting-contract.sol`

Line:

`The narrow validation target is confidential voting. I used it because it is small enough to validate, but still forces the agent to handle typed encrypted inputs, inputProof, contract self-access, finalization, and user-side decryption.`

## 4. Show The Skill Constraint

Open:

- `SKILL.md`

Highlight:

- validated reference target
- access-control step
- proof step
- validated-path check

Line:

`The skill is opinionated. It defaults to the validated path unless the prompt explicitly asks for something else. It also forces the agent to name assumptions and avoid switching to unsupported reveal models silently.`

## 5. Show The Test Evidence

Open:

- `validation/results.md`
- `validation/run8_live_browser_hybrid_output.md`

Line:

`The key difference from a generic prompt pack is that the core path is compile-backed, stress-tested, and browser-proven in a hybrid live environment.`

Then read or paraphrase:

- `npm run compile`
- `npx hardhat test test/ConfidentialVotingTemplate.ts`
- targeted suite passes
- live browser hybrid path passes `submit -> finalize -> decrypt`

## 6. Show The Example Test

Open:

- `examples/confidential-voting.test.ts`

Call out:

- encrypted vote submission
- duplicate rejection
- unauthorized finalization rejection
- finalization plus decrypt proof

Line:

`This is the actual proof path. It is not just syntactically plausible code. The encrypted submit flow, finalization path, and decrypt path are all exercised across tests and the live browser harness.`

## 7. Close

Line:

`So the submission is really a constrained build system for FHEVM agents, backed by one narrow validated path. The current browser proof is hybrid, because encrypted input generation and decryption are helper-backed locally. If I extended this further, the next step would be a real relayer or Sepolia proof without losing the current proof quality.`

## Recording Notes

- do not oversell production readiness
- keep the story on one validated path
- do not spend time on every file
- anchor the demo on proof, not on volume
