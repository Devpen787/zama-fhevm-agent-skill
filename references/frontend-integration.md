# Frontend Integration

Purpose:

- help the agent generate minimal but credible frontend integration guidance
- keep the client flow aligned with the current relayer SDK model

## Core Rule

The frontend must make the confidentiality-specific workflow explicit.

At minimum, show:

1. SDK initialization
2. encrypted input preparation
3. contract submission with handle + `inputProof`
4. reveal or decrypt retrieval flow

## Current Frontend Surface To Model

The current documented frontend flow is relayer-SDK based:

- initialize the SDK
- create an instance with provider or signer context
- create encrypted input bound to the contract address and user address
- encrypt client-side
- submit the encrypted handle plus `inputProof`

Conceptual shape:

```ts
await initSDK();
const instance = await createInstance({ network, provider });

const encryptedInput = instance
  .createEncryptedInput(contractAddress, userAddress)
  .addBool(true)
  .encrypt();

await contract.submitVote(encryptedInput.handles[0], encryptedInput.inputProof);
```

## Minimum Frontend Flow

For a narrow confidential app, prefer:

- one submission action
- one confirmation state
- one result check or reveal retrieval action

Avoid:

- dashboard sprawl
- generic dApp UX that hides the encryption step

## Reveal Handling

Be explicit about which reveal mode is used:

- actor-specific decrypt
- public decrypt after `FHE.makePubliclyDecryptable(...)`

Do not imply that the contract itself returns plaintext immediately after submission.

## Safe Agent Behavior

The agent should:

- keep the UI narrow
- show the encryption step explicitly
- pass both encrypted handle and `inputProof`
- tie the frontend flow back to access-control and reveal logic

## Unsafe Agent Behavior

Do not:

- generate a generic form without the encrypted input preparation step
- imply users can inspect ciphertext as plaintext
- hide the difference between submission and reveal
- omit SDK initialization and still call the flow “frontend integration”

## Voting Example

Minimal flow:

1. user connects wallet
2. frontend initializes the relayer SDK instance
3. user selects a vote option
4. frontend creates encrypted input for that option
5. frontend submits encrypted handle + `inputProof`
6. UI confirms submission
7. after finalization, UI checks the public decrypt or actor-specific decrypt path

## Review Questions

1. does the frontend show SDK initialization?
2. does it show encrypted input preparation explicitly?
3. does it pass both handle and `inputProof`?
4. does it distinguish submission from reveal?
