# Run 7 — Browser Harness Output

Status:

- `pass`

## Validation Scope

This run verified the hardened frontend guardrails in a real browser, using a local Vite harness that imports the real frontend helper and supplies mocked browser-safe dependencies.

Verified scenarios:

- blocked contract submit
- wrong-chain submit
- handle provenance mismatch on decrypt
- explicit decrypt rejection
- approved decrypt
- approved submit

## Runtime Commands

```bash
cd /Users/devinsonpena/Documents/job-hunt-os/data/zama/zama-fhevm-agent-skill/browser-harness
npm run dev
```

Browser script:

```bash
node <<'EOF'
const { chromium } = require('playwright');
const fs = require('fs');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="approved-submit"]');
  const items = await page.locator('#results li').evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.getAttribute('data-testid'),
      text: node.textContent,
      className: node.className,
    }))
  );
  await page.screenshot({
    path: '/Users/devinsonpena/Documents/job-hunt-os/data/zama/zama-fhevm-agent-skill/output/playwright/run7-browser-harness.png',
    fullPage: true,
  });
  fs.writeFileSync(
    '/Users/devinsonpena/Documents/job-hunt-os/data/zama/zama-fhevm-agent-skill/output/playwright/run7-browser-harness.json',
    JSON.stringify(items, null, 2)
  );
  console.log(JSON.stringify(items, null, 2));
  await browser.close();
})();
EOF
```

## Observed Browser Results

- `blocked-contract-submit`
  - `PASS: Blocked contract address: not in the application allowlist`
- `wrong-chain-submit`
  - `PASS: Unexpected chain ID: expected 31337, got 999`
- `handle-provenance-check`
  - `PASS: Blocked decrypt request: ciphertext handle did not come from the expected contract getter`
- `decrypt-confirmation`
  - `PASS: User rejected decrypt request`
- `approved-decrypt`
  - `PASS: decrypt succeeded with confirmed request`
- `approved-submit`
  - `PASS: 0xmockedtx`

## Artifacts

- screenshot:
  - `/Users/devinsonpena/Documents/job-hunt-os/data/zama/zama-fhevm-agent-skill/output/playwright/run7-browser-harness.png`
- extracted browser results:
  - `/Users/devinsonpena/Documents/job-hunt-os/data/zama/zama-fhevm-agent-skill/output/playwright/run7-browser-harness.json`

## Assessment

The hardened frontend guardrails are now browser-verified at the UI/runtime layer against a mocked provider/contract/relayer environment.

This is stronger than unit-only verification, but it is still not equivalent to a live wallet + relayer + chain integration test.
