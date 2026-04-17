#!/usr/bin/env bash
set -euo pipefail

for pid_file in /tmp/zama-live-video-hardhat.pid /tmp/zama-live-video-preview.pid; do
  if [[ -f "$pid_file" ]]; then
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid"
    fi
    rm -f "$pid_file"
  fi
done

echo "Stopped any demo services started by prepare_live_video_demo.sh"
