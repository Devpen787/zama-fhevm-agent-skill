#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run strong-lane Codex behavior evaluation.")
    parser.add_argument(
        "--cases",
        default=str(REPO_ROOT / "evals" / "codex_behavior_cases.json"),
    )
    parser.add_argument(
        "--output",
        default=str(REPO_ROOT / "evals" / "codex_behavior_last_run.json"),
    )
    return parser.parse_args()


def run_codex(prompt: str) -> tuple[bool, str]:
    with tempfile.NamedTemporaryFile("w+", delete=False) as tmp:
        out_path = tmp.name
    cmd = [
        "codex",
        "exec",
        "-C",
        str(REPO_ROOT),
        "-s",
        "read-only",
        "--ephemeral",
        "-o",
        out_path,
        prompt,
    ]
    result = subprocess.run(
        cmd,
        check=False,
        capture_output=True,
        text=True,
    )
    output = Path(out_path).read_text(encoding="utf-8")
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "codex_exec_failed"
        return False, detail
    return True, output


def build_prompt(*, user_prompt: str, with_skill: bool) -> str:
    prefix = (
        f"Read {REPO_ROOT / 'SKILL.md'} and use it as the active operating contract.\n\n"
        if with_skill
        else ""
    )
    return prefix + f"""Apply the operating rules to the user prompt below.

Return plain text with these exact sections:
Decision:
Scope:
Assumptions:
Risks:
Deliverables:

Keep the answer concise.

User prompt:
{user_prompt}
"""


def score(output: str, case: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    lowered = output.lower()
    for required in case.get("expected_required_terms", []):
        if required.lower() not in lowered:
            failures.append(f"missing_required:{required}")
    for forbidden in case.get("expected_forbidden_terms", []):
        if forbidden.lower() in lowered:
            failures.append(f"present_forbidden:{forbidden}")
    for section in ["Decision:", "Scope:", "Assumptions:", "Risks:", "Deliverables:"]:
        if section not in output:
            failures.append(f"missing_section:{section}")
    return failures


def main() -> int:
    args = parse_args()
    registry = json.loads(Path(args.cases).read_text(encoding="utf-8"))
    report: dict[str, Any] = {
        "case_count": len(registry["cases"]),
        "passed": 0,
        "failed": 0,
        "cases": [],
    }
    for case in registry["cases"]:
        for run_index in range(case.get("repeat", 1)):
            ok_run, output = run_codex(
                build_prompt(
                    user_prompt=case["user_prompt"],
                    with_skill=case.get("mode", "with_skill") == "with_skill",
                )
            )
            failures = [] if ok_run else [f"runtime_failure:{output}"]
            if ok_run:
                failures.extend(score(output, case))
            ok = not failures
            report["cases"].append(
                {
                    "id": case["id"],
                    "mode": case.get("mode", "with_skill"),
                    "run_index": run_index + 1,
                    "ok": ok,
                    "failures": failures,
                    "output": output,
                }
            )
            if ok:
                report["passed"] += 1
                print(f"[PASS] {case['id']} run {run_index + 1}")
            else:
                report["failed"] += 1
                print(f"[FAIL] {case['id']} run {run_index + 1}")
                for failure in failures:
                    print(f"  - {failure}")
    Path(args.output).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("")
    print(json.dumps(report, indent=2))
    return 0 if report["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
