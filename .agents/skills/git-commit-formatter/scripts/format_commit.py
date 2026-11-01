#!/usr/bin/env python3
"""
Conventional Commit Formatter & Validator for Antigravity Agents.

Inspects staged changes or formats commit messages according to
Conventional Commits rules and the project's .agents/skills.config.yaml.

Usage:
    python3 format_commit.py --type feat --scope auth --subject "add jwt token verification"
    python3 format_commit.py --validate "feat(auth): add jwt token verification"
    python3 format_commit.py --suggest
"""

import sys
import re
import subprocess
import argparse
from pathlib import Path

# Try to import resolve_skill_config from parent agents directory
sys.path.append(str(Path(__file__).resolve().parents[3] / "scripts"))
try:
    from resolve_skill_config import resolve_skill_config
except ImportError:
    def resolve_skill_config(skill_name):
        return {
            "format": "conventional",
            "max_header_length": 72,
            "max_body_line_length": 80,
            "ticket_prefix": "",
            "require_ticket_id": False,
            "types": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]
        }


def validate_message(msg: str, config: dict) -> tuple[bool, list[str]]:
    """Validate a commit message against rules."""
    errors = []
    lines = msg.strip().split("\n")
    header = lines[0].strip()

    max_len = config.get("max_header_length", 72)
    if len(header) > max_len:
        errors.append(f"Header length ({len(header)}) exceeds maximum of {max_len} characters.")

    types = config.get("types", [])
    type_regex = r"^(" + "|".join(types) + r")(\([a-zA-Z0-9_\-\./]+\))?(!)?:\s+(.+)$"
    match = re.match(type_regex, header)
    if not match:
        errors.append(f"Header must match pattern: <type>(<scope>): <subject>. Allowed types: {', '.join(types)}")
    else:
        subject = match.group(4)
        if subject[0].isupper():
            errors.append("Subject should start with a lowercase letter (e.g. 'add user login', not 'Add user login').")
        if subject.endswith("."):
            errors.append("Subject should not end with a period.")

    prefix = config.get("ticket_prefix", "")
    if config.get("require_ticket_id", False) and prefix:
        if not re.search(re.escape(prefix) + r"\d+", msg):
            errors.append(f"Commit must include a ticket ID matching '{prefix}<number>'.")

    return (len(errors) == 0, errors)


def suggest_from_staged() -> str:
    """Analyze git staged diff and produce a suggested commit structure."""
    res = subprocess.run(["git", "diff", "--staged", "--name-status"], capture_output=True, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        return "No staged changes detected. Run `git add <files>` first."

    lines = res.stdout.strip().split("\n")
    files = [l.split("\t")[-1] for l in lines]
    
    # Infer scope from path
    first_path = Path(files[0])
    scope = first_path.parts[0] if len(first_path.parts) > 1 else "root"
    if scope.startswith("."):
        scope = scope.lstrip(".")

    # Infer type
    if any("test" in f for f in files):
        inferred_type = "test"
    elif any(f.endswith(".md") for f in files):
        inferred_type = "docs"
    elif any("fix" in f or "bug" in f for f in files):
        inferred_type = "fix"
    else:
        inferred_type = "feat"

    return f"Suggested template:\n{inferred_type}({scope}): <imperative verb action>\n\nFiles modified: {', '.join(files[:5])}"


def main():
    parser = argparse.ArgumentParser(description="Git Commit Formatter & Validator")
    parser.add_argument("--type", choices=["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"])
    parser.add_argument("--scope", help="Commit scope (e.g., auth, ui, api)")
    parser.add_argument("--subject", help="Short commit description in imperative mood")
    parser.add_argument("--body", help="Optional commit body explanation")
    parser.add_argument("--breaking", action="store_true", help="Flag breaking change")
    parser.add_argument("--ticket", help="Ticket ID (e.g., DC-101)")
    parser.add_argument("--validate", help="Validate an existing commit message string")
    parser.add_argument("--suggest", action="store_true", help="Suggest commit based on staged files")

    args = parser.parse_args()
    config = resolve_skill_config("git-commit-formatter")

    if args.suggest:
        print(suggest_from_staged())
        return

    if args.validate:
        valid, errors = validate_message(args.validate, config)
        if valid:
            print("✅ Commit message is valid!")
            sys.exit(0)
        else:
            print("❌ Validation errors:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)

    if args.type and args.subject:
        scope_str = f"({args.scope})" if args.scope else ""
        breaking_mark = "!" if args.breaking else ""
        header = f"{args.type}{scope_str}{breaking_mark}: {args.subject}"
        
        parts = [header]
        if args.body:
            parts.append("")
            parts.append(args.body)
        if args.breaking:
            parts.append("")
            parts.append("BREAKING CHANGE: " + (args.body or args.subject))
        if args.ticket:
            parts.append("")
            parts.append(f"Refs: {args.ticket}")

        full_msg = "\n".join(parts)
        valid, errors = validate_message(full_msg, config)
        print("Generated Commit Message:\n" + "=" * 40)
        print(full_msg)
        print("=" * 40)
        if not valid:
            print("⚠️ Warnings:")
            for e in errors:
                print(f"  - {e}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
