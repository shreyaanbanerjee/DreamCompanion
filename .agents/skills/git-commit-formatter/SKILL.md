---
name: git-commit-formatter
description: >-
  Formats and validates Git commit messages following Conventional Commits standards.
  Use this skill whenever staging git changes, creating commit messages, reviewing git history,
  or preparing pull requests.
---

# Git Commit Formatter

This skill automates the creation and validation of Conventional Commits to maintain a clean, semantic git history.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `git-commit-formatter`:
- `max_header_length`: 72 characters max for subject line.
- `types`: Allowed commit types (`feat`, `fix`, `docs`, `refactor`, `test`, etc.).
- `ticket_prefix`: Optional ticket ID format (e.g. `DC-`).
- `require_ticket_id`: Whether a ticket reference is mandatory.

## 2. Format Specification

```text
<type>(<scope>): <lowercase imperative verb subject>

[optional body explaining 'why' and context]

[optional footer(s): BREAKING CHANGE, Refs: DC-123]
```

### Commit Types
- `feat`: A new user-facing feature or API capability.
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `docs`: Documentation only changes.
- `chore`: Maintenance, dependencies, tooling updates.

## 3. Helper Script Usage

Run the bundled commit assistant:

```bash
# Suggest a commit from currently staged git changes
python3 .agents/skills/git-commit-formatter/scripts/format_commit.py --suggest

# Generate and validate a commit message
python3 .agents/skills/git-commit-formatter/scripts/format_commit.py \
  --type feat \
  --scope auth \
  --subject "add session token validation" \
  --body "Validates incoming Bearer tokens against the redis cache before route handler dispatch."

# Validate an existing commit string
python3 .agents/skills/git-commit-formatter/scripts/format_commit.py --validate "feat(api): add health check endpoint"
```
