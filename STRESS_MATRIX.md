# Stress Matrix

Date: `2026-04-17`

Purpose:

- turn the current validated path into a repeatable stress discipline
- define the next tests that matter before claiming deeper robustness

This file is intentionally scoped to the current repository.

It starts from the already validated confidential-voting path and expands outward.

## Status Legend

- `validated`
  - compile-backed or test-backed today
- `planned`
  - important and defined, not yet executed
- `defer`
  - useful, but lower priority than the current proof lane

## Matrix

| Area | Case | Why it matters | Current status | Evidence / next action |
|---|---|---|---|---|
| Input handling | valid encrypted vote submission | Core happy path must stay intact | `validated` | Covered by Run 3 and the current Hardhat suite |
| Input handling | duplicate encrypted submission | Prevents simple state abuse | `validated` | Covered by Run 3 |
| Input handling | malformed or mismatched `inputProof` | Main protocol-integrity edge at the contract boundary | `validated` | Run 5 added tampered-proof rejection |
| Input handling | encrypted payload bound to wrong contract address | Ensures binding assumptions are real | `validated` | Run 4 added wrong-contract negative test |
| Input handling | encrypted payload bound to wrong sender | Ensures actor binding is enforced | `validated` | Run 4 added wrong-sender negative test |
| Electorate control | ineligible voter rejected | Prevents permissionless-by-accident voting | `validated` | Run 6 added `NotEligibleVoter` coverage |
| Electorate control | admin can update electorate only before start | Prevents mid-vote electorate tampering | `validated` | Run 6 added pre-start update + lock-after-start coverage |
| Access control | contract self-access required for later reuse | Core encrypted-state safety property | `validated` | Current contract uses `FHE.allowThis(...)` on persisted tallies |
| Access control | unauthorized finalization | Basic admin boundary | `validated` | Covered by Run 3 |
| Access control | unauthorized decrypt after finalization | Proves ACL is not just narrative | `validated` | Run 4 added non-admin decrypt rejection |
| Access control | contract without `allowThis` on persisted ciphertext | Confirms failure mode is understood | `planned` | Build an intentionally broken variant and confirm failure |
| Time / state | submit before start time | Window enforcement edge | `validated` | Run 4 added pre-start rejection |
| Time / state | submit after end time | Window enforcement edge | `validated` | Run 4 added post-end rejection |
| Time / state | finalize before end time | Prevents premature reveal | `validated` | Run 5 added early-finalization rejection |
| Time / state | finalize with zero votes | Edge-case semantics | `validated` | Run 5 codified zero-vote finalization as decryptable zero tallies |
| Tally correctness | multiple yes votes | Tally accumulation correctness | `validated` | Run 4 multi-voter tally test |
| Tally correctness | mix of yes/no votes | Branch correctness in `FHE.select(...)` path | `validated` | Run 4 multi-voter tally test |
| Tally correctness | decrypt both yes and total tallies | Confirms output consistency | `validated` | Run 4 decrypts both tallies and asserts totals |
| Frontend / SDK | contract allowlist failure in browser | Prevents hostile or wrong-contract submits/decrypts | `validated` | Run 7 browser harness rendered fail-closed behavior |
| Frontend / SDK | chain mismatch failure in browser | Prevents wrong-network signing behavior | `validated` | Run 7 browser harness rendered fail-closed behavior |
| Frontend / SDK | decrypt handle provenance mismatch in browser | Prevents arbitrary-handle decrypt misuse | `validated` | Run 7 browser harness rendered fail-closed behavior |
| Frontend / SDK | explicit decrypt confirmation gate in browser | Prevents silent typed-data approval flows | `validated` | Run 7 browser harness rendered both rejection and approved paths |
| Frontend / SDK | relayer SDK initialization failure | Most common client-side failure surface | `planned` | Add failure-handling expectations in frontend example |
| Frontend / SDK | invalid EIP-712 signature in `userDecrypt` | Important wallet/decrypt edge | `planned` | Document expected failure mode; later run in browser harness |
| Frontend / SDK | stale session / expired decrypt request window | Real wallet UX failure mode | `planned` | Add as browser-level validation item |
| Protocol evolution | dependency bump compile rerun | Protects against quiet version drift | `planned` | Re-run compile/test after Zama release changes |
| Protocol evolution | callback / oracle surface change | Future async-decrypt risk | `planned` | Track in `VERSION_GATE.md` and async-decrypt note |
| Deployment | Sepolia deployment of narrow target | Turns local proof into network proof | `defer` | Valuable, but after stronger local stress coverage |
| Standards path | ERC-7984 or confidential-wrapper validation target | Aligns with likely market direction | `planned` | See `SECOND_VALIDATED_PATH_PLAN.md` |

## Priority Order

Do these in order:

1. dependency bump rerun
2. browser-level decrypt flow
3. second validated example

## Concrete Next Tests

### Test 1: dependency drift rerun

Shape:

- update the scratch environment dependencies
- rerun compile and the full targeted suite

### Test 2: browser-level decrypt flow

Shape:

- submit encrypted input from a minimal UI
- finalize from admin
- perform `userDecrypt(...)` from the browser path

### Test 3: second validated example

Shape:

- add a standards-adjacent confidential balance or wrapper path
- compile and test it in the official template

### Already validated in Runs 4 and 5

Validated now:

- wrong sender binding
- wrong contract binding
- tampered proof rejection
- pre-start rejection
- post-end rejection
- early-finalization rejection
- unauthorized decrypt rejection
- multi-voter tally correctness
- zero-vote finalization semantics
- ineligible voter rejection
- electorate lock after window start
- contract allowlist failure in browser
- chain mismatch failure in browser
- decrypt provenance mismatch in browser
- explicit decrypt confirmation in browser

## Rule

Do not upgrade the repo’s confidence level by adding prose.

Upgrade it only by moving items from `planned` to `validated`.
