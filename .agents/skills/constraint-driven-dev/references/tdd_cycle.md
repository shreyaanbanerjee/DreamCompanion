# TDD Cycle & Constraint Invariants

## The 4-Phase Discipline

### 1. Specification & Constraint Lock
- Identify contracts, expected inputs, outputs, exceptions.
- Never write implementation code until the contract and edge cases are documented.

### 2. Red (Write Failing Test First)
- Write the exact assertion verifying the new functionality or reproducing the bug.
- Run the test suite: Ensure the test fails **specifically** for the expected reason (not syntax/import error).

### 3. Green (Minimal Implementation)
- Write only enough production code to turn the test green.
- Do not implement speculative features or prematurely optimize.
- Verify test passes cleanly.

### 4. Refactor & Verification
- Clean up duplication, naming, and abstractions.
- Run full regression suite to ensure zero collateral damage.
- Diff must not exceed `max_diff_lines_per_step`.
