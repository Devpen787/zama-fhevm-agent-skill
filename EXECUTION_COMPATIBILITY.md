# Execution Compatibility

This repo is designed to be useful across more than one execution environment.

That does **not** mean every environment gets the same task shape.

The system is deliberately split into lanes.

## 1. Strong-Model Environment

Examples:

- high-capability hosted coding models

Supported lane:

- end-to-end artifact generation
- contract + tests + frontend + assumptions + risks

Required gates:

1. compile/test
2. stress and replay evidence
3. live browser proof when relevant

This is the primary submission lane.

## 2. Weak Local Model Environment

Examples:

- smaller local models through `ollama`

Supported lanes:

- contract preserve/transform lane
- frontend preserve lane

Not supported:

- end-to-end submission generation
- test generation from scratch
- multi-file protocol reasoning without stronger review

Why:

- weaker models can help only when the task is narrow and the validated artifact already exists

## 3. Deterministic Preserve Environment

Examples:

- situations where the correct answer is to keep the validated artifact unchanged

Supported lane:

- return the validated contract or frontend template unchanged
- still enforce structural gate checks

This matters because a reliable system should not regenerate known-good code when the request is only to preserve it.

## 4. No-Model / Reviewer Environment

Examples:

- judge review
- manual audit
- replay without generation

Supported lane:

- inspect `SKILL.md`
- inspect examples
- inspect validation logs
- rerun compile/test/live replay

This is the cleanest reproducibility lane because it does not depend on model behavior at all.

## Practical Meaning

The repo is not claiming:

- universal model parity
- identical behavior across all environments

It is claiming:

- the validated Zama path can be preserved, replayed, and reviewed across multiple environments
- stronger environments can generate more
- weaker environments can still contribute safely when the task is decomposed correctly

## Current Safe Matrix

- strong model: full path
- weak local model: contract preserve/transform
- weak local model: frontend preserve
- deterministic no-model: replay and review

## Current Unsafe Matrix

- weak local model: full end-to-end generation
- weak local model: test generation from scratch
- weak local model: multi-file protocol-sensitive synthesis

## Why This Strengthens The Submission

It shows the repo is not only a prompt artifact.

It is also:

- a constrained execution system
- a replayable proof system
- a set of environment-aware rails for keeping agents inside one real Zama/FHEVM path
