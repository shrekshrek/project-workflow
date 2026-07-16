---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run project checks with Bash and capture executable evidence even when another independent layer fails.
- Dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents under the canonical execution contract. L2 may include only project-root `.claude/rules/`, never user-level `~/.claude/rules/` unless the user explicitly selects them.
- Reuse same-session reviewer results only when scope and all reviewer inputs are provably unchanged; state reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical `## Proof Bundle` receipt and the allowed READY status marker; never auto-fix code or commit.
- For a full-lane PASS, persist only reviewer verdict and baseline; never persist applicable IDs or populations.
- Persist `Reviewer execution`, re-read the receipt structurally, and return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
