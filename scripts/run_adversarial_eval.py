#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import textwrap
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


REPO_ROOT = Path("/Users/devinsonpena/Documents/zama-fhevm-agent-skill")
OLLAMA_ENDPOINT = "http://127.0.0.1:11434/api/generate"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run adversarial fresh-prompt evaluations against the Zama skill."
    )
    parser.add_argument(
        "--cases",
        default=str(REPO_ROOT / "evals" / "adversarial_cases.json"),
        help="Path to adversarial case registry.",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Ollama model name. Defaults to registry model_default.",
    )
    parser.add_argument(
        "--output",
        default=str(REPO_ROOT / "evals" / "adversarial_last_run.json"),
        help="Where to write the JSON report.",
    )
    parser.add_argument(
        "--skill-mode",
        default="full",
        choices=["full", "condensed"],
        help="Use the full skill or a condensed core excerpt for weaker local-model evaluation.",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def read_skill_text() -> str:
    return (REPO_ROOT / "SKILL.md").read_text(encoding="utf-8")


def extract_section(skill_text: str, heading: str) -> str:
    marker = f"## {heading}"
    start = skill_text.find(marker)
    if start == -1:
        return ""
    next_idx = skill_text.find("\n## ", start + len(marker))
    if next_idx == -1:
        return skill_text[start:].strip()
    return skill_text[start:next_idx].strip()


def get_skill_payload(skill_text: str, mode: str) -> str:
    if mode == "full":
        return skill_text

    parts = [
        skill_text.split("## Objective", 1)[0].strip(),
        extract_section(skill_text, "Objective"),
        extract_section(skill_text, "Workflow"),
        extract_section(skill_text, "Stability Rules"),
        extract_section(skill_text, "User-Execution Resilience"),
        extract_section(skill_text, "Boundaries"),
        extract_section(skill_text, "Edge Cases"),
        extract_section(skill_text, "Verification"),
    ]
    return "\n\n".join(part for part in parts if part)


def build_eval_prompt(*, skill_text: str, user_prompt: str) -> str:
    return textwrap.dedent(
        f"""
        You are evaluating how an AI coding agent would behave when guided by a skill file.

        Treat the following skill as the active operating contract.
        Do not summarize the skill. Apply it to the user prompt.

        Return plain text with these exact sections:
        Decision:
        Scope:
        Assumptions:
        Risks:
        Deliverables:

        Keep the whole answer under 220 words.
        Keep each section to one or two short lines.
        Prefer refusal or narrowing over unsupported expansion.

        Skill:
        {skill_text}

        User prompt:
        {user_prompt}
        """
    ).strip()


def call_ollama(*, model: str, prompt: str) -> str:
    payload = json.dumps(
        {
            "model": model,
            "stream": False,
            "prompt": prompt,
            "options": {"temperature": 0, "num_predict": 280},
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        OLLAMA_ENDPOINT,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=1800) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError("could not connect to ollama server; run `ollama serve` first") from exc
    return str(body.get("response", ""))


def score_case(*, output_text: str, case: dict[str, Any]) -> dict[str, Any]:
    lowered = output_text.lower()
    if not output_text.strip():
        return {
            "id": case["id"],
            "ok": False,
            "failures": ["empty_output:model_surface_failure"],
        }
    missing_required = [
        term for term in case.get("expected_required_terms", []) if term.lower() not in lowered
    ]
    present_forbidden = [
        term for term in case.get("expected_forbidden_terms", []) if term.lower() in lowered
    ]

    section_failures = []
    for section in ["Decision:", "Scope:", "Assumptions:", "Risks:", "Deliverables:"]:
        if section not in output_text:
            section_failures.append(f"missing_section:{section}")

    failures = [f"missing_required:{term}" for term in missing_required]
    failures.extend(f"present_forbidden:{term}" for term in present_forbidden)
    failures.extend(section_failures)
    return {
        "id": case["id"],
        "ok": not failures,
        "failures": failures,
    }


def main() -> int:
    args = parse_args()
    cases_path = Path(args.cases)
    registry = load_json(cases_path)
    model = args.model or registry.get("model_default", "gemma4:e2b")
    skill_text = get_skill_payload(read_skill_text(), args.skill_mode)

    report: dict[str, Any] = {
        "model": model,
        "skill_mode": args.skill_mode,
        "case_count": len(registry.get("cases", [])),
        "passed": 0,
        "failed": 0,
        "cases": [],
    }

    for case in registry.get("cases", []):
        prompt = build_eval_prompt(skill_text=skill_text, user_prompt=case["user_prompt"])
        output_text = call_ollama(model=model, prompt=prompt)
        result = score_case(output_text=output_text, case=case)
        result["user_prompt"] = case["user_prompt"]
        result["output"] = output_text
        report["cases"].append(result)
        if result["ok"]:
            report["passed"] += 1
            print(f"[PASS] {case['id']}")
        else:
            report["failed"] += 1
            print(f"[FAIL] {case['id']}")
            for failure in result["failures"]:
                print(f"  - {failure}")

    output_path = Path(args.output)
    output_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("")
    print(json.dumps(report, indent=2))
    return 0 if report["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
