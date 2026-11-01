---
name: systematic-debugging
description: >-
  Enforces scientific root-cause analysis, hypothesis testing, and the 5-Whys framework.
  Use this skill whenever investigating bugs, unexpected test failures, exceptions, race conditions,
  or performance regressions. Forbids speculative shotgun debugging.
---

# Systematic Debugging & Root Cause Analysis

This skill guides the agent to approach bugs scientifically rather than making speculative edits.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `systematic-debugging`:
- `forbid_speculative_fixes`: Strictly prohibits guessing fixes without reproducing first.
- `min_five_whys_depth`: Minimum depth (3) of causality trace.
- `require_regression_test`: Every fix must include a test asserting the bug never returns.

## 2. The 5-Step Protocol

1. **Deterministic Reproduction**: Create a minimal command or unit test reproducing the exact failure.
2. **State & Evidence Gathering**: Read logs, stack traces, and relevant variables.
3. **Formulate Falsifiable Hypothesis**: State the precise theoretical cause before touching code.
4. **Trace the 5 Whys**: Refer to [Five Whys Worksheet](./references/five_whys_worksheet.md) to drill down to the foundational cause, not just the symptom.
5. **Targeted Patch & Regression Test**: Apply the minimal surgical fix and verify the test passes.
