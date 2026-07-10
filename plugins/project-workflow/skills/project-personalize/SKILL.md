---
name: project-personalize
description: "Adapt a copied scaffold or retrofit a non-empty existing codebase to project-workflow in Codex. Creates, repairs, or personalizes AGENTS.md, scoped rules, commands, tiers, paths, and conventions. Use project-init only for an empty greenfield directory."
---

# Project Personalize (Codex)

Match the user's language and preserve each file's language. Read and follow [`../../docs/actions/project-personalize.md`](../../docs/actions/project-personalize.md) completely before acting.

## Codex execution contract

- Work only inside the resolved target repository.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json` before copying any baseline template.
- Use a general subagent for reviewer methodology when useful; custom agent names are not required.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before inspecting `.claude/rules/` compatibility files.
- Run the codebase-explorer methodology for structure surveys. Use an inline trace matrix for simple evidence-backed synchronization; use the decision-completeness auditor only for new technical specifics, weak evidence, or generated decisions spanning multiple files.
- Preserve user changes and request confirmation before replacing demonstrably stale scaffold values.

## Workflow

0. Resolve the target directory. If it is empty apart from version-control metadata, stop and recommend `$project-init`. Otherwise classify the baseline as complete, partial/custom, or missing; all three non-empty cases continue in retrofit mode.
1. Inspect root/tier `AGENTS.md`, one-line compatibility aliases, `.codex/`, manifests, and shallow project structure. Inventory `.claude/rules/` frontmatter through the Codex bridge before reading matched bodies.
2. Present the applicable scopes: create or complete the baseline; replace scaffold defaults; repair tier-level guidance; survey the codebase and update Project Structure. Baseline creation/completion is selected by default when partial or missing.
3. For a missing baseline, stage with `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>`; do not write the target. Preserve useful partial/custom guidance in proposed content. Render the hook index from final proposed paths or remove it. Propose a new hook only for a confirmed safe sub-five-second per-file command; otherwise propose none. Preserve existing project hooks unless the user approves repair/removal.
4. If surveying structure, follow the canonical codebase-explorer report and show it before editing `AGENTS.md`.
5. Ensure always-on security guidance is actually imported, normalized rule scopes match real paths, tier aliases point to their local `AGENTS.md`, and example assets did not become active rules. Read ambiguous rules conservatively; ambiguity that may hide a critical rule blocks application.
6. Run the complexity-triggered trace/audit on proposed inline/staged contents. Missing trace or must-fix findings block application; show warning-level defaults to the user.
7. Preflight unchanged file baselines and staged destinations, then show one consolidated diff/new-file list. Only after approval apply the staged baseline plus existing-file patches. Strict staged preflight rejects the whole new-file population before copying on any conflict/symlink; copy errors roll back files created by that apply. Rejection, audit failure, or drift discards the proposal and leaves the target unchanged. Then validate placeholders, frontmatter, path scopes, commands, aliases, and AGENTS.md length. Report hook status as active/verified, existing/unverified, or not installed; a new baseline must not retain a no-op mapping.

Report changed values, files touched, evidence sources, hook status, compact bridge counts plus applicable/ambiguous paths, unresolved decisions, and suggested next action. Do not commit automatically or rewrite historical feature specs.
