# Replay Validation

This file exists to make the current proof path easy to rerun.

## Goal

Reproduce the current validated core path:

- compile the narrow confidential-voting contract
- run the targeted Hardhat test suite

## Scratch Environment

Use the official Zama Hardhat template as the execution environment.

```bash
rm -rf /tmp/zama-validation
git clone https://github.com/zama-ai/fhevm-hardhat-template.git /tmp/zama-validation
cd /tmp/zama-validation
npm install
```

## Copy The Validated Files

```bash
cp ./templates/contract-template.sol /tmp/zama-validation/contracts/ConfidentialVotingTemplate.sol
cp ./templates/test-template.ts /tmp/zama-validation/test/ConfidentialVotingTemplate.ts
```

## Run Validation

```bash
cd /tmp/zama-validation
npm run compile
npx hardhat test test/ConfidentialVotingTemplate.ts
```

## Expected Result

Compile:

- Hardhat compile succeeds

Test:

- `4 passing`

Expected suite:

- accepts an encrypted vote during the active window
- rejects duplicate submissions
- prevents unauthorized finalization
- allows authorized finalization after the window closes

## Evidence Files In This Repo

- `validation/results.md`
- `validation/run3_core_demo_output.md`

## Scope Warning

This replay proves the current narrow validation target only.

It does not prove:

- browser-level frontend correctness
- Sepolia deployment
- generalized correctness for other app categories
