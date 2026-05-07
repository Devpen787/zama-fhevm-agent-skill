# Strong-Lane Codex Evaluation

Purpose:

- measure whether the skill changes model behavior in a strong generation lane
- compare `with_skill` versus `without_skill` behavior on the validated confidential-voting target
- require generated outputs to survive the deterministic artifact guard and scratch Hardhat validation

## Environment

- runner: local `codex exec`
- mode: `read-only`, `--ephemeral`
- artifact guard: `scripts/check_generated_artifact.py`
- scratch validator: `/tmp/zama-validation`

## Code Generation Result

### With skill

- case: `core_confidential_voting_with_skill`
- repeats: `3`
- result: `3/3 pass`

Passing runs:

- preserved the validated actor-specific reveal path
- passed the deterministic artifact guard
- passed scratch Hardhat validation

Scratch validation summaries:

- `10 passing`
- `11 passing`
- `10 passing`

### Without skill

- case: `core_confidential_voting_without_skill`
- repeats: `2`
- result: `1/2 pass`

Passing baseline run:

- stayed close enough to the validated lane to pass the guard and scratch validation

Failing baseline run:

- drifted to a different public-reveal architecture
- omitted the validated `finalizeResult() + FHE.allow(..., admin)` actor-specific reveal path
- dropped required negative-path tests and frontend guardrails

## Behavior Result

The strict behavior pack remained intentionally conservative.

What it still showed:

- the skill-bearing lane improved on prompt-pressure resistance
- the skill-bearing lane preserved degraded-mode behavior under runtime mismatch
- the baseline remained weaker on proof specificity and downgrade discipline

## What This Proves

- the skill is not only a static instruction file
- in a strong generation lane, it materially improves repeatability on the validated confidential-voting target
- the strongest remaining failure mode is architecture drift when the skill is absent or not followed closely
