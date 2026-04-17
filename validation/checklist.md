# Validation Checklist

Purpose:

- define the minimum pass/fail gate for the Zama skill submission
- make prompt testing reviewable and repeatable

## 1. Scope Check

- does the output stay inside the requested scope?
- did the agent avoid expanding a narrow demo into a full product?
- if frontend was not requested, did the output avoid unnecessary UI code?

## 2. Confidentiality Check

- does the use case genuinely require confidentiality?
- are the encrypted values named explicitly?
- is public state left public where appropriate?

## 3. Access-Control Check

- is the decrypting actor named?
- are admin rights explicit and narrow?
- is the timing of decryption clear?
- if the contract needs self-access, is that accounted for?

## 4. Input-Proof Check

- does the flow include reasoning around encrypted user inputs?
- if proof handling is required, is it acknowledged?
- if proof details are unresolved, are they called out clearly?

## 5. Encrypted-Logic Check

- are encrypted values treated as encrypted values, not plaintext?
- does the generated logic avoid obvious mismatch between encrypted state and ordinary EVM assumptions?

## 6. Zama-Specificity Check

- does the output feel Zama / FHEVM-specific?
- could the answer be lazily relabeled for another protocol with almost no changes?

If yes, the result is too generic.

## 7. Anti-Pattern Check

Review against:

- `references/common-anti-patterns.md`

Minimum pass:

- no fake deploy confidence
- no hidden assumptions
- no generic privacy theater
- no skipped access-control logic
- no ignored encrypted input path

## 8. Output Quality Check

- is the output materially useful to a developer?
- is the code or logic coherent enough to refine, test, or compile?
- does the answer include assumptions and unresolved risks when needed?

## 9. Demo Fitness Check

For the confidential-voting validation target:

- is the voting flow understandable?
- are result-reveal conditions clear?
- is the frontend flow minimal but sufficient?
- are tests included or clearly expected?

## 10. Final Decision

### Pass

Use only if:

- the output is narrow
- the confidentiality logic is coherent
- the access and proof reasoning are visible
- the agent avoided the main anti-patterns

### Partial Pass

Use if:

- the core logic is useful
- but technical review or targeted fixes are still needed

### Fail

Fail if:

- the answer is too generic
- the encrypted workflow is not believable
- access control or proof handling is missing
- the result reads stronger than the actual confidence level
