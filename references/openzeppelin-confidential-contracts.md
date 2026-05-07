# OpenZeppelin Confidential Contracts And ERC-7984

Purpose:

- give the agent a safe orientation point for OpenZeppelin Confidential Contracts and ERC-7984
- prevent the agent from inventing token APIs when the target app is not explicitly a confidential token
- keep the validated confidential-voting lane separate from the ERC-7984 lane

Use this reference when the user asks for:

- confidential token code
- ERC-7984
- confidential ERC-20-like balances or transfers
- wrapping between ERC-20 and confidential tokens
- OpenZeppelin Confidential Contracts

## Source Of Truth

Check the current official references before generating token code:

- Zama ERC-7984 example:
  - `https://docs.zama.org/protocol/examples/openzeppelin-confidential-contracts/erc7984`
- Zama confidential wrapper guide:
  - `https://docs.zama.org/protocol/protocol-guides/confidential-wrapper`
- OpenZeppelin Confidential Contracts token docs:
  - `https://docs.openzeppelin.com/confidential-contracts/token`
- OpenZeppelin Confidential Contracts API docs:
  - `https://docs.openzeppelin.com/confidential-contracts/api`

## Safe Defaults

For ERC-7984 or OpenZeppelin Confidential Contracts requests:

- do not adapt the confidential-voting contract into a token contract
- do not invent token method names or extension APIs
- use the installed package version and official docs for imports
- include tests for confidential transfer behavior, decrypt rights, and wrapper behavior where applicable
- state clearly whether the generated code is a scaffold or a validated token implementation

## Conceptual Mapping

ERC-7984 is the confidential-token lane:

- balances and transfer amounts are encrypted
- token operations use encrypted data types such as `euint64`
- transfer inputs may require input proofs or ACL-approved encrypted handles
- wrapping converts visible ERC-20 value into confidential ERC-7984 value
- unwrapping requires an explicit reveal/decryption path

Confidential voting is this repository's validated lane:

- votes are encrypted
- aggregate tallies are encrypted
- finalization grants actor-specific decrypt rights
- the path is compile-backed, test-backed, and live replay-backed

Do not claim that the confidential-voting validation proves ERC-7984 correctness.

## Response Rule

If the user asks for ERC-7984 or OpenZeppelin Confidential Contracts and the environment cannot verify the exact package version:

- generate a narrow scaffold only
- point to the official docs that must be checked
- include risks around version drift and API mismatch
- do not claim full validation unless compile and tests have actually run in the target template
