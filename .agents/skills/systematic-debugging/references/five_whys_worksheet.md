# Five Whys & Root Cause Isolation Worksheet

When investigating a bug, complete this systematic evaluation before altering code:

```markdown
## 1. Minimal Deterministic Reproduction
- **Trigger**: [Exact command, API call, or user click]
- **Observed Behavior**: [Exact stack trace, error code, or visual anomaly]
- **Expected Behavior**: [What should have happened]

## 2. Hypothesis Formulation
- **Hypothesis**: "The failure occurs because [Component X] receives [State Y] from [Source Z] during [Condition W]."
- **Proof Mechanism**: Add a temporary log or breakpoint to confirm State Y occurs *before* editing logic.

## 3. Five-Whys Depth Trace
1. *Why did it fail?* -> Function returned 500 error.
2. *Why did it return 500?* -> Null pointer dereference on `user.profile`.
3. *Why was `user.profile` null?* -> The auth middleware didn't populate the profile relation.
4. *Why didn't the auth middleware populate it?* -> The database query omitted the `include: { profile: true }` join.
5. *Why was the join omitted?* -> The recent refactor updated the ORM schema without updating this query call site.

## 4. Root Cause Fix & Regression Guard
- **Fix**: Update the ORM query to include the profile relation.
- **Regression Test**: Test case passing an account without a cached profile asserting 200 OK.
```
