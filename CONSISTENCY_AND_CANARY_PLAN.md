# Consistency And Canary Plan

Purpose:

- define how this repository should be checked for repeatability and degradation
- move beyond a single “it passed once” story

## Canary Classes

### 1. Core prompt canary

Prompt:

- confidential voting with contract + tests + frontend flow

Check:

- does the output stay aligned with the validated path?

## 2. Frontend boundary canary

Prompt:

- frontend decrypt path with explicit authorization boundary

Check:

- does the output preserve the relayer-SDK `userDecrypt` path and explicit actor boundary?

## 3. Security / stress canary

Prompt:

- malformed input, ACL, and reviewable failure handling

Check:

- does the output preserve the proof-aware and ACL-aware lane instead of producing optimistic code?

## Repeatability Checks

At minimum, rerun:

- the smoke eval
- the contract/test gate
- the live browser replay

When time allows, also compare:

- same prompt across multiple runs
- same prompt with reordered references
- same prompt under a weaker model

## What To Watch

Look for:

- verbosity growth
- missing proof handling
- weaker ACL reasoning
- drift toward public or plaintext shortcuts
- broader but less reliable output

## Decision Rules

If one canary fails:

- downgrade trust
- narrow claims
- fix and rerun before restoring the stronger claim

If multiple canaries fail:

- treat the skill as drifted
- use preserve-only validated lanes where possible
- do not represent the repo as fresh for finance/privacy-sensitive generation

## Why This Matters

For finance/privacy work, the important question is not only:

- did the system work once?

It is also:

- does it fail predictably?
- does it degrade safely?
- do we notice drift before making stronger claims?
