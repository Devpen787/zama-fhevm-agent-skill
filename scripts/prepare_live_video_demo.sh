#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCRATCH_ROOT="/tmp/zama-validation"
HARDHAT_LOG="/tmp/zama-live-video-hardhat.log"
PREVIEW_LOG="/tmp/zama-live-video-preview.log"
HARDHAT_PID_FILE="/tmp/zama-live-video-hardhat.pid"
PREVIEW_PID_FILE="/tmp/zama-live-video-preview.pid"
LIVE_CONFIG_PATH="$REPO_ROOT/browser-live-harness/public/live-config.json"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

write_live_config() {
  cat >"$LIVE_CONFIG_PATH" <<'EOF'
{
  "contractAddress": "0x0000000000000000000000000000000000000000",
  "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "expectedChainId": 31337,
  "rpcPath": "/rpc",
  "userIndex": 0,
  "fhevmInstance": {
    "aclContractAddress": "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
    "kmsContractAddress": "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    "inputVerifierContractAddress": "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    "verifyingContractAddressDecryption": "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
    "verifyingContractAddressInputVerification": "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    "gatewayChainId": 10901,
    "relayerUrl": "http://127.0.0.1:4175/rpc",
    "chainId": 31337
  }
}
EOF
}

port_open() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_port() {
  local port="$1"
  local label="$2"
  for _ in $(seq 1 60); do
    if port_open "$port"; then
      return 0
    fi
    sleep 1
  done
  echo "$label did not open port $port in time" >&2
  exit 1
}

start_background() {
  local command="$1"
  local log_file="$2"
  local pid_file="$3"
  nohup bash -lc "$command" >"$log_file" 2>&1 < /dev/null &
  echo $! >"$pid_file"
}

stop_listener_on_port() {
  local port="$1"
  local pids
  pids="$(lsof -t -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill
    sleep 1
  fi
}

require_cmd git
require_cmd npm
require_cmd npx
require_cmd lsof

if [[ ! -d "$SCRATCH_ROOT" ]]; then
  rm -rf "$SCRATCH_ROOT"
  git clone https://github.com/zama-ai/fhevm-hardhat-template.git "$SCRATCH_ROOT"
  (cd "$SCRATCH_ROOT" && npm install)
fi

mkdir -p "$SCRATCH_ROOT/contracts" "$SCRATCH_ROOT/test" "$SCRATCH_ROOT/scripts"

cp "$REPO_ROOT/templates/contract-template.sol" "$SCRATCH_ROOT/contracts/ConfidentialVotingTemplate.sol"
cp "$REPO_ROOT/templates/test-template.ts" "$SCRATCH_ROOT/test/ConfidentialVotingTemplate.ts"
cp "$REPO_ROOT/runtime-helpers/"*.ts "$SCRATCH_ROOT/scripts/"

(cd "$SCRATCH_ROOT" && npm run compile >/dev/null)
(cd "$SCRATCH_ROOT" && npx hardhat test test/ConfidentialVotingTemplate.ts >/dev/null)

(
  cd "$REPO_ROOT/browser-live-harness"
  if [[ ! -d node_modules ]]; then
    npm install >/dev/null
  fi
  write_live_config
  npm run build >/dev/null
)

if ! port_open 8545; then
  start_background "cd '$SCRATCH_ROOT' && npx hardhat node --hostname 127.0.0.1" "$HARDHAT_LOG" "$HARDHAT_PID_FILE"
  wait_for_port 8545 "Hardhat node"
fi

stop_listener_on_port 4177
cat <<EOF
Live video demo is ready.

Open:
  http://127.0.0.1:4177/

Expected browser results:
  - live-submit: PASS
  - live-finalize: PASS
  - live-decrypt: PASS

Logs:
  - $HARDHAT_LOG
  - $PREVIEW_LOG

Replay notes:
  - $REPO_ROOT/LIVE_REPLAY.md
  - $REPO_ROOT/AGENT_DEMO_ARTIFACT.md

This script will now keep the preview server running in the foreground.
Leave this terminal open while recording. Use Ctrl-C when you are done.
EOF

cd "$REPO_ROOT/browser-live-harness"
exec node preview-server.mjs
