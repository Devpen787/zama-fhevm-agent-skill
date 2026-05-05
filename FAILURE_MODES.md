# Failure Modes

Purpose:

- make predictable failure classes explicit
- show how the repository is designed to catch or contain them

## 1. Generic Solidity Drift

Failure:

- the model outputs ordinary EVM patterns with privacy language layered on top

Containment:

- Zama/FHEVM-specific references
- explicit skill trigger and boundaries
- required proof-path checks

## 2. Access-Control Drift

Failure:

- decrypting actors or reveal timing are implied instead of specified

Containment:

- visibility-model step in `SKILL.md`
- access-control reference
- actor-specific validated default path

## 3. Proof-Path Omission

Failure:

- encrypted user input is handled without `inputProof` or without `FHE.fromExternal(...)`

Containment:

- required proof check in `SKILL.md`
- `references/input-proofs.md`
- compile/test-backed validated template path

## 4. Overclaiming

Failure:

- the system implies production readiness or generalized protocol confidence beyond the validated lane

Containment:

- explicit proof boundary
- required `Assumptions` and `Risks`
- narrow retained evidence set

## 5. Long-Horizon Degradation

Failure:

- repeated iterations gradually increase verbosity, structural erosion, or unsupported abstractions

Why it matters:

- recent coding-agent research shows prompt improvements do not stop long-horizon degradation

Containment:

- prefer validated templates for stable lanes
- preserve known-good artifacts rather than regenerating them
- rerun hard gates after material changes

## 6. Retrieval / Context Drift

Failure:

- adding or reordering context changes output quality or causes the model to miss the most important constraints

Containment:

- keep `SKILL.md` compact
- keep high-risk guidance in focused references
- keep one narrow validated target

## 7. Weak-Model Degradation

Failure:

- smaller local models fail on multi-file reasoning, tests, or decrypt logic

Containment:

- explicit execution-compatibility matrix
- preserve-only deterministic lanes
- do not claim model parity

## 8. Update Drift

Failure:

- upstream Zama docs or SDKs change while repo claims remain static

Containment:

- `DRIFT_AND_UPDATE_POLICY.md`
- rerun compile/test/browser gates before refreshed claims
