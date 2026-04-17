# Validation Prompts

Purpose:

- define the exact prompts used to test the skill
- keep validation repeatable

## Prompt 1 — Core Demo

Build a confidential voting contract using Zama FHEVM with encrypted vote values, clear access control, tests, and a minimal frontend flow for submitting a vote and revealing results at the end of the voting period.

## Prompt 2 — Narrow Contract Only

Generate a Zama FHEVM smart contract for confidential voting. Keep the scope narrow. Include the encrypted vote flow, access control assumptions, and test cases. Do not generate frontend code.

## Prompt 3 — Access-Control Stress Test

Using Zama FHEVM, design a confidential voting contract where only the administrator can reveal the final result after the voting period ends, while participants cannot decrypt each other’s submissions. Include the logic assumptions and tests.

## Prompt 4 — Proof Awareness Check

Build a confidential submission flow in Zama FHEVM where a user submits an encrypted vote. Include the required reasoning around encrypted input handling, access control, and testing. State unresolved proof-handling risks if anything is uncertain.

## Prompt 5 — Frontend Integration Check

Generate the minimal frontend integration path for a confidential voting app on Zama FHEVM. Show how encrypted input is submitted and how final result access is handled. Keep the implementation narrow and explicit.

## Validation Rule

For each prompt, record in `validation/results.md`:

- what the agent generated
- what worked
- what failed
- which anti-patterns were prevented
- what still needs manual review
