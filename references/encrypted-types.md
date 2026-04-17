# Encrypted Types

Purpose:

- help the agent choose the current documented FHEVM types intentionally
- keep encrypted state narrow and operation-driven

## Core Rule

Choose the smallest documented encrypted type that matches the use case, then use the matching external input type at the contract boundary.

For current Zama Solidity patterns, think in pairs:

- `ebool` <-> `externalEbool`
- `euint8` <-> `externalEuint8`
- `euint16` <-> `externalEuint16`
- `euint32` <-> `externalEuint32`
- `euint64` <-> `externalEuint64`
- `eaddress` <-> `externalEaddress`

The external type is for user-supplied encrypted inputs. The encrypted type is what the contract works with after `FHE.fromExternal(...)`.

## Current Documented Pattern

For encrypted user input:

1. accept the matching `externalE...` type in the function signature
2. accept `bytes calldata inputProof`
3. convert inside the function with `FHE.fromExternal(...)`

Example shape:

```solidity
function submitVote(externalEbool encryptedVote, bytes calldata inputProof) external {
    ebool vote = FHE.fromExternal(encryptedVote, inputProof);
}
```

Do not skip the conversion step or treat external encrypted inputs as if they were already plain `e...` values.

## Selection Heuristics

### Use `ebool` when:

- the confidential state is binary
- example: yes/no vote, allow/deny signal, private flag

### Use `euint8` or `euint16` when:

- the value is bounded and small
- example: score buckets, rating bands, small confidential counts

### Use `euint32` or `euint64` when:

- the contract performs tallying, accumulation, or comparison on larger values
- example: vote totals, confidential amounts, bids, running balances

### Use `eaddress` only when:

- the address value itself must remain confidential
- you cannot model the system with public actor roles plus encrypted payloads

## Safe Agent Behavior

Before choosing an encrypted type, ask:

1. what value is confidential?
2. what operations will happen on that value?
3. what is the smallest encrypted type that supports those operations?
4. does the contract need the external input form, the internal encrypted form, or both?

## Unsafe Agent Behavior

Do not:

- encrypt timestamps, config, or public role data without a reason
- accept `bytes` and hand-wave the encrypted input type if the docs already define `externalE...` forms
- widen the encrypted type surface just to appear more sophisticated
- use a larger encrypted integer without a concrete operation reason

## Voting Example

For narrow confidential voting:

- user submission can enter as `externalEbool`
- contract logic converts that to `ebool`
- tally state can be stored as `euint32`
- voting window, admin, and finalized flags remain public

That is better than encrypting every field in the contract.

## Review Questions

Before finalizing:

1. which values are encrypted and why?
2. does each encrypted input use the right `externalE...` boundary type?
3. does each encrypted state value use the smallest viable `e...` type?
4. which values remain public?
5. is the encrypted surface narrower than the naive “encrypt everything” design?
