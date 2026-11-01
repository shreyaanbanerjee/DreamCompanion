---
name: dev-cycle
description: >-
  Automates the end-to-end developer pipeline for DreamCompanion features:
  chains Product Manager, Frontend Engineer, Backend Engineer, and QA/Security personas.
---

# Developer Cycle Pipeline (`/startcycle`)

This skill coordinates specialized personas to implement features or fixes through an automated pipeline.

## Pipeline Stages

```mermaid
flowchart TD
    A["Stage 1: Product Manager & Architect\nFormulates constraints, acceptance criteria, and plan"]
    B["Stage 2: Core Engineering\nTDD implementation for Frontend and Backend"]
    C["Stage 3: Security Auditor\nScans credentials, OWASP compliance, and boundaries"]
    D["Stage 4: QA Engineer\nRuns verification suites and pre-flight checks"]

    A --> B --> C --> D
```

### Stage 1: Product Manager & Architect
- Reads requirements and checks `.agents/skills.config.yaml`.
- Establishes acceptance criteria, file boundaries, and non-goals.
- Requires signoff before executing code modifications.

### Stage 2: Core Engineering
- **Backend**: Implements Pydantic V2 models and FastAPI simulator routes under `backend/`.
- **Frontend**: Implements clean, broadcast-grade UI components under `frontend/src/components/`. Forbids cartoon icons or AI template clutter.
- Runs local unit tests during Red-Green-Refactor cycles.

### Stage 3: Security Auditor
- Audits `.env` and checks that no sensitive API keys or credentials are committed.
- Verifies CORS headers and input validation sanitization.

### Stage 4: QA Engineer & Preflight
- Executes `./scripts/test_all.sh` (backend tests, lambda tests, frontend bundle, and CDK synth).
- Executes `python3 .agents/skills/production-readiness/scripts/preflight_check.py`.

