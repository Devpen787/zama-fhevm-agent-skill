# Decryption Patterns

Purpose:

- force the agent to model the current documented FHEVM reveal paths explicitly
- prevent hidden or premature decryption assumptions

## Core Rule

Decryption is never the default outcome of encrypted state.

The agent must define whether the flow is:

- user-specific decryption
- actor-specific decryption
- public decryption after an explicit reveal condition

## Current Documented Patterns

### User or actor-specific decryption

Use when:

- only a specific authorized actor should recover the clear value

Key rule:

- the ciphertext needs explicit access rights for that actor
- in many cases the contract also needs its own access rights via `FHE.allowThis(...)`

### Public decryption

Use when:

- the final result should become public after a deadline or state transition

Key rule:

- first call `FHE.makePubliclyDecryptable(ciphertext)` on-chain
- then use the relayer/public decryption flow off-chain
- if the clear value must be verified on-chain later, signature verification belongs in that explicit public decryption path

Do not confuse “publicly decryptable later” with “public immediately.”

## Safe Agent Behavior

Before generating code:

1. name the decrypting actor or state that the result becomes publicly decryptable
2. define the reveal condition
3. define what stays private even after final reveal
4. if public decrypt is used, show where `FHE.makePubliclyDecryptable(...)` happens

## Unsafe Agent Behavior

Do not:

- assume admin can decrypt everything
- expose a plaintext getter for encrypted state
- imply public visibility without a reveal rule
- skip the public decrypt step and pretend the value is directly available on-chain

## Voting Example

A narrow confidential voting pattern may look like:

- individual submissions remain private
- participants cannot decrypt each other’s votes
- aggregate tallies remain encrypted during the voting window
- after the window closes, the contract marks final tallies publicly decryptable
- the final cleartext result is recovered through the public decryption flow

## Review Questions

1. who decrypts the value, or does it become public later?
2. what exactly becomes decryptable?
3. when does that transition happen?
4. what remains private even after final reveal?
5. if public reveal is used, where is `FHE.makePubliclyDecryptable(...)` called?
