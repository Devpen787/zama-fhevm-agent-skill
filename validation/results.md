# Validation Results

Purpose:

- record prompt-test outcomes
- keep a proof trail for what worked, failed, and changed

## Run Template

For each test run, record:

### Prompt

- which validation prompt was used

### Environment

- which agent was used
- any relevant repo state or file version

### What Worked

- the parts that were materially correct or useful

### What Failed

- errors
- weak assumptions
- incorrect protocol handling
- places where the answer drifted into generic Solidity or generic privacy logic

### Anti-Patterns Prevented

- which issues the skill avoided successfully

### Fixes Applied

- what was changed in `SKILL.md`, references, or templates after the run

### Remaining Risks

- what still needs manual review or deeper testing

## Run 1

Status:

- partial_pass

### Prompt

- `Prompt 1 — Core Demo`

### Environment

- agent: `Codex-style internal draft simulation`
- repo state:
  - `SKILL.md` present
  - `common-anti-patterns.md` present
  - `access-control.md` present
  - `input-proofs.md` present
  - `validation/prompts.md` present
  - several referenced support files and templates still missing

### What Worked

- the skill narrowed the use case correctly
- the confidentiality need was handled as real, not decorative
- access-control questions surfaced early
- the output shape stayed close to the requested scope
- the skill did not imply fake production readiness

### What Failed

- the skill does not yet have enough repo-native support to generate confident Zama-specific implementation output
- contract and frontend generation are still under-specified
- compile and deploy confidence is not yet strong enough

### Anti-Patterns Prevented

- avoided generic privacy theater
- avoided silent access assumptions
- avoided skipping proof-handling risk
- avoided pretending deployment was verified

### Fixes Applied

- none yet
- this run is being used to identify the next missing support files

### Remaining Risks

- missing implementation references:
  - `references/encrypted-types.md`
  - `references/fhe-operations.md`
  - `references/decryption-patterns.md`
  - `references/frontend-integration.md`
- missing templates:
  - `templates/contract-template.sol`
  - `templates/frontend-template.ts`
  - `templates/test-template.ts`

### Artifact

- `validation/run1_core_demo_output.md`

## Run 2

Status:

- partial_pass

### Prompt

- `Prompt 1 — Core Demo` rerun after support-file and template expansion

### Environment

- agent: `Codex-style internal draft simulation`
- repo state:
  - `SKILL.md` present
  - core references present
  - core templates present
  - validation files present

### What Worked

- the skill now has a full structural path from prompt to code shape
- contract, frontend, and test expectations are all defined in repo-native files
- the demo target remains narrow and coherent
- the system now feels more like an operational build scaffold than a thin prompt wrapper

### What Failed

- exact Zama / FHEVM API confidence is still not strong enough
- the templates are intentionally structural, not verified runnable code
- compile and deploy confidence remain below pass threshold

### Anti-Patterns Prevented

- avoided generic privacy output
- avoided fake production claims
- avoided hidden access assumptions
- avoided ignoring proof-related risk
- avoided feature sprawl

### Fixes Applied

- added implementation references:
  - `references/encrypted-types.md`
  - `references/fhe-operations.md`
  - `references/decryption-patterns.md`
  - `references/frontend-integration.md`
- added implementation templates:
  - `templates/contract-template.sol`
  - `templates/frontend-template.ts`
  - `templates/test-template.ts`

### Remaining Risks

- current templates still need doc-level API grounding against live Zama docs
- no compile-backed or runtime-backed proof yet
- the skill is operationally stronger, but still not sufficiently verified for a full pass

### Artifact

- `validation/run2_core_demo_output.md`

## Run 3

Status:

- pass

### Prompt

- `Prompt 1 — Core Demo` rerun after source-grounding templates and validating in the official Hardhat template

### Environment

- agent: `Codex-style internal validation`
- scratch validation environment:
  - `git clone https://github.com/zama-ai/fhevm-hardhat-template.git /tmp/zama-validation`
  - `npm install`
  - copied:
    - `templates/contract-template.sol` -> `contracts/ConfidentialVotingTemplate.sol`
    - `templates/test-template.ts` -> `test/ConfidentialVotingTemplate.ts`
- validation commands:
  - `npm run compile`
  - `npx hardhat test test/ConfidentialVotingTemplate.ts`

### What Worked

- the contract template compiled successfully inside the official Zama Hardhat template
- the targeted Hardhat test file passed all four tests
- the encrypted input path is now grounded in the documented `externalE... + inputProof + FHE.fromExternal(...)` pattern
- the reveal path is now grounded in explicit ACL plus actor-specific decryption instead of vague public reveal language
- the skillpack now has a concrete, working contract-and-test validation target

### What Failed

- frontend code was not executed end-to-end in a browser environment
- the pass is scoped to the contract/test validation target, not a full deployed dApp

### Anti-Patterns Prevented

- avoided generic Solidity output
- avoided skipping proof handling
- avoided fake access assumptions
- avoided pretending reveal was automatic
- avoided claiming public decryption when the validated path was actor-specific decryption

### Fixes Applied

- grounded reference files against current Zama docs:
  - `references/encrypted-types.md`
  - `references/access-control.md`
  - `references/input-proofs.md`
  - `references/decryption-patterns.md`
  - `references/frontend-integration.md`
- upgraded templates from structural placeholders to source-grounded validation artifacts:
  - `templates/contract-template.sol`
  - `templates/frontend-template.ts`
  - `templates/test-template.ts`

### Remaining Risks

- frontend integration is source-grounded but not browser-verified
- no Sepolia or relayer-network run was performed in this validation pass
- if the bounty submission expands beyond the narrow confidential-voting validation target, it needs its own compile/test proof

### Artifact

- `validation/run3_core_demo_output.md`

## Run 4

Status:

- pass

### Prompt

- stress extension of the confidential-voting validation target

### Environment

- agent: `Codex-style internal validation`
- scratch validation environment:
  - reused `/tmp/zama-validation`
  - copied updated `templates/test-template.ts` into `test/ConfidentialVotingTemplate.ts`
- validation command:
  - `npx hardhat test test/ConfidentialVotingTemplate.ts`

### What Worked

- wrong-sender encrypted input was rejected
- wrong-contract encrypted input was rejected
- submit-before-start was rejected
- submit-after-end was rejected
- unauthorized decrypt after finalization was rejected
- multi-voter tally correctness held for mixed `true/false` inputs
- the full targeted suite passed with `10 passing`

### What Failed

- no direct tampered-`inputProof` mutation test yet
- no early-finalization negative test yet
- no zero-vote finalization semantic test yet

### Anti-Patterns Prevented

- avoided treating encrypted inputs as portable across signer or contract contexts
- avoided assuming admin-only decrypt rights without verifying outsider rejection
- avoided assuming tally correctness from a single-vote happy path

### Fixes Applied

- expanded the template and example test files with stress cases for:
  - signer binding
  - contract binding
  - time-window enforcement
  - unauthorized decryption
  - multi-voter tally correctness

### Remaining Risks

- malformed-proof behavior is still not directly tested
- browser-level frontend behavior still unverified
- no async decryption-oracle coverage

### Artifact

- `validation/run4_stress_output.md`

## Run 5

Status:

- pass

### Prompt

- second stress extension covering proof tampering and remaining priority time/state edges

### Environment

- agent: `Codex-style internal validation`
- scratch validation environment:
  - reused `/tmp/zama-validation`
  - copied updated `templates/test-template.ts` into `test/ConfidentialVotingTemplate.ts`
- validation command:
  - `npx hardhat test test/ConfidentialVotingTemplate.ts`

### What Worked

- tampered `inputProof` bytes were rejected
- early finalization before `endTime` was rejected
- zero-vote finalization produced decryptable zero tallies
- the full targeted suite passed with `13 passing`

### What Failed

- browser-level frontend execution still not covered
- dependency-drift rerun still pending
- no second validated example yet

### Anti-Patterns Prevented

- avoided assuming proof bytes are accepted as long as the handle is valid
- avoided assuming finalization guards were already covered just because post-end finalization worked
- avoided leaving zero-vote semantics undefined

### Fixes Applied

- expanded the template and example tests with:
  - tampered-proof rejection
  - early-finalization rejection
  - zero-vote finalization semantics

### Remaining Risks

- browser path remains source-grounded rather than executed
- protocol upgrade drift remains untested
- standards-aligned second example still pending

### Artifact

- `validation/run5_deeper_stress_output.md`

## Run 6

Status:

- pass

### Prompt

- `Security hardening follow-up` after the maliciousness and user-safety review

### Environment

- agent: `Codex-style internal validation`
- scratch validation environment:
  - reused `/tmp/zama-validation`
  - copied updated:
    - `templates/contract-template.sol` -> `contracts/ConfidentialVotingTemplate.sol`
    - `templates/test-template.ts` -> `test/ConfidentialVotingTemplate.ts`
- validation commands:
  - `npm run compile`
  - `npx hardhat test test/ConfidentialVotingTemplate.ts`

### What Worked

- the contract now enforces an explicit electorate through `eligibleVoters`
- electorate changes are locked once the voting window starts
- ineligible callers are rejected before any encrypted-input processing
- the updated suite still preserves the documented encrypted-input guarantees
- the local suite now passes `16` tests after the security hardening changes

### What Failed

- browser-level runtime verification was still not performed for the hardened frontend
- the single-admin finalization and reveal model remains intentionally centralized

### Anti-Patterns Prevented

- avoided permissionless-by-accident voting
- avoided hostname-driven network selection in the frontend examples/templates
- avoided decrypting arbitrary ciphertext handles without app-level provenance checks
- avoided signing decrypt requests without explicit confirmation

### Fixes Applied

- contract and template:
  - added `eligibleVoters`
  - added `setEligibleVoter(...)`
  - added `NotEligibleVoter` and `ElectorateLocked`
- frontend and template:
  - added chain ID enforcement
  - added contract allowlist enforcement
  - added handle provenance verification through expected contract getters
  - added explicit decrypt confirmation hooks
- tests:
  - added ineligible-voter rejection
  - added pre-window electorate update
  - added electorate-lock enforcement

### Remaining Risks

- admin liveness / trust capture is still the primary residual governance risk
- frontend security checks are code-level hardened but not browser-runtime validated yet
- no multisig, timelock, or public fallback reveal path exists

### Artifact

- `validation/run6_security_hardening_output.md`

## Run 7

Status:

- pass

### Prompt

- `Browser verification of hardened frontend guardrails`

### Environment

- agent: `Codex-style browser verification`
- harness:
  - `browser-harness/` Vite app with mocked `ethers` and relayer SDK modules
  - imports the real `examples/confidential-voting-frontend.ts`
- browser:
  - Playwright `chromium` headless
- runtime commands:
  - `npm run dev`
  - browser script loads `http://127.0.0.1:4174/`
  - waits for rendered scenario results
  - extracts DOM results and captures screenshot

### What Worked

- blocked contract allowlist check rendered correctly in the browser
- wrong-chain failure rendered correctly in the browser
- decrypt handle provenance mismatch rendered correctly in the browser
- explicit decrypt confirmation rejection rendered correctly in the browser
- approved decrypt path completed after confirmation
- approved submit path completed with the mocked tx hash

### What Failed

- this is still a mocked browser harness, not a real wallet + relayer + chain session
- `initSDK` and `userDecrypt` were browser-executed through mocks, not against a live Zama environment

### Anti-Patterns Prevented

- avoided claiming browser verification when only Node-side tests existed
- avoided overstating the harness as a full end-to-end wallet/relayer proof

### Fixes Applied

- added `browser-harness/` with:
  - Vite runtime
  - mocked `ethers`
  - mocked relayer SDK bundle
  - rendered scenario list for browser extraction

### Remaining Risks

- no real wallet extension interaction yet
- no live relayer integration yet
- no browser-runtime proof yet for chain switching or wallet popup UX

### Artifact

- `validation/run7_browser_harness_output.md`

## Run 8

Status:

- pass

### Prompt

- `Live wallet-connected browser pass against a fresh local deployment`

### Environment

- agent: `Codex-style live browser verification`
- browser harness:
  - `browser-live-harness/` built with Vite and served through `preview-server.mjs`
- chain:
  - local Hardhat node at `http://127.0.0.1:8545`
- browser:
  - Playwright `chromium` headless
- helper endpoints:
  - `/api/reset-live-vote`
  - `/api/encrypt-vote`
  - `/api/decrypt-tally`
- helper scripts:
  - `scripts/deployConfidentialVoting.ts`
  - `scripts/generateConfidentialVotingInput.ts`
  - `scripts/decryptConfidentialVotingTally.ts`

### What Worked

- the browser reset onto a fresh live contract before each run
- the browser submitted a real encrypted vote through the live wallet-style provider
- the browser finalized the contract after advancing chain time to `endTime + 1`
- the browser rendered a successful decrypted tally result after finalization
- the full `submit -> finalize -> decrypt` path now has browser-visible proof against a live local chain

### What Failed

- the browser still does not talk to a real relayer service for encryption or decryption
- encrypted input generation and tally decryption are still delegated to local Hardhat helpers

### Anti-Patterns Prevented

- avoided pretending the old mocked harness was enough
- avoided claiming a full relayer-backed browser proof that does not exist locally
- avoided leaving the browser status in an ambiguous “source-grounded but unverified” state

### Fixes Applied

- added local helper scripts for:
  - fresh live deployment
  - encrypted input generation
  - tally decryption
- added preview-server helper endpoints for those scripts
- added a live browser harness flow that:
  - resets to a fresh contract
  - submits through the wallet-connected browser path
  - finalizes after deterministic time advancement
  - renders the decrypted result
- fixed local wallet nonce handling for sequential browser-submitted transactions

### Remaining Risks

- this is a hybrid live pass, not a real browser-relayer pass
- Sepolia has still not been verified
- relayer-service auth, availability, and browser-side error handling remain untested

### Artifact

- `validation/run8_live_browser_hybrid_output.md`
