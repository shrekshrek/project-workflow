# Optional personalization evidence catalog

This file is an on-demand aid for `project-personalize`, not a policy or questionnaire. Read only the section relevant to an observed repository fact or an unresolved user decision. Never use an example below as a default.

## Evidence order

1. Executable project configuration, manifests, lockfiles, CI, and existing paths.
2. Applicable root/nested `AGENTS.md` and selected host-private convention files.
3. Explicit user decisions in the current session.
4. Ecosystem convention only as a labeled proposal requiring confirmation.

If the first three sources do not establish a value, leave it deferred or ask only the questions needed to decide it. Do not invent branch naming, Git platform, commit format, coverage targets, test layers, test matrices, E2E tools, deployment commands, module organization, ports, databases, or framework versions. A discovered test command is an available capability, not an every-feature mandate unless project evidence says so.

## Path-scope examples

Use actual repository paths and file extensions. These are syntax examples only:

| Repository evidence | Possible path scope |
|---|---|
| Python package plus central tests | `<package>/**/*.py`, `tests/**/*.py` |
| TypeScript/Vue source | `src/**/*.{ts,tsx,js,jsx,vue}` |
| Colocated JS tests | `**/*.test.{ts,tsx,js,jsx}` |
| Go packages | `**/*.go`, `**/*_test.go` |
| Rust crate | `src/**/*.rs`, `tests/**/*.rs` |

For multi-tier repositories, prefix scopes with the observed tier path. Prefer a conservative exact scope over a guessed broad glob. Validate that every selected scope matches an existing or intentionally planned path.

## Structure survey prompts

Ask only when repository evidence cannot answer a decision that affects generated guidance:

- Which directory owns the change or runtime entry point?
- Which observed command is authoritative for dev, test, lint, build, or migration?
- Is an unusual module boundary intentional or stale scaffold structure?
- Does a selected host-private convention need repair?
- Is a proposed tier boundary durable enough for a nested `AGENTS.md`?

Do not ask for framework, ORM, database, UI library, state manager, or test tool when manifests/configuration already answer it. Do not recommend creating ADRs for ordinary stack detection; use an ADR only under the canonical `ADR_REQUIRED` rule.

## Host-private assets

- Existing `.claude/rules/` may be validated when selected; do not translate them into Codex policy.
- `_multi_tier_examples/` and other plugin examples remain reference assets; never copy them into a target by default.

## Optional high-impact path declarations

This is not part of the generated baseline or default personalization flow. Only when an existing project convention already declares high-impact paths, or the user explicitly asks to add them, use `<glob> — <why failure is hard to recover>`. Do not infer impact from path names; no section is required when the project does not use this optional guardrail.
