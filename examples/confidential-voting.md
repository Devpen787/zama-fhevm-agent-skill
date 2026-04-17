# Confidential Voting Demo Target

Purpose:

- define the one narrow validation target for the Zama skill
- keep testing focused on one believable confidential workflow

This is not the submission itself.

It is the build target used to prove the skill works.

Concrete example artifacts now exist in the same folder:

- `confidential-voting-contract.sol`
- `confidential-voting.test.ts`
- `confidential-voting-frontend.ts`

## 1. Demo Goal

Generate a narrow confidential voting application using Zama FHEVM where:

- votes are submitted privately
- participants cannot see each other’s votes
- the final result is decryptable only under an explicit condition
- the app includes a contract path, test path, and minimal frontend flow

## 2. Why This Demo

This target is useful because:

- the privacy need is easy to explain
- it is smaller than payroll or tokenized allocation
- it still exercises:
  - encrypted inputs
  - access control
  - result disclosure
  - testing
  - frontend integration

## 3. Core User Flow

### User

- arrives at the app
- connects wallet or equivalent signing surface
- submits an encrypted vote
- cannot inspect other participants’ submissions

### Admin

- can control the voting window or reveal condition
- does not automatically get universal visibility unless the design says so
- in the current validated path, only gains decrypt rights after finalization

### Result

- result remains encrypted during the voting window
- after the voting period ends, the admin can be granted decrypt rights for the final tally

## 4. Contract Expectations

Minimum expectations:

- one voting contract
- typed encrypted vote handling with the documented `externalE... + inputProof + FHE.fromExternal(...)` path
- explicit access-control logic
- clear result-reveal rule
- narrow state model

Do not add:

- unnecessary governance features
- token logic
- multi-contract architecture unless clearly required

## 5. Frontend Expectations

Minimum expectations:

- one flow for vote submission
- one flow for result retrieval or reveal
- confidentiality-specific user flow is explicit

Do not add:

- full design system work
- dashboard sprawl
- product polish unrelated to the confidential workflow

## 6. Test Expectations

Minimum expectations:

- vote submission path
- access-control check
- reveal-condition check
- at least one negative path if possible

Current validated path includes:

- encrypted vote submission
- duplicate-vote rejection
- unauthorized finalization rejection
- authorized finalization plus admin-side decrypt proof

## 7. Access-Control Questions

The skill should answer or state assumptions for:

1. who can submit votes?
2. who can reveal the result?
3. when can the result be revealed?
4. can participants see only the final result or also partial state?
5. does the contract need self-access to operate correctly?

## 8. Proof Questions

The skill should handle:

- whether encrypted vote submission requires explicit proof handling
- whether any unresolved proof logic should be called out in the risks section

For the current validated path, this is no longer hypothetical:

- the contract boundary takes `externalEbool` plus `bytes calldata inputProof`
- tests use `fhevm.createEncryptedInput(...).addBool(...).encrypt()`

## 9. Pass Condition

This demo counts as good enough for validation if:

- the generated flow is coherent
- confidentiality is not decorative
- access-control logic is explicit
- proof-related uncertainty is not hidden
- the output is strong enough to review and refine, not just admire

For the current core target, the higher bar is now:

- the contract compiles in the official Zama Hardhat template
- the targeted Hardhat test suite passes
