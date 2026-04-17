# Common Anti-Patterns

Purpose:

- prevent the agent from generating incorrect or misleading Zama / FHEVM code
- force quality checks before code is returned

## 1. Using FHE where confidentiality is not needed

Problem:

- encrypted state is added without a real visibility reason

Why this is bad:

- increases complexity
- weakens the design
- makes the app look like privacy theater

What to do instead:

- define which values actually need to remain encrypted
- keep public state public unless confidentiality matters

## 2. Missing explicit decryption rights

Problem:

- encrypted values exist, but the code does not clearly define who can decrypt them

Why this is bad:

- breaks the privacy model
- creates hidden access assumptions

What to do instead:

- name the decrypting actor
- document when and why decryption is allowed
- apply the correct access-control path

## 3. Missing contract self-access

Problem:

- generated logic omits required self-access patterns for encrypted operations

Why this is bad:

- can break contract behavior
- signals the agent is copying patterns without understanding them

What to do instead:

- check whether contract-level access must be granted explicitly
- review the generated logic against current Zama access-control patterns

## 4. Ignoring input proofs

Problem:

- the agent accepts encrypted user inputs without the required proof path

Why this is bad:

- the flow is not materially correct
- the submission may look good but fail in real use

What to do instead:

- identify every user-supplied encrypted input
- require the proof-handling path explicitly

## 5. Treating encrypted values like plaintext

Problem:

- generated code handles encrypted values as if standard EVM logic applies directly

Why this is bad:

- breaks correctness
- confuses developers using the skill

What to do instead:

- use encrypted operations and patterns intentionally
- verify the logic matches the encrypted data model

## 6. Returning fake deploy confidence

Problem:

- the agent implies the output is production-ready without real validation

Why this is bad:

- weakens trust
- creates reputational risk

What to do instead:

- clearly label unresolved risks
- distinguish plausible compile path from verified deployment path

## 7. Overbuilding the example

Problem:

- the agent expands a narrow validation target into a full product

Why this is bad:

- increases error surface
- makes testing and review harder

What to do instead:

- keep one narrow workflow
- validate one clear user journey

## 8. Frontend flow with no encryption or decryption logic

Problem:

- the frontend is treated like a normal dApp UI and skips the confidentiality-specific flow

Why this is bad:

- fails the actual job
- makes the integration guidance low value

What to do instead:

- show how encrypted input enters the system
- show how decrypted output is retrieved or revealed
- make user interaction with confidentiality explicit

## 9. Zama-generic instead of Zama-specific output

Problem:

- the generated answer reads like a generic privacy-chain answer and could be relabeled for other protocols

Why this is bad:

- lowers submission quality
- weakens strategic fit

What to do instead:

- anchor the output to Zama / FHEVM constraints and workflow
- prefer Zama-specific terms and build logic where relevant

## 10. No stated assumptions

Problem:

- the agent fills in missing business logic, access logic, or actor roles silently

Why this is bad:

- makes the output look stronger than it is
- hides the actual uncertainty

What to do instead:

- state material assumptions explicitly
- keep the assumptions short and concrete

## Review Rule

Before returning any code:

1. ask whether confidentiality is actually needed
2. check who can decrypt what
3. check whether input proofs are required
4. check whether encrypted values are handled with the right patterns
5. state unresolved assumptions and risks
