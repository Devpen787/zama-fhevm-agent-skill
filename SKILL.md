---
name: zama-fhevm-confidential-app-build
description: Use when an AI coding agent is asked to build, test, deploy, or integrate a confidential smart contract or minimal confidential application flow using the Zama Protocol and FHEVM, especially in IDEs or agents such as Cursor, Claude Code, Windsurf, or Codex where repo references, templates, and validation paths can be followed directly.
---

# Zama FHEVM Confidential App Build Skill

Use when the user asks to build, test, deploy, or integrate a confidential smart contract using the Zama Protocol and FHEVM.

Portability rule:

- if the host IDE or agent does not support automatic skill activation, treat this file as the explicit operating contract
- read the referenced `references/` and `templates/` files directly from the repo
- do not assume vendor-specific tool wiring or hidden platform metadata

Do not use for:

- generic Solidity work
- non-confidential applications
- strategy-only questions
- protocol comparisons that do not require code generation
- requests that can be solved with plain EVM patterns

## Objective

Guide an AI coding agent to generate correct, testable Zama FHEVM application code with the required confidentiality, access control, proof handling, and frontend integration patterns.

Current validated reference target:

- `confidential voting`
- actor-specific decrypt rights after finalization
- compile-backed and test-backed in the official Zama Hardhat template

## Required Inputs

Before generating code, gather or infer these inputs:

1. `use_case`
   - what the application is supposed to do
   - example: confidential voting, confidential rewards, private balance logic

2. `confidentiality_need`
   - why confidentiality is required
   - what data should stay encrypted
   - who should be allowed to decrypt or view what

3. `user_roles`
   - who interacts with the app
   - who has admin rights
   - who can decrypt outputs

4. `frontend_scope`
   - whether a frontend flow is required
   - whether only contract and tests are required

5. `target_files`
   - which files to generate or modify

6. local repo references
   - `references/encrypted-types.md`
   - `references/fhe-operations.md`
   - `references/access-control.md`
   - `references/input-proofs.md`
   - `references/decryption-patterns.md`
   - `references/frontend-integration.md`
   - `references/common-anti-patterns.md`
   - `templates/contract-template.sol`
   - `templates/frontend-template.ts`
   - `templates/test-template.ts`

If any of the first four inputs are missing and the ambiguity is material, ask for clarification or state the assumption explicitly before generating code.

## Workflow

1. Confirm the application genuinely needs confidentiality.
   - If the use case does not benefit from encrypted state or private decryption, say so and avoid forcing FHEVM into the design.

2. Map the visibility model.
   - Identify which values are encrypted.
   - Identify which parties can decrypt, under what conditions.
   - Identify which values may remain public.

3. Choose the minimal encrypted types needed.
   - Prefer the smallest type surface that satisfies the use case.
   - Do not introduce encrypted types without a reason tied to the visibility model.

4. Design access control before writing logic.
   - Determine where `FHE.allow`, `FHE.allowThis`, or related access patterns are required.
   - Determine whether transient access is needed.
   - Make decryption rights explicit.

5. Define the input proof path.
   - Identify where encrypted user inputs require proofs.
   - Prefer the current documented `inputProof + FHE.fromExternal(...)` path for user-supplied encrypted inputs.
   - Do not generate submission logic that ignores input proof requirements.

6. Generate the contract skeleton.
   - Start from `templates/contract-template.sol` when possible.
   - Keep the contract narrow and use-case-specific.
   - Prefer one coherent contract over speculative architecture.
   - Default to the validated actor-specific reveal path unless the request explicitly requires public decryption.

7. Generate the test path.
   - Start from `templates/test-template.ts` when possible.
   - Include the main encrypted flow and at least one access-control check.
   - For requests close to the validated confidential-voting lane, tests are incomplete unless they cover:
     - tampered `inputProof`
     - signer mismatch on encrypted input
     - contract-address mismatch on encrypted input
     - unauthorized finalization or decrypt attempts
   - If the environment or scope cannot support those negative-path tests, downgrade scope explicitly instead of silently omitting them.

8. Generate the frontend integration path if requested.
   - Use `templates/frontend-template.ts` and `references/frontend-integration.md`.
   - Make the encryption, submission, and decryption flow explicit.
   - If decrypt behavior is requested, prefer the documented relayer SDK `userDecrypt` path unless the request explicitly requires public decryption.
   - For requests close to the validated confidential-voting lane, frontend output is incomplete unless it includes:
     - a contract allowlist or equivalent contract-address gate
     - an explicit chain check before encrypted input or decrypt flow
     - the typed-signature-backed decrypt path when actor-specific reveal is used

9. Run an anti-pattern check before finalizing.
   - Review against `references/common-anti-patterns.md`.
   - Remove unsupported API usage, broken visibility assumptions, or plaintext shortcuts.

10. Prefer stable validated defaults over novelty.
   - If the request matches the confidential-voting validation target or a close variant, preserve the validated contract, test, and frontend path unless the prompt explicitly requires a justified change.
   - Do not broaden architecture or swap reveal models only because another design is possible.

11. Degrade safely when confidence drops.
   - If the request becomes broader, less specific, or less well-supported than the validated lane, narrow scope before generating more code.
   - Preferred downgrade order:
     - contract + tests only
     - contract only
     - explicit refusal to continue without clarified requirements

12. Respond explicitly to drift or reference uncertainty.
   - If repo references, upstream docs, or requested behavior conflict, downgrade confidence and stop at the narrowest safe deliverable.
   - Do not smooth over version uncertainty with plausible-looking code.

13. Return only the requested deliverables plus unresolved risks.

14. When the request matches the confidential-voting validation target, treat the repo templates as proof-bearing defaults, not just inspiration.
    - When concrete files are produced, run `scripts/check_generated_artifact.py` against the generated contract, test, and frontend files whenever the environment allows it.
    - If generated files do not preserve the validated negative-path tests or frontend guardrails, revise them before returning.

## Stability Rules

Apply these rules across repeated runs and different host environments:

1. `preserve stable validated defaults`
   - when the validated path already satisfies the request, reuse it instead of regenerating a broader variant

2. `downgrade confidence before broadening scope`
   - when the request exceeds the validated lane, narrow the output before adding new moving parts

3. `prefer explicit degraded mode`
   - if the model cannot confidently complete contract + tests + frontend, fall back to the narrowest safe artifact set and say so

4. `hold the reveal model stable`
   - do not drift from actor-specific reveal to public reveal without an explicit prompt requirement and a stated reason

5. `treat drift as blocking`
   - a drift trigger is any material uncertainty about Zama/FHEVM APIs, relayer behavior, input-proof handling, or ACL semantics
   - under a drift trigger, do not imply fresh validation

## User-Execution Resilience

The skill should remain useful even when the user prompt is imperfect, incomplete, or slightly off-target.

1. `recover intent from substance, not exact wording`
   - activation should depend on the actual confidentiality need, encrypted workflow, and Zama/FHEVM requirements
   - do not require the user to phrase the request in one exact way

2. `infer safely, then state assumptions`
   - if the user omits secondary details but the validated lane is still clear, infer the smallest safe version and state the assumptions explicitly
   - do not infer hidden governance or public/private rules silently

3. `resist prompt pressure`
   - if the user asks to skip tests, skip proofs, force production-readiness, or bypass ACL reasoning, refuse that part and keep the safer path
   - prompt urgency does not override the validation boundary

4. `contain off-label use`
   - if the user tries to use the skill for generic Solidity, non-confidential apps, protocol comparison, or broad product work, narrow scope or decline

5. `contain runtime mismatch`
   - if the host IDE, toolchain, or repo wiring cannot support the validated lane cleanly, fall back to the narrowest safe deliverable rather than pretending parity

## Output Contract

Return only the artifacts needed for the current request, such as:

- contract code
- test code
- frontend integration snippets
- deployment notes
- assumptions
- unresolved risks

When returning code:

- keep it minimal and runnable in principle
- do not add decorative abstractions
- do not add libraries or frameworks not justified by the request

Always include:

- a short `Assumptions` section if anything material was inferred
- a short `Risks` section if deployability or correctness is not fully verified
- all required negative-path tests and frontend guardrails for the validated lane, unless the answer explicitly downgrades scope and says why

Do not return:

- long essays
- broad protocol summaries
- unsupported claims that the app is production-ready
- generic code that ignores FHEVM-specific requirements

## Boundaries

Never:

- invent unsupported Zama or FHEVM APIs
- output plaintext state where the use case requires encrypted state
- skip access-control reasoning for encrypted data
- skip proof-handling for encrypted user inputs
- claim deployment is safe if key validation steps are unresolved
- force confidentiality onto a use case that does not need it
- switch from the validated actor-specific reveal path to a public-decryption path without saying why

Do not optimize for:

- cleverness
- architectural novelty
- broad framework support

Optimize for:

- correctness
- clarity
- narrow scope
- defensible confidentiality logic

## Edge Cases

### Ambiguous confidentiality need

If it is unclear why the app needs confidentiality:

- pause and ask
- or state that FHEVM may not be the right primitive

### Missing access rules

If the prompt does not define who can decrypt or view data:

- do not invent a hidden governance model
- state the missing rule and provide the smallest safe assumption

### Underspecified but still recoverable request

If the user describes the confidential workflow loosely but the intended validated lane is still clear:

- recover the narrowest validated interpretation
- state assumptions explicitly
- avoid broadening into adjacent features the user did not ask for

### Overbroad frontend request

If the request asks for a full product surface:

- narrow to the minimal integration path needed to validate the encrypted workflow

### Mismatch between requested UX and secure design

If the prompt wants user behavior that conflicts with confidentiality or decryption rules:

- explain the mismatch
- return the safer design

### Unsupported certainty

If compile, deploy, or runtime correctness cannot be confirmed:

- say so directly
- do not imply production readiness

### Drift or reference conflict

If repo references, templates, or upstream expectations appear inconsistent:

- treat that as a drift trigger
- downgrade confidence
- return the narrowest safe deliverable or refuse the unsupported portion

### Prompt-level pressure or misuse

If the prompt tries to force speed, certainty, or unsupported scope at the cost of correctness:

- refuse the unsafe shortcut
- preserve tests, proof handling, ACL reasoning, and explicit risk statements

### Off-label use

If the request is meaningfully outside confidential Zama/FHEVM application generation:

- say the skill is not the right tool
- avoid stretching the validated lane to fit the request

### Repeated-run divergence

If a repeated run suggests a broader, more novel, or different architecture than the validated lane:

- prefer the stable validated default
- do not treat novelty as improvement by itself

## Verification

Before finalizing, check:

1. `confidentiality check`
   - Is encrypted state used only where justified?

2. `access-control check`
   - Are decryption and viewing rights explicit and coherent?

3. `proof check`
   - Are encrypted user inputs handled with the required `inputProof + FHE.fromExternal(...)` path?

4. `anti-pattern check`
   - Does the output avoid the known FHEVM pitfalls in `references/common-anti-patterns.md`?

5. `scope check`
   - Did the answer stay inside the requested deliverables?

6. `assumption check`
   - Were any important assumptions stated clearly?

7. `validated-path check`
   - If the request matches the confidential-voting core target, did the output stay aligned with the compile-backed and test-backed path?

8. `degraded-mode check`
   - If confidence dropped, did the answer narrow scope or refuse unsupported expansion instead of improvising?

9. `drift check`
   - If there was material uncertainty about versions, docs, or references, was confidence downgraded explicitly?

10. `repeatability check`
   - For requests close to the validated lane, did the answer preserve validated defaults instead of inventing a new architecture?

11. `artifact-guard check`
   - If concrete files were generated, did they pass `scripts/check_generated_artifact.py` for the relevant validated lane?

12. `user-execution resilience check`
   - If the prompt was vague, pressured, or slightly off-target, did the answer still recover safely, state assumptions, and avoid off-label expansion?

13. `negative-path coverage check`
   - If the request stayed in the confidential-voting validated lane, did the tests include tampered-proof, signer-mismatch, and contract-mismatch coverage rather than only happy-path or ACL-only checks?

14. `frontend-guardrail check`
   - If a frontend flow was requested, did it preserve the validated contract allowlist, chain check, and typed-signature decrypt guardrails instead of simplifying them away?

If any check fails, revise before returning.

## Success Standard

This skill is successful only if it helps an AI coding agent produce materially correct Zama FHEVM output for a concrete confidential application flow while reducing the most common implementation mistakes.
