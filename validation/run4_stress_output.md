# Run 4 — Stress Output

Status:

- `pass`

## Validation Scope

This run extended the validated confidential-voting target with the first real stress cases.

Scratch environment:

- reused `/tmp/zama-validation`
- updated `test/ConfidentialVotingTemplate.ts` from the repository template

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
  ✔ rejects submission before the voting window starts
  ✔ rejects submission after the voting window ends
  ✔ prevents unauthorized finalization
  ✔ allows authorized finalization after the window closes
  ✔ rejects unauthorized decryption after finalization
  ✔ tracks correct tallies across multiple voters

10 passing
```

## What This Proves

- encrypted inputs are bound to both contract and signer context in the tested flow
- the voting window is enforced on both sides of the submission boundary
- outsider decrypt attempts fail after admin-only finalization
- mixed multi-voter tallies behave correctly in the current validated contract path

## What Is Still Missing

- direct tampered-`inputProof` mutation test
- early-finalization negative test
- zero-vote finalization behavior
- browser-level frontend execution

## Assessment

This is a meaningful stress upgrade over Run 3.

The repository now has:

- a compile-backed validated core
- a test-backed stress extension over the most important near-term edges
