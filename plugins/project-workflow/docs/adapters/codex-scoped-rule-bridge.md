# Codex scoped-rule bridge

Codex has native hierarchical `AGENTS.md` discovery, but it does not natively load Claude Code `.claude/rules/*.md` as path-scoped coding instructions. Project-workflow Codex actions use this bridge when those files exist. The files remain Claude adapter assets and A-class compatibility inputs; this contract does not change Claude runtime behavior.

## Scope resolution

1. Discover `.claude/rules/**/*.md` recursively. Ignore `_examples/` and files that are not active rules.
2. Read frontmatter first and normalize supported scope metadata:
   - `paths:` as a quoted/unquoted scalar or YAML list;
   - legacy `globs:` as a comma-separated scalar;
   - neither field means global scope.
3. If both `paths` and `globs` exist, use their union only when they are semantically compatible. Conflicting fields are ambiguous.
4. Match normalized patterns against the complete target population:
   - planned module/file scope for initialization and revision actions;
   - actual changed files for `feature-done` L2;
   - the requested tier/rule scope for `agents-md-revise`.
5. Fresh-read the full body of every global or matching rule before generating implementation context, revising module decisions, or running L2.

## Conservative fallback

Never silently skip a rule whose scope cannot be parsed or matched reliably. Fresh-read it, label the scope ambiguous, and surface the ambiguity to the caller. If the ambiguity may hide a critical rule, it blocks an apply/readiness verdict until clarified.

## Reporting contract

Report four sets with paths:

- global rules read;
- scoped rules matched and read;
- scoped rules skipped as definite non-matches;
- malformed, conflicting, or otherwise ambiguous rules read conservatively.

For `feature-init` and `spec-revise`, include the matched/global rule paths in the implementation handoff so a resumed or new Codex session can fresh-read them. For `feature-done`, include the L2 rule-source set and ambiguities in the proof bundle. L3 receives the change spec as its baseline and must not inherit A-class rules as requirements.

## Non-goals

- Do not create coding-convention files under `.codex/rules/`; that Codex surface controls command approval policy.
- Do not copy full Claude rule bodies into `AGENTS.md` or feature artifacts.
- Do not modify Claude-native skills, agent wrappers, rule loading, or template semantics.
