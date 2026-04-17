# Input Proofs

Purpose:

- stop the agent from generating incomplete encrypted-input flows
- make the current documented `inputProof` path mandatory

## Core Rule

If a user provides encrypted input, the contract boundary should generally take:

- an `externalE...` handle
- `bytes calldata inputProof`

Then convert with `FHE.fromExternal(...)`.

If the flow omits `inputProof` without a documented reason, treat that as a failure.

## Current Documented Pattern

Contract-side shape:

```solidity
function submitVote(externalEbool encryptedVote, bytes calldata inputProof) external {
    ebool vote = FHE.fromExternal(encryptedVote, inputProof);
}
```

Hardhat-side shape:

```ts
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .addBool(true)
  .encrypt();

await contract.submitVote(encryptedInput.handles[0], encryptedInput.inputProof);
```

Important:

- the encrypted input is bound to the contract address and sender context
- this is not a normal plaintext form submission

## When This Matters

Typical cases:

- encrypted vote submission
- encrypted bid submission
- encrypted amount input
- encrypted confidential attribute input

## Safe Agent Behavior

Before generating input-handling logic, the agent should define:

1. which `externalE...` type matches the submitted value
2. where `inputProof` comes from
3. where `FHE.fromExternal(...)` happens
4. whether the same flow is shown in Solidity, tests, and frontend integration

## Unsafe Agent Behavior

Do not:

- write plaintext-style submission flows for encrypted user values
- accept bare `bytes` instead of the documented external encrypted type when the typed boundary is known
- skip `inputProof`
- imply correctness if the proof path is unresolved

## What To Return When Uncertain

If the exact proof-handling implementation is not fully verified, the agent should:

- say that directly
- narrow the output to the currently documented `inputProof` flow
- avoid claiming the flow is fully deployable

## Review Checklist

Before finalizing:

1. does the use case involve encrypted user input?
2. if yes, is the matching `externalE...` type used?
3. is `inputProof` present and passed into `FHE.fromExternal(...)`?
4. does the output avoid pretending proof handling is optional?
