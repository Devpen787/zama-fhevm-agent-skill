# Smoke Evals

Purpose:

- give the submission one small, reviewable eval surface
- show that the skill is not only documented, but checked against explicit prompt cases
- keep the eval layer narrow and deterministic

This is not a full benchmark harness.

It is a smoke pack for the exact wedge of this repository:

- Zama / FHEVM agent skill
- one validated confidential-voting target
- explicit proof, ACL, and decrypt-boundary checks

## Files

- `prompt_cases.json`
  - compact prompt registry with the cases this repo is expected to support
- `adversarial_cases.json`
  - hostile, vague, and off-label prompts for fresh-run resilience checks
- `../scripts/run_smoke_eval.sh`
  - deterministic runner that checks required files, required skill clauses, and required proof artifacts
- `../scripts/run_adversarial_eval.sh`
  - live local-model runner that applies the skill to adversarial prompts and scores whether it narrows, refuses, or degrades safely

## What The Smoke Pack Checks

For each prompt case, the runner checks:

- required repo files exist
- the skill contains the required protocol terms or constraints
- the repo has the expected proof artifacts for the supported path

## What It Does Not Check

- it does not generate new code
- it does not score model outputs
- it does not replace compile, test, stress, or browser validation

The adversarial runner is the separate surface for live prompt-behavior checks.

Those stronger proof surfaces remain in:

- `validation/results.md`
- `LIVE_REPLAY.md`

## Run

```bash
./scripts/run_smoke_eval.sh
```

For fresh adversarial prompt runs against the local model lane:

```bash
./scripts/run_adversarial_eval.sh
```

The runner prints:

- per-case pass/fail
- the checks performed
- a JSON summary

## Why It Exists

The Zama brief is about AI agent skills.

This smoke pack makes the repo more legible as an evaluated skill artifact instead of only a collection of good files.
