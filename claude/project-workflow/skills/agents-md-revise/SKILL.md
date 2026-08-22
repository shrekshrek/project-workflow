---
name: agents-md-revise
description: Refresh project conventions by comparing AGENTS.md and explicitly selected host-specific rules with objective repository state, then applying authorized drift fixes.
---

# Agents.md Revise

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional scope. Root/applicable nested `AGENTS.md` are the default; include `.claude/rules/` only when the user explicitly selects them.
- Use Read/Grep/Glob/Bash for evidence. Missing `AGENTS.md` redirects to `/project-workflow:project-personalize`.
- Use inline trace for sourced synchronization; dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Ask only for material ambiguity or new policy; do not reconfirm objective stale-value synchronization item by item.
- Include the canonical Guidance Placement audit: path-local root rules, child-parent duplication, evidence-
  backed missing local guidance, malformed/missing adopted one-line aliases, orphan guidance, and rules better
  mechanized. Propose evidence-backed keep/move/create/delete/mechanize patches; never judge architecture,
  create for symmetry, or move root text while consumers remain outside the subtree.
- Apply only convention edits authorized by the current request or an explicit follow-up decision. Do not edit
  product specs, implementation code, or commit.

Report applied/skipped drift, evidence, applicable audit execution/results, and unresolved questions.
