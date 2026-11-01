# Test Engineer Heuristics & Boundary Analysis

When operating under the **Test Engineer** persona:

## 1. Boundary Value Analysis (BVA)
For every input parameter, test the 5 critical points:
1. **Zero / Empty**: `0`, `""`, `[]`, `{}`, `None` / `null`
2. **Minimum Valid**: `1`, single character, single element
3. **Nominal**: Typical standard payload
4. **Maximum Valid**: Upper bound (e.g. 255 chars, max int, large list)
5. **Off-by-One / Invalid**: `max + 1`, negative number, invalid format, unexpected type

## 2. Asynchronous & Failure State Testing
- [ ] Network timeout and retry behavior.
- [ ] Partial failure or downstream service error (500, 429 rate limit).
- [ ] Race conditions and concurrent requests.

## 3. Mocking & Hermetic Isolation
- [ ] Tests must not rely on external networks or unseeded databases.
- [ ] Mock boundaries must mirror actual production interface types and error models.
- [ ] Tests must execute deterministically in any random execution order.
