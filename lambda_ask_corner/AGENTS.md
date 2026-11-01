# 'Ask Corner' Lambda Agent Guidelines (`lambda_ask_corner/`)

This directory contains the serverless AI chat service exposing the CSK Fan Lore Pack.

---

## 1. Concrete Commands

```bash
# Run Lambda handler test suite
PYTHONPATH=lambda_ask_corner .venv/bin/pytest lambda_ask_corner/test_handler.py -v

# Run targeted test for specific question
PYTHONPATH=lambda_ask_corner .venv/bin/pytest lambda_ask_corner/test_handler.py -k "test_ask_dhoni_question" -v
```

---

## 2. Architecture & Runtime Constraints

- **Runtime**: Python 3.11 on AWS Lambda.
- **Zero Heavy Dependencies**: Built using standard library `urllib.request` and `json` to achieve sub-second cold starts and minimal deployment package size.
- **Model Routing**:
  1. **Google Gemini**: Priority list `["models/gemini-3.5-flash", "models/gemini-3.8-flash", "models/gemini-flash-latest"]`.
  2. **Anthropic Claude**: `claude-3-5-sonnet-20241022` if `ANTHROPIC_API_KEY` is present.
  3. **Fan Lore Engine**: Built-in fallback engine in `handler.py` guaranteeing $0 zero-configuration functionality if keys are omitted.
- **CORS Requirements**: Must return standard API Gateway headers (`Access-Control-Allow-Origin: *`) for all `POST` and `OPTIONS` preflight responses.

---

## 3. Boundaries & Permissions

- **Autonomous**: Updating prompt templates, refining fan lore context, adding unit tests.
- **Restricted**: Introducing heavy third-party SDKs that increase cold-start latency or exceed Lambda payload constraints.

