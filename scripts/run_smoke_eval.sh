#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

python3 - <<'PY' "$REPO_ROOT"
import json
import sys
from pathlib import Path

repo_root = Path(sys.argv[1])
cases_path = repo_root / "evals" / "prompt_cases.json"
skill_path = repo_root / "SKILL.md"
results_path = repo_root / "validation" / "results.md"

with cases_path.open("r", encoding="utf-8") as fh:
    registry = json.load(fh)

skill_text = skill_path.read_text(encoding="utf-8")
results_text = results_path.read_text(encoding="utf-8")

summary = {
    "registry_version": registry.get("version"),
    "case_count": len(registry.get("cases", [])),
    "passed": 0,
    "failed": 0,
    "cases": [],
}

for case in registry.get("cases", []):
    failures = []

    for rel_path in case.get("required_files", []):
        target = repo_root / rel_path
        if not target.exists():
            failures.append(f"missing_file:{rel_path}")

    for term in case.get("required_skill_terms", []):
        if term not in skill_text:
            failures.append(f"missing_skill_term:{term}")

    for term in case.get("required_results_terms", []):
        if term not in results_text:
            failures.append(f"missing_results_term:{term}")

    case_result = {
        "id": case["id"],
        "prompt": case["prompt"],
        "ok": not failures,
        "failures": failures,
    }
    summary["cases"].append(case_result)
    if failures:
        summary["failed"] += 1
    else:
        summary["passed"] += 1

for case in summary["cases"]:
    status = "PASS" if case["ok"] else "FAIL"
    print(f"[{status}] {case['id']}")
    if not case["ok"]:
        for failure in case["failures"]:
            print(f"  - {failure}")

print("")
print(json.dumps(summary, indent=2))

if summary["failed"] > 0:
    raise SystemExit(1)
PY
