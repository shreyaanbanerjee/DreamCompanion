---
name: json-to-pydantic
description: >-
  Converts raw JSON payloads or API responses into structured, typed Pydantic v2 models.
  Use this skill whenever working with external API data, schema migrations, REST/GraphQL payloads,
  or generating strongly typed Python data models.
---

# JSON to Pydantic v2 Generator

This skill converts raw JSON payloads into production-ready, type-hinted Pydantic v2 classes with automated sub-model extraction, ISO datetime/UUID detection, and camelCase-to-snake_case aliasing.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `json-to-pydantic`:
- `pydantic_version`: 2 (supports V2 `ConfigDict` and `Field`).
- `datetime_detection`: Auto-detects ISO-8601 strings to `datetime.datetime`.
- `uuid_detection`: Auto-detects UUID v4 strings to `uuid.UUID`.
- `use_frozen_models`: Generates immutable models (`ConfigDict(frozen=True)`).

## 2. CLI Script Usage

Run the bundled model generator script:

```bash
# Convert a JSON file to Pydantic models
python3 .agents/skills/json-to-pydantic/scripts/json_to_pydantic.py payload.json --root-name UserProfile

# Pipe JSON directly from curl or jq
curl -s https://api.github.com/repos/google/gemini | python3 .agents/skills/json-to-pydantic/scripts/json_to_pydantic.py --root-name GithubRepo
```

## 3. Best Practices
1. Group generated models in a dedicated `schemas/` or `models/` module.
2. Use `model_validate()` instead of deprecated `parse_obj()`.
3. Leverage `populate_by_name=True` so models accept both camelCase JSON keys and snake_case Python attributes.
