---
name: agents-md-revise
description: "Refresh project conventions in Codex by comparing AGENTS.md and scoped rules with objective repository state, proposing evidence-backed patches, and applying only user-approved critical drift fixes."
---

# Agents.md Revise (Codex)

Match the user's language. Read [`../../docs/actions/agents-md-revise.md`](../../docs/actions/agents-md-revise.md) completely before acting.

## Codex execution contract

- Scope is A-class engineering conventions only: root/nested `AGENTS.md` and scoped rules.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before resolving `.claude/rules/` compatibility scope.
- Use an inline trace matrix for a single-file patch that only synchronizes observed state. Use the decision-completeness auditor for new conventions, technical specifics, weak evidence, or cross-file generated patches.
- Findings require objective evidence. Do not turn preferences, pattern guesses, backlog, or product-domain changes into convention patches.
- Apply only changes the user approves; never commit automatically.

## Workflow

1. Read root and applicable nested `AGENTS.md`, `.claude/refresh-ignore`, and `.claude/drift-ledger.md` when present. Resolve `.claude/rules/` through the Codex bridge for the requested tier/rule scope; read global, matching, and ambiguous rules and record definite non-matches.
2. Extract testable statements about commands, dependencies/versions, directory structure, ports/configuration, framework rules, and tier boundaries.
3. Inspect manifests, lockfiles, tool-version files, actual directories, configuration examples, and recent relevant commits.
4. Compare each convention statement with objective state. Every drift item must cite old text, observed state, evidence source, and a narrow proposed patch.
5. Respect semantic matches in the refresh-ignore file. Cluster repeated drift-ledger entries and recommend codification only when evidence supports a durable convention.
6. Report coarse current-truth freshness separately as read-only advisory; never edit product-domain documents in this action.
7. Report old zero-reference ADRs separately as advisory; they do not enter the convention apply flow.
8. Present at most five drift decisions per batch. The user may apply, skip, ignore permanently, or stop.
9. Simulate approved patches and run the complexity-triggered trace/audit. Missing trace or must-fix findings block application.
10. Apply approved patches atomically, remove resolved drift-ledger lines, write approved permanent ignores, and show the final diff.

Report applied and skipped drift, evidence, trace/audit result and trigger reason, compact bridge counts plus applicable/ambiguous paths, advisory items, unresolved questions, and a commit-message draft.
