---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run project checks with Bash and capture executable evidence even when another independent layer fails.
- Dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents for applicable boundaries under the canonical execution contract. Full lane requires both: dispatch them in parallel when capacity permits, otherwise sequentially; single-slot capacity is not fallback. Light lane uses conditional L2 and always records L3 as N/A. L2 may include only project-root `.claude/rules/`, never user-level `~/.claude/rules/` unless the user explicitly selects them.
- Use focused re-review only in the same task while the original full-population evidence remains available and unaffected inputs are unchanged. Otherwise rerun the full population. Reuse same-session results only when scope, all reviewer inputs, and the applicable population are provably unchanged; the declared receipt/status write is the only allowed endpoint-output difference. State reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical `## Proof Bundle` receipt and the allowed READY status marker; never auto-fix code or commit.
- Before writing endpoint-owned receipt/status outputs, capture exactly one valid Git identity: exact commit SHA with `dirty=no`, or current worktree with `dirty=yes`; those edits do not change the recorded dirty status. Reject other pairings. Do not persist a manual path list or population hash. For a PASS, persist only applicable reviewer verdict and baseline; never persist applicable IDs or populations.
- Persist `Reviewer execution`, re-read the receipt structurally, and return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
