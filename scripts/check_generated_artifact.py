#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List


def require_terms(path: Path, required_terms: List[str]) -> List[str]:
    text = path.read_text(encoding="utf-8")
    failures: List[str] = []
    for term in required_terms:
        if term not in text:
            failures.append(f"{path.name}:missing:{term}")
    return failures


def build_confidential_voting_checks(args: argparse.Namespace) -> Dict[str, List[str]]:
    checks: Dict[str, List[str]] = {}
    if args.contract:
        checks[str(args.contract)] = [
            "externalEbool",
            "inputProof",
            "FHE.fromExternal",
            "FHE.allowThis",
            "finalizeResult",
            "FHE.allow(",
            "VotingClosed",
            "OnlyAdmin",
        ]
    if args.test:
        checks[str(args.test)] = [
            "tampered inputProof",
            "different contract address",
            "signer differs from the original input user",
            "OnlyAdmin",
            "VotingStillOpen",
            "userDecryptEuint",
        ]
    if args.frontend:
        checks[str(args.frontend)] = [
            "createEncryptedInput",
            "inputProof",
            "assertAllowedContract",
            "assertExpectedChain",
            "userDecrypt",
            "signTypedData",
        ]
    return checks


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Deterministic guard for generated Zama/FHEVM artifacts."
    )
    parser.add_argument(
        "--profile",
        default="confidential-voting",
        choices=["confidential-voting"],
        help="Guard profile to enforce.",
    )
    parser.add_argument("--contract", type=Path, help="Path to generated contract.")
    parser.add_argument("--test", type=Path, help="Path to generated test.")
    parser.add_argument("--frontend", type=Path, help="Path to generated frontend.")
    args = parser.parse_args()

    provided = [args.contract, args.test, args.frontend]
    if not any(provided):
        parser.error("At least one of --contract, --test, or --frontend is required.")

    missing_files = [
        str(path) for path in provided if path is not None and not path.exists()
    ]
    if missing_files:
        print(
            json.dumps(
                {"ok": False, "failures": [f"missing_file:{path}" for path in missing_files]},
                indent=2,
            )
        )
        return 1

    if args.profile != "confidential-voting":
        parser.error(f"Unsupported profile: {args.profile}")

    checks = build_confidential_voting_checks(args)
    failures: List[str] = []
    for raw_path, required_terms in checks.items():
        failures.extend(require_terms(Path(raw_path), required_terms))

    result = {"ok": not failures, "profile": args.profile, "failures": failures}
    print(json.dumps(result, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
