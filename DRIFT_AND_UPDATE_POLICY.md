# Drift And Update Policy

Purpose:

- define when this repository should be considered stale
- define what must be rerun after protocol or tooling changes

## Drift Triggers

Treat the repository as drifted if any of the following change materially:

- Zama/FHEVM Solidity APIs
- relayer SDK decryption flow
- input-proof handling expectations
- Hardhat template behavior
- contract ACL semantics
- browser replay helper behavior

## Required Revalidation

If any drift trigger fires, rerun at minimum:

1. `skill surface`
- `./scripts/run_smoke_eval.sh`

2. `contract/test gate`
- `cd /tmp/zama-validation`
- `npm run compile`
- `npx hardhat test test/ConfidentialVotingTemplate.ts`

3. `browser replay gate`
- `./scripts/prepare_live_video_demo.sh`
- replay the live browser proof at `http://127.0.0.1:4177/`

## Temporary Invalid State

Until those checks pass again, the repository should be treated as:

- not fresh enough for strong claims
- safe for review
- unsafe for stronger deployment claims

## Update Discipline

When updating for drift:

- update references first
- update templates second
- update examples third
- rerun validation fourth
- only then update the retained evidence summary

Do not update the README claims first and “catch up” later.

## Versioning Principle

The validated path is a moving contract with upstream Zama tooling.

The right behavior under drift is:

- revalidate
- downgrade trust until revalidated
- avoid silent carry-forward of stale assumptions
