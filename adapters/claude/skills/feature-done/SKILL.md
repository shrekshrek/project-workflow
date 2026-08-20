---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run the canonical completion preflight before expanded L1/review, including semantic implementation readiness,
  unfinished work, completed tasks and declared checks, any useful early actor-to-result journey,
  Git/scope boundaries, and explicit Guidance Placement
  commitments. A stop still writes the canonical receipt.
  The preflight evaluates only phases, proof obligations, and guidance already declared by the accepted
  artifact and project conventions.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly with Bash. Do not
  expand checks or dispatch reviewers beyond those rules. Review one stable final snapshot and end on its
  terminal verdict. After an in-scope fix, only a later explicit user request runs a fresh reviewer snapshot;
  reuse only still-valid L1 evidence.
- Validate the owner-supplied review package before dispatch; later non-endpoint input drift stops the cycle.
- After required L1 passes, dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents for applicable
  boundaries under the canonical execution contract. Run them in parallel when capacity permits, otherwise
  sequentially. Light lane uses conditional L2 and records L3 as N/A. L2 may include only project-root
  `.claude/rules/`, never user-level `~/.claude/rules/` unless the user explicitly selects them.
- Reviewers are read-only. After this endpoint returns, the enclosing implementation may apply an unambiguous
  in-scope fix, but it must not re-enter this skill automatically. Reviewer agents never edit code or commit;
  material product or scope decisions return to the user.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; do not inline the full receipt.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
