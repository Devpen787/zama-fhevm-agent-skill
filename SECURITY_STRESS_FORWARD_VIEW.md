# Security, Stress, and Forward View

Date: `2026-04-17`

This note answers a stricter question than `does the demo pass?`

It asks:

- has the current path been stress-tested?
- what are the security edges?
- what are the serious alternatives?
- what would make this repository more forward-looking and less demo-bound?

## 1. Current State

### What is proven

- the narrow confidential-voting contract compiles in the official Zama Hardhat template
- the targeted Hardhat suite passes
- the browser now proves a live wallet-connected `submit -> finalize -> decrypt` path against a fresh local deployment through the hybrid harness
- the current validated path correctly uses:
  - typed encrypted input
  - `inputProof`
  - `FHE.fromExternal(...)`
  - contract self-access
  - explicit admin-side decrypt rights after finalization

### What is not yet proven

- browser-level frontend execution against a real relayer service
- Sepolia deployment
- public decryption or asynchronous decryption-oracle flows
- protocol migration resilience across future FHEVM releases
- performance under larger encrypted-state loads

So the honest answer is:

- yes, the validated core is real
- yes, the highest-risk application-integrity gap from the original demo has now been hardened with an explicit electorate gate
- yes, the live browser/runtime gap is now closed for a hybrid local path
- no, it has not yet been deeply stress-tested across the full confidentiality lifecycle or a real relayer environment

## 2. Security Review

### 2.1 Current validated path is safer because it is narrow

The current path avoids some of the hardest security surfaces by design:

- no multi-contract encrypted state handoff
- no public-decryption callback flow
- no oracle callback verification logic
- no replay-protection logic for on-chain decryption fulfillment
- no upgradeable contract architecture

That is good for validation, but it also means the demo avoids some of the most security-sensitive parts of the protocol.

### 2.2 Security edges that still matter now

#### ACL mistakes

The biggest near-term risk is still ACL drift:

- forgetting `FHE.allowThis(...)` on ciphertext reused later
- granting broader decrypt access than intended
- silently assuming role visibility

Current mitigation:

- references encode ACL reasoning
- the validated contract/test path exercises a minimal, explicit access flow

Still missing:

- live wallet/relayer runtime checks beyond the current browser harness
- multi-actor ACL patterns beyond the current single-admin reveal model

#### Encrypted input validation

The current path uses the documented `inputProof` flow, which is good.

But it still has not been stressed against:

- malformed proofs
- wrong contract address binding
- wrong sender binding
- repeated or replayed encrypted payload assumptions

That gap is now closed locally: the suite rejects wrong signer binding, wrong contract binding, and tampered `inputProof` bytes.

What is still missing:

- live wallet-driven failure handling around those rejections
- reruns after future FHEVM version bumps

#### Reveal-model confusion

The repo now defaults to actor-specific reveal because it is more grounded.

That avoids a worse failure mode:

- pretending a public-decryption path is simple when it actually introduces oracle callback, signature verification, and replay-protection responsibilities

This is a good design decision, not a limitation to hide.

#### Version drift

Zama’s protocol surface is still moving.

Relevant signals:

- the release notes for FHEVM `v0.8` mention ERC-7995 oracle callback compatibility changes, protocol ID changes, payload format evolution, and smaller user-decrypt payloads
- migration docs indicate the decryption flow and oracle surface changed over time

That means any serious agent skill should treat version drift as a first-class concern, not an afterthought.

Current gap:

- the repo does not yet have a version-gating file that tells the agent which API family it is targeting and what changed recently

### 2.3 Security surfaces not yet covered

If this repository grows into a broader build system, the next major security surfaces are:

1. async decryption-oracle callbacks
2. callback signature verification with `FHE.checkSignatures`
3. replay protection for fulfilled decryption requests
4. cross-contract encrypted state handoff
5. public decryption and cleartext verification flows
6. wallet / session / relayer auth handling

Those are exactly where a generic AI agent is most likely to hallucinate or overstate correctness.

## 3. Stress Test Review

### What has been stress-tested

Current validated tests cover:

- valid encrypted submit path
- duplicate submit rejection
- unauthorized finalization rejection
- authorized finalization plus decrypt proof

That is a solid narrow path, but it is not a real stress matrix yet.

### Missing stress tests

The next real stress suite should include:

#### Contract-level

- malformed or mismatched encrypted input proof
- wrong actor trying to decrypt after finalization
- finalization before any votes exist
- submit after finalization
- boundary behavior at `startTime` and `endTime`
- multi-voter tally correctness

#### ACL behavior

- verify a non-admin cannot decrypt tallies after finalization
- verify voter-specific decrypt behavior if such a path is added
- verify ciphertext access persists only where intended

#### Toolchain / protocol drift

- compile against the latest supported template after dependency update
- re-run validation after a Zama release-note bump

#### Frontend / SDK

- relayer SDK initialization failures
- wallet-signature failures in `userDecrypt`
- stale session / invalid EIP-712 signature behavior

## 4. Alternatives Review

The current submission does not exist in a vacuum.

There are at least four serious alternative lanes:

### Zama + OpenZeppelin confidential contracts

This is probably the most important adjacent path.

Signals:

- OpenZeppelin now has confidential contract material for Zama
- ERC-7984 and confidential wrappers are part of the standardization push
- wallet integration guidance exists

Implication:

- the industry is moving toward reusable confidential standards, not just one-off demos

What this means for us:

- a future version of this repo should probably validate a confidential-token or wrapper flow, not just voting

### Aztec

Aztec’s architecture is different:

- hybrid public/private state
- private execution environment
- strong privacy-first developer model

Implication:

- Aztec is a serious alternative if the goal is richer private-state application logic rather than EVM-confidential overlays

What this means for us:

- our repo should stay explicitly Zama-specific and not drift into generic “privacy smart contracts” language

### Fhenix / Inco

These are closer competitors in the confidential-EVM / confidentiality-layer direction.

Signals:

- Fhenix emphasizes CoFHE and fast confidential computation on EVM-like flows
- Inco positions itself as a modular confidentiality layer for blockchains

Implication:

- generic FHE agent tooling could be portable across these ecosystems

What this means for us:

- the strongest differentiation is not “FHE is cool”
- it is encoding Zama-specific ACL, proof, and decryption realities

### Arcium

Arcium is important because it points toward a different future:

- general encrypted computation
- MPC-leaning architecture
- broader confidential compute posture

Implication:

- the market may not settle on one privacy primitive

What this means for us:

- a forward-looking submission should encode design reasoning, not just one protocol’s syntax
- but it must still stay concretely Zama-specific to score well here

## 5. Forward View

### Where the industry appears to be going

From the current docs and ecosystem signals, three things stand out:

#### 1. Standards are becoming more important

Signals:

- ERC-7984
- confidential wrappers
- Confidential Token Association activity
- wallet integration guidance

That suggests the market is moving from novelty demos toward standardized confidential assets and integrations.

#### 2. Decryption and wallet UX are becoming a first-class product layer

Signals:

- relayer SDK user-decryption flow
- EIP-712 permissioning
- wallet integration guides

That suggests the real UX frontier is not just encrypted contracts, but how apps and wallets expose decryption rights safely.

#### 3. Version and protocol evolution will remain a real maintenance burden

Signals:

- changing callback requirements
- protocol ID updates
- evolving gateway/oracle surface

That suggests a good agent skill should become migration-aware, not just syntax-aware.

## 6. What Would Make This Repo More Cutting Edge

If we want this to be more nuanced and forward-looking, the next upgrades should be:

### 1. Add a `version-gating` layer

A small file that tells the agent:

- target protocol version
- supported decryption modes
- recent breaking changes
- which patterns are preferred right now

### 2. Add a second validated path tied to standards

Best candidate:

- a narrow confidential token or wrapper example using the OpenZeppelin / ERC-7984 direction

Why:

- more aligned with where confidential finance is heading
- still concrete
- more future-facing than voting alone

### 3. Add a real stress matrix

Not more prose.

Actual rows for:

- malformed proof
- boundary time behavior
- unauthorized decrypt
- multi-voter tally correctness
- version bump rerun

### 4. Add an async decryption note

Not necessarily a fully validated implementation yet, but at least:

- decryption-oracle flow
- callback verification duties
- replay-protection note
- when to use this path instead of `userDecrypt`

### 5. Add migration awareness

The agent should know that protocol releases change real implementation details.

That would materially raise the quality of the skill.

## 7. Conclusion

The current repository is good, but it is good in a specific way:

- it is no longer generic
- it has one real proof-bearing path
- it avoids pretending the hardest security surfaces are solved

What it is not yet:

- fully stress-tested
- security-complete
- standards-aligned beyond the first narrow demo
- future-proofed against protocol drift

That is not failure.

It just means the next meaningful step is no longer “make it pass.”

The next meaningful step is:

- stress matrix
- version gate
- standards-aligned second validated example
