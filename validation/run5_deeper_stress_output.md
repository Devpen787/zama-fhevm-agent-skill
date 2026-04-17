# Run 5 — Deeper Stress Output

Status:

- `pass`

## Validation Scope

This run extended the stress suite with the last high-priority local cases:

- tampered `inputProof`
- early finalization
- zero-vote finalization semantics

Command:

```bash
cd /tmp/zama-validation
npx hardhat test test/ConfidentialVotingTemplate.ts
```

## Test Result

```text
ConfidentialVotingTemplate
  ✔ accepts an encrypted vote during the active window
  ✔ rejects duplicate submissions
  ✔ rejects encrypted input when the signer differs from the original input user
  ✔ rejects encrypted input when it was created for a different contract address
  ✔ rejects tampered inputProof bytes
  ✔ rejects submission before the voting window starts
  ✔ rejects submission after the voting window ends
  ✔ prevents unauthorized finalization
  ✔ rejects finalization before the voting window closes
  ✔ allows authorized finalization after the window closes
  ✔ rejects unauthorized decryption after finalization
  ✔ tracks correct tallies across multiple voters
  ✔ supports zero-vote finalization with decryptable zero tallies

13 passing
```

## What This Proves

- the current narrow path is not only happy-path valid
- the encrypted-input boundary rejects:
  - wrong signer context
  - wrong contract context
  - tampered proof bytes
- the time/state model rejects both early submission and early finalization
- tally semantics are now explicit for:
  - mixed multi-voter inputs
  - zero-vote finalization

## What Is Still Missing

- browser-level frontend execution
- dependency drift rerun after a version bump
- a second validated standards-aligned example

## Assessment

The local validation surface is now meaningfully stronger than a demo-only artifact.

It still should not claim full protocol robustness, but it now has:

- compile-backed proof
- expanded negative testing
- defined edge-case semantics
