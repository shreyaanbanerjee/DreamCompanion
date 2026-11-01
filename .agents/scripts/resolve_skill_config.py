#!/usr/bin/env python3
"""
Universal Skill Configuration Resolver for Antigravity Agents.

Reads a skill's `config.default.yaml`, looks up the project's
`.agents/skills.config.yaml` for overrides, performs a deep merge,
and outputs or returns the resolved configuration dictionary.

Usage:
    python3 resolve_skill_config.py <skill-name> [--json | --yaml]
"""

import sys
import json
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None


def deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge override dictionary into base dictionary."""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def find_workspace_root(start_path: Path) -> Path:
    """Walk up until finding .agents or .git."""
    curr = start_path.resolve()
    for parent in [curr] + list(curr.parents):
        if (parent / ".agents").is_dir() or (parent / ".git").is_dir():
            return parent
    return curr


def resolve_skill_config(skill_name: str, workspace_root: Path = None) -> dict:
    """Resolve configuration for a skill by merging default with workspace override."""
    if workspace_root is None:
        workspace_root = find_workspace_root(Path.cwd())

    # 1. Path to skill's config.default.yaml
    skill_dir = workspace_root / ".agents" / "skills" / skill_name
    default_config_file = skill_dir / "config.default.yaml"
    
    defaults = {}
    if default_config_file.is_file() and yaml:
        with open(default_config_file, "r", encoding="utf-8") as f:
            defaults = yaml.safe_load(f) or {}

    # 2. Path to workspace override (.agents/skills.config.yaml)
    workspace_config_file = workspace_root / ".agents" / "skills.config.yaml"
    overrides = {}
    if workspace_config_file.is_file() and yaml:
        with open(workspace_config_file, "r", encoding="utf-8") as f:
            ws_data = yaml.safe_load(f) or {}
            skills_section = ws_data.get("skills", {})
            overrides = skills_section.get(skill_name, {})

    # 3. Merge
    return deep_merge(defaults, overrides)


def main():
    if len(sys.argv) < 2:
        print("Usage: resolve_skill_config.py <skill-name> [--json|--yaml]", file=sys.stderr)
        sys.exit(1)

    skill_name = sys.argv[1]
    output_format = "yaml" if "--yaml" in sys.argv or "--json" not in sys.argv else "json"

    resolved = resolve_skill_config(skill_name)

    if output_format == "json" or not yaml:
        print(json.dumps(resolved, indent=2))
    else:
        print(yaml.dump(resolved, default_flow_style=False, sort_keys=False))


if __name__ == "__main__":
    main()
