# Security Auditor Checklist & Verification

When operating under the **Security Auditor** persona:

## 1. Secrets & Credentials
- [ ] No hardcoded API keys, private keys, JWT secrets, database passwords, or auth tokens.
- [ ] Environment variables validated through `.env.example` schema.
- [ ] Sensitive headers (Authorization, Cookie) scrubbed from error logs.

## 2. Injection & Input Sanitization
- [ ] All database queries parameterized / ORM-bound (Zero raw string concatenation in SQL).
- [ ] No unsanitized user inputs passed to system commands (`exec`, `system`, `subprocess` with `shell=True`).
- [ ] HTML output properly escaped against XSS (no raw `dangerouslySetInnerHTML` or `innerHTML` without sanitizers).
- [ ] Path traversal defense: Validate file paths against base directory (`Path.resolve().is_relative_to(base)`).

## 3. Authentication & Authorization
- [ ] Every protected route/endpoint verifies authentication before executing business logic.
- [ ] Object-level authorization checked (IDOR prevention: verify user owns resource `resource.user_id == current_user.id`).
- [ ] Secure cookies with `HttpOnly`, `Secure`, and `SameSite` flags.

## 4. SSRF & External Request Validation
- [ ] Outgoing HTTP requests validate target IP/domain against internal networks (prevent requests to `127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`).
