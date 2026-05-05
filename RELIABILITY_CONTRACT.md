# Reliability Contract

Purpose:

- define what this skill guarantees
- define what it refuses
- make the confidence boundary explicit for privacy-sensitive and finance-adjacent use cases

## Scope

This repository is a reliability layer for a narrow Zama/FHEVM build path.

It is not a general-purpose confidential-app generator.

Its primary validated target is:

- confidential voting

The same discipline is intended to transfer to confidential-finance-class applications, but only through explicit revalidation per use case.

## Guarantees

Within the validated path, this repository is designed to guarantee:

1. `Zama specificity`
- generation is constrained to documented Zama/FHEVM patterns rather than generic Solidity habits

2. `Visibility-first design`
- encrypted state, decrypting actors, reveal timing, and public/private boundaries must be identified before code generation

3. `Proof-aware input handling`
- user-supplied encrypted inputs must follow the documented `inputProof + FHE.fromExternal(...)` path

4. `Access-control explicitness`
- decryption and self-access decisions must be named, not implied

5. `Narrow validated defaults`
- when the request matches the confidential-voting target, the skill prefers proof-bearing defaults over speculative alternatives

6. `Replayability`
- the retained contract/test path and the live browser replay can be rerun from the repository

## Refusals

This repository should refuse, narrow, or explicitly downgrade confidence when asked to:

- generate generic “private app” code without a real confidentiality need
- skip ACL reasoning
- skip proof handling for encrypted user input
- switch silently from actor-specific reveal to public reveal
- claim deployment safety without validation
- treat one passing run as proof for all confidential-finance use cases

## Degraded Modes

When reliability drops, the system should degrade in this order:

1. `narrow scope`
- reduce from full app flow to contract + tests only

2. `reuse validated defaults`
- preserve templates instead of regenerating known-good paths

3. `surface assumptions`
- state what is inferred and what is unresolved

4. `refuse unsupported expansion`
- do not continue into a broader or riskier path if the validated lane no longer applies

## Success Standard

The standard is not “generated something plausible.”

The standard is:

- constrained generation
- explicit trust boundaries
- replayable validation
- predictable refusal or degradation when the request exceeds the validated lane
