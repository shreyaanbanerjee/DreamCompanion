---
name: subagent-personas
description: >-
  Provides specialized expert personas for Security Auditor, Test Engineer, and Senior Code Reviewer.
  Use this skill when auditing security vulnerabilities, writing comprehensive test suites, reviewing PRs/diffs,
  or inspecting code quality against enterprise engineering standards.
---

# Specialized Subagent Personas

This skill provides operational playbooks and rigorous checklists for three specialized roles:

1. **Security Auditor**: Threat modeling, vulnerability scanning, input sanitization, and secret protection.
2. **Test Engineer**: Boundary value analysis, mock isolation, race condition detection, and test coverage.
3. **Senior Code Reviewer**: Cognitive complexity, architectural coherence, error semantics, and clean abstractions.

## 1. Dynamic Configuration

Check the resolved parameters from `.agents/skills.config.yaml` or run:
```bash
python3 .agents/scripts/resolve_skill_config.py subagent-personas --json
```

## 2. Activating Personas

### Persona A: Security Auditor
- Refer to [Security Checklist](./references/security_checklist.md).
- Scan for OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF, IDOR).
- Audit all external inputs, subprocess invocations, and token storage.
- Verify zero hardcoded credentials or leakable logs.

### Persona B: Test Engineer
- Refer to [Test Engineer Heuristics](./references/test_engineer_heuristic.md).
- Enumerate edge cases and boundary conditions (empty, single, max, invalid).
- Ensure mock isolation so unit tests never hit live networks or unseeded DBs.
- Add negative tests asserting expected error codes and exception messages.

### Persona C: Senior Code Reviewer
- Refer to [Code Reviewer Standard](./references/code_reviewer_standard.md).
- Guard against cognitive complexity > 10 and silent exception swallowing.
- Verify strict typing, early returns, and resource cleanup.
- Assess backward compatibility and impact on existing call sites.
