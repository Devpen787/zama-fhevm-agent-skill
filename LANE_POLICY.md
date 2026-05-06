# Lane Policy

Purpose:

- define which environments may generate, preserve, review, or are disallowed
- make the trust boundary explicit for privacy-sensitive and finance-adjacent use

## 1. Generation Lane

Allowed:

- strong enough model/runtime to follow the skill, references, templates, and validation path coherently

May do:

- generate or materially modify contract, test, and frontend artifacts

Requirements:

- skill canaries pass
- artifact guard passes when concrete files are generated
- compile/test gate passes for the validated lane
- live replay gate passes when frontend/runtime claims are made

## 2. Preserve Lane

Allowed:

- weaker or narrower environments that cannot be trusted for fresh multi-file confidential-app generation

May do:

- preserve validated templates
- perform bounded contract-only transforms
- perform preserve-only frontend handling
- narrow scope safely

Must not do:

- invent new protocol-sensitive architecture
- broaden beyond the validated lane

## 3. Review / Replay Lane

Allowed:

- no-model or reviewer-only environments

May do:

- inspect `SKILL.md`
- inspect examples and validation artifacts
- rerun smoke eval, compile/test, and live replay

Must not do:

- make fresh generation claims

## 4. Disallowed Lane

Disallowed for finance/privacy-sensitive generation:

- weak or unstable environments that fail adversarial fresh-run checks
- environments that cannot return coherent structured output under skill guidance
- environments with unresolved runtime/tooling mismatch that prevents trustworthy execution of the validated lane

Current example:

- `gemma4:e2b` failed the adversarial fresh-run pack at the response-surface level, so it should not be treated as a generation lane for this submission class

## Policy

The rule is not:

- every model should be able to generate everything

The rule is:

- every environment must be placed in the correct lane
- only trusted lanes get generation rights
- weaker lanes may preserve, review, or replay, but not overclaim
