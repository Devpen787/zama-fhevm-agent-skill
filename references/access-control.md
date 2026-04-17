# Access Control

Purpose:

- help the agent reason about which actor can use, decrypt, or make ciphertext decryptable
- avoid silent mistakes around `FHE.allow`, `FHE.allowThis`, and reveal rights

## Core Rule

In FHEVM, ciphertext access is explicit. Do not write encrypted logic until these questions are answered:

1. what data is encrypted
2. whether the contract needs to reuse that ciphertext in later transactions
3. which actor, if any, gets decryption rights
4. whether the result is private-to-user or publicly decryptable later

## Current Access Primitives To Model

The agent should reason with the documented access primitives:

- `FHE.allowThis(ciphertext)`
  - give the contract persistent access to reuse stored ciphertext later
- `FHE.allow(ciphertext, actor)`
  - give a specific external actor access
- `FHE.allowTransient(ciphertext, actor)`
  - short-lived access when the ciphertext only needs to survive the current transaction boundary
- `FHE.isSenderAllowed(ciphertext)`
  - access check helper
- `FHE.makePubliclyDecryptable(ciphertext)`
  - mark ciphertext for public decryption flows after the reveal rule is satisfied

## Minimum Access-Control Questions

For every use case, define:

- `participant`
  - who submits encrypted input
- `contract`
  - does the contract need to read or update this ciphertext again later?
- `authorized viewer`
  - who can decrypt or receive the result
- `public reveal`
  - whether the final result becomes publicly decryptable after a rule or deadline

If these roles are not clear, the agent must state the missing assumption.

## Patterns To Think Through

### Contract self-access

If encrypted state will be stored and used again in later calls:

- call `FHE.allowThis(...)` on the stored ciphertext

Without that, later contract operations on the stored ciphertext can fail.

### User-specific decryption

If a specific user should decrypt a ciphertext later:

- the contract generally needs access for its own logic
- the user also needs explicit access via `FHE.allow(...)`

Do not assume the submitter can decrypt later just because they created the input.

### Admin authority

Admin should not get full decryption rights by default.

Instead, define whether admin can:

- trigger a reveal state transition
- receive explicit decrypt rights
- mark results publicly decryptable

These are different powers. Do not collapse them into one vague “admin can see everything” rule.

### Public reveal

If the final result becomes public:

- keep submissions private during the active phase
- only call `FHE.makePubliclyDecryptable(...)` after the explicit reveal condition is satisfied

That is different from giving admin private decrypt rights.

## Safe Agent Behavior

The agent should:

- define access before code generation
- state where `FHE.allowThis`, `FHE.allow`, or `FHE.makePubliclyDecryptable` are required
- keep disclosure rules narrow
- avoid hidden access assumptions

The agent should not:

- assume admin can decrypt everything
- skip `FHE.allowThis` on state that the contract must reuse later
- imply visibility is automatic

## Review Checklist

Before finalizing code, ask:

1. which ciphertexts need `FHE.allowThis`?
2. which actors, if any, need `FHE.allow`?
3. is the reveal flow private-to-user or public?
4. if public, where does `FHE.makePubliclyDecryptable` happen?
5. are any access assumptions still unresolved?
