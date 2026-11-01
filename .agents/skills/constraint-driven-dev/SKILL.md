---
name: constraint-driven-dev
description: >-
  Enforces strict software architecture discipline, planning, test-driven development (TDD),
  and atomic incremental implementation. Use this skill whenever building a new feature, refactoring
  critical modules, implementing complex backend or frontend logic, or fixing high-impact bugs.
---

# Constraint-Driven Development & Superpowers

This skill guides the agent in enforcing strict architectural boundaries, Test-Driven Development (TDD), and incremental verifiable changes.

## 1. Dynamic Configuration

Check the resolved parameters from `.agents/skills.config.yaml` or run:
```bash
python3 .agents/scripts/resolve_skill_config.py constraint-driven-dev --json
```

Key parameters:
- `strict_tdd` (boolean): When true, you MUST write or specify the test before any production code.
- `require_plan_signoff` (boolean): When true, you must provide a structured plan before editing core files.
- `max_diff_lines_per_step` (integer): Maximum diff lines per editing step (default: 150).
- `verification_command` (string): Auto or explicit command to run tests (`pytest`, `npm test`, etc.).

## 2. Core Protocol

### Phase 1: Constraint & Plan Formulation
1. Consult the [Plan Template](./references/plan_template.md).
2. Detail the exact goal, inputs, outputs, edge cases, and non-goals.
3. Formulate the verification criteria before editing any code.

### Phase 2: Test-First Scaffolding (Red)
1. Read the [TDD Cycle](./references/tdd_cycle.md).
2. Create or update a test file asserting the desired behavior.
3. Execute the test command to verify it fails with the expected failure mode.

### Phase 3: Minimal Viable Implementation (Green)
1. Implement the minimal code strictly needed to satisfy the test.
2. Keep edits under `max_diff_lines_per_step`.
3. Rerun the test command to verify green status.

### Phase 4: Refactor & Invariant Guard
1. Verify that no regressions were introduced.
2. Check for clean code, typed signatures, and defensive error handling.
