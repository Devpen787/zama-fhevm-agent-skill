# Live Replay

Purpose:

- replay the current hybrid live pass
- bring the browser harness into a reviewable state quickly

What this replay proves:

- a real browser can drive the live wallet-connected contract flow
- a fresh confidential-voting contract is deployed per run
- the browser can:
  - submit an encrypted vote
  - finalize the contract
  - render the decrypted result

Important boundary:

- this is a `hybrid` replay
- encrypted input generation and tally decryption are provided by local Hardhat helpers
- this is not a real browser-relayer proof

## One-command Setup

```bash
./scripts/prepare_live_video_demo.sh
```

That script will:

1. bootstrap `/tmp/zama-validation` if it does not exist
2. sync the validated contract, test, and helper scripts into the scratch Hardhat repo
3. run `npm run compile`
4. run `npx hardhat test test/ConfidentialVotingTemplate.ts`
5. build the browser live harness
6. start the local Hardhat node on `127.0.0.1:8545` if needed
7. start the local preview server on `127.0.0.1:4177` in the foreground

Keep that terminal open while replaying.

## Replay URL

After the script succeeds, open:

```text
http://127.0.0.1:4177/
```

The page should load in a ready state.
Then click:

- `Run End-to-End Proof`

Expected browser result:

- the deployment step shows a fresh contract address
- the encrypted vote step shows a submitted transaction hash
- the finalize step shows `finalized=true`
- the decrypt step shows `Final decrypted yes-vote tally: 1`

## Hosting Boundary

This replay is local by design.

Do not publish the current harness to Vercel as if it were the proof surface. The browser UI depends on the local Hardhat node and helper-backed endpoints started by `./scripts/prepare_live_video_demo.sh`. Vercel could host a static copy of the UI, but it would not reproduce the live proof unless a matching backend, network, relayer/KMS/ACL configuration, and decrypt boundary were also deployed.

For this submission, the reviewer path is:

1. clone or open the repository
2. run `./scripts/prepare_live_video_demo.sh`
3. open `http://127.0.0.1:4177/`
4. click `Run End-to-End Proof`

## Logs

The prep script writes logs to:

- `/tmp/zama-live-video-hardhat.log`
- `/tmp/zama-live-video-preview.log`

## Current Proof Artifacts

- `validation/run8_live_browser_hybrid_output.md`
- `output/playwright/run14-live-browser-hybrid-pass.png`
- `output/playwright/run14-live-browser-hybrid-pass.json`
