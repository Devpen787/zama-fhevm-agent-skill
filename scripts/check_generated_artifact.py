#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List


def require_checks(path: Path, required_checks: List[dict[str, object]]) -> List[str]:
    text = path.read_text(encoding="utf-8")
    failures: List[str] = []
    for check in required_checks:
        label = str(check["label"])
        patterns = [str(pattern) for pattern in check["patterns"]]
        if not any(re.search(pattern, text, re.IGNORECASE | re.DOTALL) for pattern in patterns):
            failures.append(f"{path.name}:missing:{label}")
    return failures


def build_confidential_voting_checks(args: argparse.Namespace) -> Dict[str, List[dict[str, object]]]:
    checks: Dict[str, List[dict[str, object]]] = {}
    if args.contract:
        checks[str(args.contract)] = [
            {"label": "externalEbool", "patterns": [r"\bexternalEbool\b"]},
            {"label": "inputProof", "patterns": [r"\binputProof\b"]},
            {"label": "FHE.fromExternal", "patterns": [r"FHE\.fromExternal"]},
            {"label": "FHE.allowThis", "patterns": [r"FHE\.allowThis"]},
            {"label": "finalizeResult", "patterns": [r"\bfinalizeResult\b"]},
            {"label": "FHE.allow(", "patterns": [r"FHE\.allow\s*\("]},
            {"label": "VotingClosed", "patterns": [r"\bVotingClosed\b"]},
            {"label": "OnlyAdmin", "patterns": [r"\bOnlyAdmin\b"]},
        ]
    if args.test:
        checks[str(args.test)] = [
            {
                "label": "tampered inputProof",
                "patterns": [
                    r"tampered inputProof",
                    r"tamperedProof",
                    r"inputProof.*tamper",
                ],
            },
            {
                "label": "different contract address",
                "patterns": [
                    r"different contract address",
                    r"contract[- ]address mismatch",
                    r"different contract",
                    r"contract address",
                ],
            },
            {
                "label": "signer differs from the original input user",
                "patterns": [
                    r"signer differs from the original input user",
                    r"signer mismatch",
                    r"different user",
                    r"InvalidSigner",
                ],
            },
            {"label": "OnlyAdmin", "patterns": [r"\bOnlyAdmin\b"]},
            {"label": "VotingStillOpen", "patterns": [r"\bVotingStillOpen\b"]},
            {"label": "userDecryptEuint", "patterns": [r"userDecryptEuint"]},
        ]
    if args.frontend:
        checks[str(args.frontend)] = [
            {"label": "createEncryptedInput", "patterns": [r"createEncryptedInput"]},
            {"label": "inputProof", "patterns": [r"\binputProof\b"]},
            {
                "label": "assertAllowedContract",
                "patterns": [
                    r"assertAllowedContract",
                    r"allowedContractAddresses",
                    r"allowlist",
                ],
            },
            {
                "label": "assertExpectedChain",
                "patterns": [
                    r"assertExpectedChain",
                    r"assertChain",
                    r"getNetwork\(\).*chainId",
                    r"Wrong chain",
                ],
            },
            {"label": "userDecrypt", "patterns": [r"userDecrypt"]},
            {"label": "signTypedData", "patterns": [r"signTypedData"]},
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
    for raw_path, required_checks in checks.items():
        failures.extend(require_checks(Path(raw_path), required_checks))

    result = {"ok": not failures, "profile": args.profile, "failures": failures}
    print(json.dumps(result, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
