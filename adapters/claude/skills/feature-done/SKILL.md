---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their canonical specs; the main session reads one only when executing the allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Review applicability follows the actual risk and project requirements, not file names.
- Execute the complete canonical action with Bash against its selected Git population. A stop still writes the
  canonical receipt.
- Resolve the canonical convention population and dispatch `spec-reviewer` and `agents-md-reviewer` as directed.
  Claude L2 may include project-root `.claude/rules/`; include user-level `~/.claude/rules/` only when selected.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. For a non-READY verdict, map each blocker or blocker group to the canonical `Next` route before returning control under the action's continuation rules. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to the resolved receipt (default `spec.md#proof-bundle`); the full receipt remains on disk.

Apply the canonical verdict contract. Finish/delivery stops at `READY` with archive pending; enclosing
close/archive/submit intent continues to `/project-workflow:feature-archive` for the explicit feature.
