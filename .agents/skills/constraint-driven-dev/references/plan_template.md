# Architectural Plan Template

Use this structured format whenever presenting an implementation plan to the user:

```markdown
## Goal & Scope
- **Feature / Fix**: [Concise summary]
- **Target Boundaries**: [Files and modules touched vs excluded]

## Constraints & Invariants
- [ ] No regression on existing interfaces
- [ ] Maximum change size <= [max_diff_lines_per_step] lines per commit
- [ ] Explicit error handling without silent swallowing

## Step-by-Step Implementation Sequence
1. **Step 1: Test Scaffold (Failing Test)**
   - Add test case verifying [behavior] in `tests/test_x.py`
   - Run verification command: Verify it fails with expected assertion error (Red)
2. **Step 2: Minimal Code Implementation**
   - Implement the minimal logic in `src/x.py`
   - Run verification command: Verify it passes (Green)
3. **Step 3: Refactor & Clean**
   - Clean up code, remove temporary scaffolding, verify test still passes
4. **Step 4: Edge Case Coverage**
   - Test empty inputs, boundary values, network timeouts, invalid types
```
