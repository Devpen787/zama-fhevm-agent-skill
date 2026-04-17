# Run 8: Live Browser Hybrid Pass

Date:

- `2026-04-17`

Purpose:

- prove the real browser can drive a live wallet-connected contract flow
- isolate the remaining difference between a live contract pass and a full browser-relayer pass

Environment:

- local Hardhat node at `http://127.0.0.1:8545`
- `browser-live-harness/` built and served at `http://127.0.0.1:4177`
- browser driver:
  - Playwright `chromium` headless
- helper endpoints:
  - `/api/reset-live-vote`
  - `/api/encrypt-vote`
  - `/api/decrypt-tally`
- helper backend:
  - `npx hardhat run --network localhost scripts/deployConfidentialVoting.ts`
  - `npx hardhat run --network localhost scripts/generateConfidentialVotingInput.ts`
  - `npx hardhat run --network localhost scripts/decryptConfidentialVotingTally.ts`

What was proven:

- the browser loaded the live harness
- the browser used a real local wallet-style provider
- the browser submitted an encrypted vote to a freshly deployed live contract
- the browser advanced chain time to `endTime + 1`
- the browser finalized the live contract
- the browser rendered a successful decrypt result after the local helper decrypted the finalized tally

Final browser result:

- `live-submit`: pass
- `live-finalize`: pass
- `live-decrypt`: pass

Important boundary:

- this is a `hybrid live pass`, not a full browser-relayer pass
- encrypted input generation and post-finalization decryption are still done by local Hardhat helpers
- the browser is proving the wallet-connected transaction path and live contract interaction path
- it is not proving a real browser-side relayer service

Why this still matters:

- it closes the browser/runtime gap that remained after the mock harness
- it proves the contract flow can be driven from a real browser session against a live chain
- it isolates the remaining missing infrastructure precisely instead of leaving the frontend status ambiguous

Artifacts:

- screenshot:
  - `output/playwright/run14-live-browser-hybrid-pass.png`
- extracted browser results:
  - `output/playwright/run14-live-browser-hybrid-pass.json`
