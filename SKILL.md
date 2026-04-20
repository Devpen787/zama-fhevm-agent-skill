# Zama FHEVM Confidential App Build Skill

Use when the user asks to build, test, deploy, or integrate a confidential smart contract using the Zama Protocol and FHEVM.

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

8. Generate the frontend integration path if requested.
   - Use `templates/frontend-template.ts` and `references/frontend-integration.md`.
   - Make the encryption, submission, and decryption flow explicit.
   - If decrypt behavior is requested, prefer the documented relayer SDK `userDecrypt` path unless the request explicitly requires public decryption.

9. Run an anti-pattern check before finalizing.
   - Review against `references/common-anti-patterns.md`.
   - Remove unsupported API usage, broken visibility assumptions, or plaintext shortcuts.

10. Return only the requested deliverables plus unresolved risks.

11. When the request matches the confidential-voting validation target, treat the repo templates as proof-bearing defaults, not just inspiration.

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

If any check fails, revise before returning.

## Success Standard

This skill is successful only if it helps an AI coding agent produce materially correct Zama FHEVM output for a concrete confidential application flow while reducing the most common implementation mistakes.
