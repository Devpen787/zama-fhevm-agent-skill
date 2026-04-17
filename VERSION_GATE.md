# Version Gate

Date: `2026-04-17`

Purpose:

- make protocol-version awareness explicit
- prevent the skill from silently mixing incompatible Zama/FHEVM patterns

This file is not a full changelog.

It is a working gate for this repository.

## Current Target Surface

The repository is currently grounded on the following practical surface:

- Solidity library with typed encrypted values such as `ebool`, `euint32`
- typed external encrypted inputs such as `externalEbool`
- contract-side conversion via `FHE.fromExternal(...)`
- ACL primitives such as:
  - `FHE.allow(...)`
  - `FHE.allowThis(...)`
  - `FHE.allowTransient(...)`
- relayer SDK initialization and `userDecrypt(...)`
- Hardhat template and test flow from the official Zama template

## Working Version Assumption

This repo currently assumes the modern documented protocol surface reflected in:

- current Zama Protocol docs
- the official `zama-ai/fhevm-hardhat-template`
- current relayer SDK user-decrypt flow

It does **not** attempt to support all historical API variants simultaneously.

## Known Version-Sensitive Areas

### 1. Decryption oracle callbacks

Risk:

- callback signatures and oracle flow changed across FHEVM releases
- ERC-7995 compatibility introduced callback format expectations

Implication for this repo:

- async / oracle decryption should be treated as a separate capability, not assumed from user-decrypt examples

### 2. Config contract names and network config imports

Risk:

- config helpers differ by network and version

Implication for this repo:

- example contracts must state the config assumption explicitly
- do not silently switch config imports

### 3. Relayer SDK request payloads

Risk:

- user-decrypt payload, EIP-712 structure, and related fields may evolve

Implication for this repo:

- frontend examples must stay source-grounded
- browser flows should be rechecked after dependency bumps

### 4. Public decryption and callback verification

Risk:

- this is a more volatile and security-sensitive surface than the current actor-specific decrypt path

Implication for this repo:

- do not present public decryption as a drop-in equivalent to user decryption

## Supported Default Patterns

These are the default patterns the skill should prefer right now:

1. typed encrypted input
2. explicit `inputProof`
3. `FHE.fromExternal(...)`
4. narrow ACL with explicit `allowThis` / `allow`
5. actor-specific decryption via relayer SDK `userDecrypt(...)`
6. compile/test proof before confidence upgrade

## Patterns That Require Extra Justification

The skill should only use these when the request explicitly needs them:

1. public decryption
2. async decryption-oracle callbacks
3. callback signature verification logic
4. replay-protection flows for decryption callbacks
5. cross-contract encrypted state passing

## Upgrade Trigger

Revisit this file when any of these happen:

- Zama release notes mention:
  - callback changes
  - decrypt payload changes
  - ACL changes
  - config contract changes
  - SDK initialization changes
- the official Hardhat template changes its core example patterns
- the relayer SDK example flow changes materially

## Upgrade Procedure

When the target surface changes:

1. update this file first
2. update references and templates second
3. rerun the validated core path
4. only then raise confidence again

## Rule

If a code path is not clearly compatible with the current target surface, the skill must:

- say so
- narrow scope
- or mark the path as unresolved

It must not smooth over version ambiguity with confident prose.
