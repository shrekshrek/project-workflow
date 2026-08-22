# agents-md-revise

Canonical action for refreshing project conventions.

## Use When

- The project has evolved and root/nested `AGENTS.md` or host-specific convention files may be stale.
- Commands, directories, package managers, dependencies, or tier boundaries changed.
- The user explicitly wants convention drift reviewed.
- Guidance placement may have drifted: root rules are path-local, child files duplicate parents, a durable
  tier/module exception lacks local guidance, an alias is malformed, or a guided subtree moved/disappeared.

Do not use to rewrite historical feature specs, create backlog items, or make subjective product-roadmap changes.

## Inputs

- Root and nested `AGENTS.md`.
- Host-specific convention files selected for this run, if any.
- Objective project state: manifests, commands, directory layout, config files, and recent relevant changes.
- User decisions that establish new policy or resolve material ambiguity.

## Outputs

- Drift report with objective evidence.
- Convention edits authorized by the current request or an explicit follow-up decision.
- Summary of applied changes and follow-up manual review.
- A Guidance Placement audit with evidence-backed keep/move/create/delete/mechanize proposals; apply only
  changes authorized by the current request or an explicit follow-up decision.

## Workflow

1. Resolve root/nested `AGENTS.md` and only the host-specific convention files explicitly included in this run.
2. Extract testable statements about commands, dependencies, directories, configuration, framework rules, and tier boundaries.
3. Inspect objective repository evidence: manifests, lockfiles, tool-version files, actual paths, configuration examples, and relevant recent changes.
4. Audit guidance placement without judging the architecture itself:
   - root rules whose actual consumers are confined to one subtree;
   - tier/module rules that repeat inherited parent text instead of stating only differences;
   - accepted ADR/plan or repeated objective failures showing a durable local exception with no local owner;
   - nested `CLAUDE.md` files that are absent where the project adopted the alias pattern, contain anything
     other than `@AGENTS.md` plus a newline, or point to missing guidance;
   - nested guidance whose directory moved/disappeared; and
   - prompt rules that objective lint/hook/test enforcement now owns better.
   A create/move candidate must apply to a clear existing/intentionally planned subtree, be durable, differ
   materially from its parent, and be costly/unsafe to infer repeatedly. Keep cross-scope rules at root,
   prefer one tier rule over duplicated module files, exclude feature/product semantics, and never propose a
   file merely to reduce line count or mirror directory symmetry.
5. For each mismatch, record the old text, observed state, evidence source, exact affected subtree, and a
   narrow keep/move/create/delete/mechanize patch. Exclude preferences and weak pattern guesses.
6. Ask only about material ambiguity or genuinely new policy. Objective stale-value synchronization proceeds
   under the current request without a separate decision round.
7. Draft the proposed patches without editing the worktree. Use an inline trace for repository- or user-sourced synchronization and the decision-completeness auditor only for unconfirmed high-impact policy or conflicting/weak evidence.
8. Summarize the patch, apply only authorized convention changes, then validate the changed commands, paths, placeholders,
   nested inheritance, alias content, and absence of parent duplication.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking and prevents convention edits from being applied.

## Invariants

- Only project conventions are in scope.
- Critical objective drift is prioritized over nice-to-have style opinions.
- Apply only convention changes authorized by the current request or an explicit follow-up decision.
- Specific new convention text must be traceable to observed project state or an explicit user decision.
- Moving text out of root requires evidence that no remaining consumer exists outside the target subtree.
- `AGENTS.md` remains canonical; nested `CLAUDE.md` is only an optional project-adopted one-line alias, never
  a second convention source.

## Validation

- Search for unresolved placeholders.
- Verify updated commands and paths exist or are explicitly documented as deferred.
- Check path matching after editing any host-specific path-scoped convention file.
- For every nested guidance edit, verify the subtree exists, parent inheritance was considered, duplicated
  parent rules were removed, and an adopted alias is byte-equivalent to `@AGENTS.md\n`.
