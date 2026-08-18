---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run the canonical completion preflight before expanded L1/review, including current full-lane artifact shape,
  unfinished work, completed slices and focused L1, primary flow, Git/scope/Baseline, and explicit Guidance Placement
  commitments. A stop still writes the receipt with the canonical `not-run(completion preflight)` states;
  this gate never invents slices, proof obligations, or guidance.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly with Bash. Do not
  expand checks or dispatch reviewers beyond those rules. Each explicit invocation performs at most one
  applicable L2/L3 dispatch cycle and ends on its first terminal verdict; do not repair or redispatch a failure
  inside this gate.
- Validate the owner-supplied review package before dispatch; later non-endpoint input drift stops the cycle.
- After required L1 passes, dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents for applicable
  boundaries under the canonical execution contract. Run them in parallel when capacity permits, otherwise
  sequentially; limited simultaneous slots are not fallback. Light lane uses conditional L2 and records L3 as
  N/A. L2 may include only project-root `.claude/rules/`, never user-level `~/.claude/rules/` unless the user
  explicitly selects them. Record `Reviewer execution` as required by the action.
- Reviewers are read-only. Update only canonical receipt/history and delivery-status outputs; never auto-fix
  code or commit. Focused re-review after separate fixes requires a later explicit invocation.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; do not inline the full receipt.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
