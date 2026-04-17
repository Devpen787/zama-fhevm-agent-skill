# FHE Operations

Purpose:

- help the agent reason about encrypted operations as a separate logic layer
- prevent plaintext-style reasoning over encrypted state

## Core Rule

If a value is encrypted, operations on that value must also be treated as encrypted operations until an explicit, authorized reveal step exists.

Do not:

- write ordinary plaintext comparisons over encrypted values as if nothing changed
- assume visibility just because a branch condition exists

## Operation Categories

The agent should think in these categories:

### Arithmetic

Use when the contract needs to:

- add to an encrypted tally
- increment a private score
- update a confidential amount

### Comparison

Use when the contract needs to:

- compare encrypted values
- evaluate threshold logic
- decide reveal or acceptance conditions on encrypted data

### Conditional logic

Use when the contract must:

- select outcomes without exposing the underlying input
- apply different logic paths while preserving confidentiality

## Safe Agent Behavior

Before generating encrypted logic, define:

1. what operation is needed
2. what the operation produces
3. whether the result stays encrypted
4. whether the result eventually needs controlled decryption

## Unsafe Agent Behavior

Do not:

- unwrap the confidentiality model just to make branching easier
- switch to plaintext state midway without naming a reveal rule
- imply that encrypted operations behave exactly like standard Solidity arithmetic

## Voting Example

In a confidential voting contract:

- vote submission should update the encrypted voting state without exposing individual votes
- the final result should remain hidden until the reveal condition is met
- the reveal should be modeled as an explicit step, not as an accidental side effect

## Agent Output Expectations

When the agent writes code or design notes, it should state:

- what encrypted operation is occurring
- why the result should remain encrypted or become revealable
- what assumptions are still unresolved

## Review Questions

1. where does encrypted arithmetic happen?
2. where does encrypted comparison happen?
3. where does conditional logic depend on encrypted state?
4. when does any result become revealable?
5. is any branch silently collapsing encrypted logic into plaintext assumptions?
