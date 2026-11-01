---
name: humanizer-writing
description: >-
  Eliminates formulaic AI writing patterns, sycophantic greetings, and buzzword fluff.
  Use this skill whenever drafting documentation, pull request descriptions, commit messages,
  architectural notes, user-facing explanations, or technical guides.
---

# Humanizer & Anti-AI Slop

This skill enforces concise, high-signal, authentic technical communication by purging robotic tropes, hedging, and conversational filler.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `humanizer-writing`:
- `tone`: `concise-engineering`.
- `ban_ai_cliches`: Purges "delve", "tapestry", "beacon", "testament", "orchestrating", etc.
- `direct_answering`: Prohibits preamble and throat-clearing ("Certainly! I can help you with that!").
- `forbid_sycophancy`: Strictly eliminates patronizing flattery.

## 2. Playbook & Standards

1. **Delete the Preamble**: Start immediately with the action, code, or answer.
2. **Review the Catalog**:
   - Check [Banned Patterns Catalog](./references/banned_patterns.md).
   - Follow [Voice Guidelines](./references/voice_guidelines.md).
3. **Run the Slop Auditor**:
   ```bash
   python3 .agents/skills/humanizer-writing/scripts/audit_slop.py README.md
   ```

## 3. Transformation Examples
- ❌ *"Certainly! In this section, we will delve into the multifaceted tapestry of our authentication system..."*
- ✅ *"The authentication system verifies JWT tokens via HMAC-SHA256 and caches session status in Redis."*
