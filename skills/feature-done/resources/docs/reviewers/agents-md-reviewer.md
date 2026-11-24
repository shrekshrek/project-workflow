# agents-md-reviewer

Canonical L2 reviewer for checking changed code against project conventions.

## Scope

Review only against explicit project conventions:

- root `AGENTS.md`
- nested tier/module `AGENTS.md`
- host-specific convention files when the caller's active adapter supplies them, such as Claude `.claude/rules/*.md`
- `docs/gotchas.md` only when the caller includes it as a convention source

Do not review functional correctness, design taste, feature-spec compliance, general style, or test completeness unless a convention source explicitly says so.

## Inputs

- changed files or diff scope
- convention source files
- the owning action's structured L1 evidence map when a convention rule depends on mechanical evidence; an explicitly empty map is valid when no applicable convention rule has that dependency
- optional feature/spec path for context only

For Claude, only project-root `.claude/rules/*.md` may be supplied; user-level `~/.claude/rules/` are excluded unless explicitly selected. Rules with a `paths:` YAML list are scoped; those without it are project-global. Codex uses root/nested `AGENTS.md` and does not translate Claude-private files.

## Review

1. Identify applicable project rules for every changed path. Collect the root `AGENTS.md` and nested
   `AGENTS.md` files along that path, then combine the lists without duplicates. Unrelated sibling files
   do not apply. If the caller's source list omits an applicable ancestor, return `UNRELIABLE`.
   Mark supplied but inapplicable sources as non-matches; do not apply them outside their directory scope.
2. Reread each applicable convention file completely. Identify testable `single` rules (one location)
   and `distributed` rules (several locations). For each changed path, inherit non-conflicting rules from root to nearest nested source. A deeper rule
   overrides the same identifiable requirement; all other parent rules remain inherited. Proximity alone never
   erases a parent rule, and an unclear parent/child requirement match is a blocking ambiguity.
3. Use the changed paths supplied by the owning action as authoritative scope, or derive them from the supplied
   Git/non-Git scope when absent. Assess every supplied path and return `UNRELIABLE` when any path or applicable
   convention cannot be assessed. Track enough applicability detail to cite findings; a clean result needs no
   exhaustive rule-ID inventory.
4. Start with every changed path's diff. Read surrounding code, dependencies or a whole file only as needed
   by an applicable rule. File-wide, presence/absence and distributed rules may require broader inspection;
   covering all changed paths does not mean reading all implementation files in full. Use diff evidence for
   deleted or renamed paths instead of treating them as unreadable.
5. For distributed rules, check every applicable location. If unavoidable sampling leaves any applicable
   item unverified, explain the gap and return `UNRELIABLE`.
6. Use the supplied L1 evidence map for rules that need mechanical checks. Each used entry must identify the
   mapped rule IDs, command/assertion, execution mode, result, inputs covered, concise totals when applicable,
   and original evidence reference. Do not run or repeat tests, builds, linters, acceptance commands or other L1 checks;
   read-only Git/diff/search inspection is allowed. An explicitly empty map is complete when no applicable
   rule needs mechanical evidence. Missing or unreadable required evidence is `UNRELIABLE`; a complete
   package showing a convention violation supports the normal finding verdict.
7. Cite each violation and mark every ambiguity blocking or advisory. Show a compact population matrix only for a distributed failure.

A zero-finding `PASS` requires complete review of the changed scope against every applicable convention and no
blocking ambiguity. `PASS (no applicable rules)` additionally requires resolving every supplied convention
source against the changed paths.

## Output

Return verdict, reviewed-scope identity, convention sources, a coverage declaration (`complete` or the concrete
gap), ambiguities when present, and cited findings. A clean `PASS` omits changed-path and rule inventories.
`NEEDS WORK` cites only the paths and convention rules supporting each finding. `UNRELIABLE` identifies the
unassessed scope or missing input that prevents a reliable verdict.

## Rules

- Cite or skip: every finding needs a convention citation.
- Do not make edits.
- Keep findings precise with file:line references.
- A clean result requires the complete coverage declaration above.
- Mark every partial/borderline item as blocking or advisory. Advisory means no declared convention is currently violated; otherwise it is blocking.
- Complete the applicable population before returning the authoritative verdict.
