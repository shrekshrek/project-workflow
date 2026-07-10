# Claude rule paths and hook hardening design

> Date: 2026-07-10
> Status: implemented in v3.4.0
> Reference: current Claude Code rules documentation

## Goal

Align generated Claude rules with the current official `paths:` YAML-list format, remove the obsolete description-length gate, and make the shared edit hook tolerate malformed event input.

## Decisions

1. New and validated `.claude/rules/**/*.md` files use `paths:` with a YAML list for path scope.
2. A rule without `paths:` is global and is discovered automatically; generated `AGENTS.md` files do not import `.claude/rules/` manually.
3. Historical scope keys and scalar scope forms are unsupported. Project personalization must migrate them instead of preserving runtime compatibility.
4. `description:` remains useful human metadata, but has no mechanical character limit. It should be concise and specific.
5. The Codex scoped-rule bridge parses the same `paths:` YAML-list contract only. Unsupported or malformed scope metadata is ambiguous and follows the existing conservative blocking policy.
6. Malformed hook JSON emits a short warning and exits successfully without attempting lint commands.

## Implementation surface

- Canonical workflow, action, reviewer, and cross-tool documentation.
- Claude-native project initialization, personalization, feature, delivery, and convention-refresh skills.
- Shared rule templates and framework examples.
- Codex bridge contract and its six consuming skills where wording depends on scope parsing.
- Mechanical checks for rule frontmatter and hook input handling.
- Synced Codex plugin release artifacts.

## Validation

- Every active/example rule template is either a `paths:` YAML-list rule or a global rule.
- Generated assets and instructions contain no active historical scope key.
- Description text is present where expected but no character limit is enforced.
- Hook smoke cases cover valid file input, empty input, malformed JSON, and Codex patch input.
- Adapter parity, plugin validation, template sync, skill validation, and Claude/Codex isolation checks pass.
