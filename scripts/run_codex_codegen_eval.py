#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_GUARD = REPO_ROOT / "scripts" / "check_generated_artifact.py"
SCRATCH_TEMPLATE = Path("/tmp/zama-validation")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run strong-lane Codex codegen evaluation.")
    parser.add_argument(
        "--cases",
        default=str(REPO_ROOT / "evals" / "codex_codegen_cases.json"),
    )
    parser.add_argument(
        "--output",
        default=str(REPO_ROOT / "evals" / "codex_codegen_last_run.json"),
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
        f"Read {REPO_ROOT / 'SKILL.md'} and use the local references, templates, and examples in that repository.\n\n"
        if with_skill
        else ""
    )
    return prefix + f"""Build the requested artifacts.

Do not answer by only pointing to existing repo files.
Return concrete code blocks for:
- the contract
- the tests
- the frontend flow

Then include:
- assumptions
- risks

User prompt:
{user_prompt}
"""


def extract_block(text: str, language: str) -> str | None:
    match = re.search(rf"```{language}\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip() + "\n"
    return None


def extract_ts_blocks(text: str) -> list[str]:
    return [
        match.strip() + "\n"
        for match in re.findall(r"```(?:ts|typescript)\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    ]


def run_guard(contract: Path, test: Path, frontend: Path) -> dict[str, Any]:
    result = subprocess.run(
        [
            "python3",
            str(ARTIFACT_GUARD),
            "--profile",
            "confidential-voting",
            "--contract",
            str(contract),
            "--test",
            str(test),
            "--frontend",
            str(frontend),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def detect_contract_name(contract_source: str) -> str | None:
    match = re.search(r"\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)\b", contract_source)
    return match.group(1) if match else None


def run_scratch_validation(*, contract_source: str, test_source: str) -> dict[str, Any]:
    if not SCRATCH_TEMPLATE.exists():
        return {"ok": False, "failures": [f"missing_scratch_template:{SCRATCH_TEMPLATE}"]}
    if not (SCRATCH_TEMPLATE / "node_modules").exists():
        return {"ok": False, "failures": [f"missing_node_modules:{SCRATCH_TEMPLATE / 'node_modules'}"]}

    contract_name = detect_contract_name(contract_source)
    if not contract_name:
        return {"ok": False, "failures": ["missing_contract_name"]}

    with tempfile.TemporaryDirectory(prefix="codex-zama-validate-") as td:
        workdir = Path(td)
        copy_cmd = [
            "rsync",
            "-a",
            "--exclude",
            "node_modules",
            "--exclude",
            "artifacts",
            "--exclude",
            "cache",
            "--exclude",
            "deployments",
            "--exclude",
            "fhevmTemp",
            f"{SCRATCH_TEMPLATE}/",
            f"{workdir}/",
        ]
        rsync = subprocess.run(copy_cmd, check=False, capture_output=True, text=True)
        if rsync.returncode != 0:
            detail = rsync.stderr.strip() or rsync.stdout.strip() or "rsync_failed"
            return {"ok": False, "failures": [f"scratch_copy_failed:{detail}"]}

        node_modules_link = workdir / "node_modules"
        if not node_modules_link.exists():
            node_modules_link.symlink_to(SCRATCH_TEMPLATE / "node_modules", target_is_directory=True)

        contract_path = workdir / "contracts" / "Generated.sol"
        test_path = workdir / "test" / "Generated.ts"
        contract_path.write_text(contract_source, encoding="utf-8")
        test_path.write_text(test_source, encoding="utf-8")

        compile_result = subprocess.run(
            ["npm", "run", "compile"],
            cwd=workdir,
            check=False,
            capture_output=True,
            text=True,
        )
        if compile_result.returncode != 0:
            detail = compile_result.stderr.strip() or compile_result.stdout.strip() or "compile_failed"
            return {"ok": False, "failures": [f"compile_failed:{detail}"]}

        test_result = subprocess.run(
            ["npx", "hardhat", "test", str(test_path)],
            cwd=workdir,
            check=False,
            capture_output=True,
            text=True,
        )
        if test_result.returncode != 0:
            detail = test_result.stderr.strip() or test_result.stdout.strip() or "test_failed"
            return {"ok": False, "failures": [f"test_failed:{detail}"]}

        summary = ""
        for line in reversed(test_result.stdout.splitlines()):
            if "passing" in line:
                summary = line.strip()
                break
        return {"ok": True, "contract_name": contract_name, "test_summary": summary or "tests_passed"}


def main() -> int:
    args = parse_args()
    registry = json.loads(Path(args.cases).read_text(encoding="utf-8"))
    report: dict[str, Any] = {"cases": [], "passed": 0, "failed": 0}
    for case in registry["cases"]:
        for run_index in range(case.get("repeat", 1)):
            ok_run, output = run_codex(
                build_prompt(
                    user_prompt=case["user_prompt"],
                    with_skill=case["mode"] == "with_skill",
                )
            )
            entry: dict[str, Any] = {
                "id": case["id"],
                "mode": case["mode"],
                "run_index": run_index + 1,
                "ok": False,
                "output": output,
            }
            if not ok_run:
                entry["failures"] = [f"runtime_failure:{output}"]
                report["cases"].append(entry)
                report["failed"] += 1
                print(f"[FAIL] {case['id']} run {run_index + 1}")
                print(f"  - runtime_failure:{output}")
                continue

            contract_block = extract_block(output, "solidity") or extract_block(output, "sol")
            ts_blocks = extract_ts_blocks(output)
            assumptions_present = "Assumptions" in output
            risks_present = "Risks" in output
            extraction_failures: list[str] = []
            if not contract_block:
                extraction_failures.append("missing_contract_block")
            if len(ts_blocks) < 1:
                extraction_failures.append("missing_test_block")
            if len(ts_blocks) < 2:
                extraction_failures.append("missing_frontend_block")
            if not assumptions_present:
                extraction_failures.append("missing_assumptions_section")
            if not risks_present:
                extraction_failures.append("missing_risks_section")

            guard: dict[str, Any] = {"ok": False, "failures": []}
            validation: dict[str, Any] | None = None
            if not extraction_failures:
                with tempfile.TemporaryDirectory() as td:
                    tdir = Path(td)
                    contract = tdir / "artifact.sol"
                    test = tdir / "artifact.test.ts"
                    frontend = tdir / "artifact.frontend.ts"
                    contract.write_text(contract_block, encoding="utf-8")
                    test.write_text(ts_blocks[0], encoding="utf-8")
                    frontend.write_text(ts_blocks[1], encoding="utf-8")
                    guard = run_guard(contract, test, frontend)
                if guard.get("ok"):
                    validation = run_scratch_validation(
                        contract_source=contract_block,
                        test_source=ts_blocks[0],
                    )

            failures = extraction_failures.copy()
            failures.extend(guard.get("failures", []))
            if validation and not validation.get("ok"):
                failures.extend(validation.get("failures", []))
            ok = not failures and validation is not None and validation.get("ok")
            entry = {
                **entry,
                "ok": ok,
                "failures": failures,
                "guard": guard,
                "validation": validation,
            }
            report["cases"].append(entry)
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
