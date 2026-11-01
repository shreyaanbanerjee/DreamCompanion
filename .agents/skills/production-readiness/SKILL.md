---
name: production-readiness
description: >-
  Executes pre-flight release and production readiness audits.
  Use this skill prior to opening a pull request, tagging a release, merging branches,
  deploying to staging/production, or scanning for accidental secrets and debug logging.
---

# Production Readiness & Pre-Flight Guard

This skill automates pre-flight verification to catch common production pitfalls before code is committed or deployed.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `production-readiness`:
- `block_merge_on_uncommitted_env`: Prevents committing secrets or `.env` files.
- `block_console_logs`: Flags stray `console.log` / `pdb` / `debugger` in production paths.
- `enforce_error_boundaries`: Checks for unhandled async catches or missing fallbacks.
- `secret_detection_patterns`: RegEx scans for exposed API keys, private keys, and tokens.

## 2. Pre-Flight Protocol

Run the automated scanner:
```bash
python3 .agents/skills/production-readiness/scripts/preflight_check.py
```

## 3. Checklist Items
- [ ] No uncommitted environment variables or secrets.
- [ ] Clean test suite passing without skips or flake.
- [ ] Error handling coverage across all I/O, database, and network boundaries.
- [ ] No temporary `console.log` or debug statements left behind.
- [ ] Clean Conventional Commit history ready for PR.
