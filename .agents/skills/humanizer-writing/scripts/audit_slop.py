#!/usr/bin/env python3
"""
AI Slop & Cliché Auditor for Antigravity Agents.

Scans documentation, markdown files, PR descriptions, or text streams
for formulaic AI clichés, sycophantic fillers, and banned buzzwords.

Usage:
    python3 audit_slop.py README.md docs/
    cat generated_text.txt | python3 audit_slop.py
"""

import sys
import re
import argparse
from pathlib import Path

# Try to import resolve_skill_config
sys.path.append(str(Path(__file__).resolve().parents[3] / "scripts"))
try:
    from resolve_skill_config import resolve_skill_config
except ImportError:
    def resolve_skill_config(skill_name):
        return {
            "banned_words": [
                "delve", "testament", "tapestry", "beacon", "orchestrating",
                "pivotal", "plethora", "furthermore", "it's worth noting",
                "in conclusion", "embark", "paramount", "meticulous", "multifaceted"
            ]
        }

SYCOPHANCY_PATTERNS = [
    r"certainly!\s+(?:i'd|i\s+would)\s+be\s+happy",
    r"great\s+question!",
    r"as\s+an\s+ai\s+language\s+model",
    r"i\s+hope\s+this\s+helps!?",
    r"let\s+me\s+know\s+if\s+you\s+need\s+anything\s+else"
]


def audit_text(text: str, banned_words: list[str]) -> list[dict]:
    findings = []
    lines = text.split("\n")

    # Check line by line
    for idx, line in enumerate(lines, start=1):
        # 1. Banned words
        for word in banned_words:
            pattern = r"\b" + re.escape(word) + r"\b"
            if re.search(pattern, line, re.IGNORECASE):
                findings.append({
                    "line": idx,
                    "type": "Banned Cliché",
                    "match": word,
                    "content": line.strip()
                })

        # 2. Sycophancy
        for pattern in SYCOPHANCY_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append({
                    "line": idx,
                    "type": "Sycophantic Filler",
                    "match": pattern,
                    "content": line.strip()
                })

    return findings


def main():
    parser = argparse.ArgumentParser(description="Audit text for AI slop and clichés")
    parser.add_argument("paths", nargs="*", help="File or directory paths to audit")

    args = parser.parse_args()
    config = resolve_skill_config("humanizer-writing")
    banned_words = config.get("banned_words", [])

    total_findings = 0

    if not args.paths:
        if sys.stdin.isatty():
            print("Usage: audit_slop.py <files/dirs...> or pass via stdin", file=sys.stderr)
            sys.exit(1)
        raw = sys.stdin.read()
        findings = audit_text(raw, banned_words)
        if findings:
            print("🚨 AI Slop Detected in stdin:")
            for f in findings:
                print(f"  Line {f['line']}: [{f['type']}] '{f['match']}' -> {f['content']}")
            sys.exit(1)
        else:
            print("✅ Clean: No AI slop or banned clichés detected.")
            sys.exit(0)

    for p_str in args.paths:
        p = Path(p_str)
        files = [p] if p.is_file() else list(p.rglob("*.md")) + list(p.rglob("*.txt"))
        for file in files:
            try:
                content = file.read_text(encoding="utf-8")
                findings = audit_text(content, banned_words)
                if findings:
                    total_findings += len(findings)
                    print(f"\n🚨 Slop in {file}:")
                    for f in findings:
                        print(f"  Line {f['line']}: [{f['type']}] '{f['match']}' -> {f['content']}")
            except Exception as e:
                print(f"Could not read {file}: {e}", file=sys.stderr)

    if total_findings == 0:
        print("✅ Clean: No AI slop found in specified files.")
        sys.exit(0)
    else:
        print(f"\nTotal violations: {total_findings}")
        sys.exit(1)


if __name__ == "__main__":
    main()
