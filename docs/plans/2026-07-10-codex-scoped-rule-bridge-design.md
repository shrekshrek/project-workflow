# Codex scoped-rule bridge design

> Date: 2026-07-10
> Status: approved

## Goal

Make Codex project-workflow actions read applicable A-class path-scoped rules before they create implementation context or review changes, without changing Claude Code runtime behavior.

## Boundaries

- Change only the Codex adapter, Codex-specific sections of canonical/adapter documentation, mechanical adapter checks, and paired release metadata.
- Do not modify root `skills/`, `agents/`, Claude rule templates, Claude settings, or generated project `AGENTS.md` content.
- Repository `AGENTS.md` may clarify the pre-existing Codex skill language convention without changing the Claude-native convention.
- Do not use `.codex/rules/*.rules`; that surface controls command approval, not coding conventions.
- Keep L2 responsible for A-class convention compliance and L3 responsible only for the frozen change spec.
- Direct Codex work that bypasses project-workflow continues to rely on native `AGENTS.md` discovery.

## Bridge contract

1. Discover `.claude/rules/**/*.md` when the directory exists; treat the files as Codex compatibility input, not Codex-native instructions.
2. Inventory frontmatter before the implementation scope is known.
3. Accept current `paths` as a scalar or YAML list and legacy `globs` as a comma-separated scalar. A file with neither is global.
4. After target modules or changed files are known, fresh-read every global or matching rule body before producing implementation context or running L2.
5. If frontmatter is malformed, conflicting, or cannot be matched reliably, read the rule conservatively and report the ambiguity instead of silently skipping it.
6. Report matched rules, global rules, skipped non-matches, and ambiguities. A resumed implementation handoff must name the matched rule files so a new Codex session can fresh-read them.

## Adapter coverage

- `project-init`: validate that generated compatibility rules can be inventoried and report deferred/ambiguous scope metadata.
- `project-personalize`: validate scopes against real paths and include bridge ambiguities in the apply gate.
- `feature-init`: inventory first, then resolve and read matching rules after module ownership is known; include them in the implementation handoff.
- `spec-revise`: recompute matching rules when the affected module or boundary changes.
- `feature-done`: resolve rules against the actual changed-file population before L2; never pass them into L3 as a baseline.
- `agents-md-revise`: use the same scope resolution when auditing A-class drift.

## Validation

- All six Codex skills reference one canonical bridge document.
- Claude-native `skills/` and `agents/` have no bridge dependency or runtime diff.
- Codex skills remain below 200 lines and contain no Claude-only interaction markers.
- Plugin docs/template sync and adapter parity checks pass.
