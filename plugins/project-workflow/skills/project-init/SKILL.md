---
name: project-init
description: "Initialize an empty greenfield project's project-workflow baseline in Codex. Creates AGENTS.md, scoped rules, optional verified hooks, an ADR guide, and the domain index through an interactive stack-neutral setup. Use project-personalize for every non-empty existing codebase or copied scaffold."
---

# Project Init (Codex)

Match the user's language. This is the Codex-native adapter for the canonical action in [`../../docs/actions/project-init.md`](../../docs/actions/project-init.md). Read that file completely before acting; it wins on scope, outputs, invariants, and validation.

## Codex execution contract

- Resolve the plugin root as the nearest ancestor of this file containing `.codex-plugin/plugin.json`.
- Use the current Codex file and shell tools for inspection and edits. Prefer patch-based edits for generated text.
- Ask one baseline question or one tightly coupled group at a time. Infer only objective facts from manifests or prior answers.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before inspecting or validating `.claude/rules/` compatibility files.
- When a choice needs research, run the methodology in [`../../docs/reviewers/tech-researcher.md`](../../docs/reviewers/tech-researcher.md) in a general subagent when available; otherwise run it in the main session. The user makes the final choice.
- Before writing generated conventions, run [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) the same way. Must-fix findings block the write.

## Workflow

0. Resolve the target directory from the skill argument or cwd. Treat an absent path as an empty target but do not create it before the consolidated apply approval. If an existing target contains source, manifests, configuration, scaffold assets, or `AGENTS.md`, redirect to `$project-personalize`; this action is only for empty/genuinely new targets. If it is this plugin source repository, warn and require confirmation.
1. Determine single-tier vs multi-tier, language/framework, package manager, tests, lint, and tier names. Do not ask product-feature questions or invent deployment commands.
2. Read the plugin `template/`, `template/_multi_tier_examples/`, and [`reference.md`](reference.md). The shared reference tables are mandatory before rendering placeholders.
3. Create a disposable staging directory and run `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>`. The target must remain unchanged. The materializer excludes every reusable template/example/hook asset, honors target no-clobber state, and rejects symlinked destinations.
4. Render root `AGENTS.md`, path-scoped rules, tier guidance, aliases, and any confirmed safe hook entirely in staging; render the hook index from the staged final file set or remove it. Verify a hook against a matching staged file. Otherwise stage no hook files/mapping and report `hook: not installed + reason`.
5. Keep framework detail in scoped rule files; tier `AGENTS.md` contains only concise differences from the root. Enable the always-on security import when the rule has no path scope.
6. Show one consolidated target-mapped preview plus the decision-audit summary. After confirmation, apply once with `materialize-project-baseline.cjs --apply-staged <staging> <target>`; strict preflight rejects the whole population before copying if any destination now exists or is symlinked. Rejection or a blocking audit discards staging and leaves the target unchanged; copy errors roll back files created by that apply and are reported.
7. Validate the applied population, placeholders, rule frontmatter, bridge scope resolution, real path prefixes, command consistency, aliases, and line counts. If no hook is active, verify that no new project-local hook mapping/script exists. Report deferred commands and compact rule-source counts.

## Result

Report created files, inferred vs user-confirmed decisions, deferred items, validation status, and the next recommended action (`$feature-init <slug>`). Do not generate application code or commit changes.
