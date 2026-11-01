#!/usr/bin/env python3
"""
Pre-Flight Production Readiness Check for Antigravity Agents.

Runs automated scans for:
- Exposed secrets and private keys
- Stray debug statements (console.log, debugger, pdb.set_trace)
- Uncommitted sensitive files (.env, .pem, .key)
- Basic repository integrity

Usage:
    python3 preflight_check.py
"""

import sys
import re
import subprocess
from pathlib import Path

# Try to import resolve_skill_config
sys.path.append(str(Path(__file__).resolve().parents[3] / "scripts"))
try:
    from resolve_skill_config import resolve_skill_config
except ImportError:
    def resolve_skill_config(skill_name):
        return {
            "block_console_logs": True,
            "secret_detection_patterns": [
                r"(?i)api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9_\-]{16,}['\"]",
                r"(?i)secret[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9_\-]{16,}['\"]",
                r"(?i)ghp_[a-zA-Z0-9]{36}"
            ]
        }


def check_git_status() -> list[str]:
    issues = []
    res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if res.returncode == 0:
        for line in res.stdout.strip().split("\n"):
            if not line:
                continue
            status, filepath = line[:2], line[3:]
            if any(filepath.endswith(ext) for ext in [".env", ".key", ".pem", ".pfx", "id_rsa"]):
                issues.append(f"Sensitive file tracked or unignored in git: {filepath}")
    return issues


def scan_source_files(workspace_root: Path, config: dict) -> list[str]:
    issues = []
    patterns = [re.compile(p) for p in config.get("secret_detection_patterns", [])]
    debug_pattern = re.compile(r"\b(console\.log|debugger|import\s+pdb|pdb\.set_trace|breakpoint\(\))\b")
    
    ignore_dirs = {".git", ".agents", "node_modules", "dist", "build", ".venv", "venv", "__pycache__"}

    for path in workspace_root.rglob("*"):
        if path.is_file() and not any(part in ignore_dirs for part in path.parts):
            if path.suffix in [".py", ".js", ".ts", ".jsx", ".tsx", ".json", ".yaml", ".yml", ".md"]:
                try:
                    text = path.read_text(encoding="utf-8", errors="ignore")
                    # Check secrets
                    for p in patterns:
                        if p.search(text):
                            issues.append(f"Potential secret pattern match in: {path.relative_to(workspace_root)}")
                            break
                    # Check debug statements
                    if config.get("block_console_logs", True) and path.suffix in [".js", ".ts", ".jsx", ".tsx", ".py"]:
                        for idx, line in enumerate(text.split("\n"), start=1):
                            if debug_pattern.search(line) and not line.strip().startswith("//") and not line.strip().startswith("#"):
                                issues.append(f"Stray debug statement in {path.relative_to(workspace_root)}:{idx} -> {line.strip()}")
                except Exception:
                    pass
    return issues


def main():
    root = Path(__file__).resolve().parents[3]
    config = resolve_skill_config("production-readiness")
    
    print("🚀 Running Production Readiness Pre-Flight Check...")
    git_issues = check_git_status()
    source_issues = scan_source_files(root, config)

    all_issues = git_issues + source_issues

    if all_issues:
        print("\n❌ Pre-Flight Check Failed with issues:")
        for issue in all_issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("\n✅ All Pre-Flight checks passed! Ready for production deployment/merge.")
        sys.exit(0)


if __name__ == "__main__":
    main()
