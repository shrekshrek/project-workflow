# feature-archive

Canonical lifecycle action for closing delivered features: merge durable conclusions into current truth, then physically move closed feature directories into `docs/specs/changes/archive/`.

The active tree `docs/specs/changes/` holds **in-flight work only**. History leaves the active tree instead of being merely marked: directory boundaries are respected by retrieval tools (grep/glob), top-of-file status markers are not. This is the core defense against stale changes polluting LLM attention.

## Use When

- `feature-done` returned `READY` (whether or not its current-truth check reported an update pending).
- Periodically, as a sweep: close every delivered-but-unarchived feature in one pass.
- After `spec-reconcile` resolved a messy area and left features ready to close.

Default invocation is **sweep mode**: with no argument, find all features whose delivery is complete (READY delivery receipt in `## Proof Bundle`) and propose closing them as a batch. Archiving may share the final commit with implementation, receipt, and current-truth changes; a prior commit is not required. Forgetting to archive immediately is fine — a later sweep can revalidate uncertain candidates.

Upgrade migration: a `## Proof Bundle` without `Verdict:`, or a READY receipt without the current `git=[...]` / non-Git `inputs=[...]` identity (including the earlier `review-scope` / `base/worktree` schema), is a **receipt-schema migration candidate**. Sweep mode lists it separately and offers to rerun `feature-done`; never infer READY from legacy fields.

## Inputs

- Feature directory/slug, or nothing (sweep mode).
- Each candidate's delivery receipt must have `Verdict: READY` and one valid Git identity (or explicit non-Git inputs): exact reviewed commit SHA with `dirty=no`, or current worktree with `dirty=yes`. Other pairings are invalid. A dirty-worktree coordinate is eligible only as a current-task result while the reviewed state remains unchanged; an older receipt requires an immutable reviewed commit SHA. Committing a dirty-worktree receipt later does not re-anchor it. When `spec.md` exists, its status must be `已实现`, or `已取代`/`已废弃` as set by `spec-reconcile`; light-lane candidates have no `spec.md` and rely on the READY receipt. Invalid receipt schemas route to the visible migration list.
- Related current-truth documents (`docs/specs/<area>.md`), if any.
- Related earlier specs and ADRs in the same product area.
- Present implementation evidence and later active/successor changes when current truth is pending or the reviewed delivery is no longer the latest change in that area.

## Outputs

1. **Current truth merge** (only for features whose receipt `Current truth` is `update pending`, or that change behavior already declared in a domain document): update `docs/specs/<area>.md`. P0 creates only `docs/specs/index.md`; create a new area document from the plugin domain template only when the delivered feature establishes a durable domain truth.
2. **Physical archive**: move `docs/specs/changes/<NNN>-<slug>/` to `docs/specs/changes/archive/<NNN>-<slug>/` for every closed feature — full lane and light lane alike. Use an ordinary filesystem rename so tracked and untracked artifacts both work; Git can record the rename when the result is committed. Numbering stays unique across active and archive. After each move, recompute local Markdown destinations from the old file location to the new one so links outside the feature keep the same semantic target while links within the moved directory remain local. Missing local targets block completion and the directory is moved back before stopping.
3. **Lifecycle status on superseded older specs**: when this delivery replaces an earlier feature's direction, mark that spec `已取代` (superseded, link the successor) or `已废弃` (abandoned) and archive it in the same pass.
4. **ADR consistency check**: if a merged conclusion contradicts an `Accepted` ADR, stop and resolve — either a new ADR supersedes the old one, or the conclusion is wrong. Current-truth documents link the ADRs governing the area.
5. A closing note in the feature's `tasks.md` recording what was merged and when it was archived.
6. Updated `docs/specs/changes/index.md` (optional, if the project keeps one): a flat list mapping `NNN` → title/status/location, so links to archived specs stay resolvable.

## Workflow

1. Resolve one explicit feature or sweep active change directories. Treat delivery evidence and current truth as separate freshness questions. A current-task dirty-worktree READY result remains usable while its reviewed state and endpoint outputs are unchanged. An older receipt is valid delivery evidence only when it names an existing immutable reviewed commit SHA and its receipt/status outputs remain intact; later movement of the current branch or PR head does not by itself invalidate that historical delivery proof. Rerun `feature-done` when the receipt records a dirty worktree, uses an invalid identity pairing, or the reviewed commit cannot be resolved. A commit containing a dirty receipt is not proof that the reviewed worktree was unchanged before commit. Outside Git, compare the explicit reviewed inputs. Do not create a manual population list, fingerprint, or population hash.
2. An explicit single-feature invocation authorizes an unambiguous READY archive. In sweep mode, present and confirm the candidate set. Ask separately only for uncertain current-truth ownership, supersession, or ADR decisions.
3. For each candidate, draft the durable present-tense facts, lifecycle status changes, archive note, and optional index update without applying them. A stable READY receipt proves the historical delivery, not today's product behavior: validate every pending current-truth fact against present implementation evidence, current domain documents, and later active/successor changes. Do not merge a stale fact merely because the old receipt remains valid. Stop on unresolved supersession or contradiction with an Accepted ADR until the governing decision is resolved.
4. Move the directory with an ordinary filesystem rename and run the link relocator. If relocation fails, move the directory back and stop before applying lifecycle or current-truth edits.
5. Apply the prepared current-truth, final-status, archive-note, governing-ADR, and optional index updates.
6. Validate current truth, final statuses, archived paths, and links; report all touched documents and follow-ups.

## Current-Truth Document Discipline

- **Replace, don't append**: merging rewrites the sections that changed; superseded statements are deleted, not stacked. The document always reads as a single consistent present tense.
- **Size discipline**: aim to keep each `docs/specs/<area>.md` around 150 lines. If it grows well beyond that, check whether the area should split or stale detail should be pruned — a bloated current-truth doc is the next pollution source. Complex domains may exceed this when the content is still current, structured, and useful.
- **Freshness header**: first line under the title is `> 最后核对:YYYY-MM-DD`, updated on every merge. Keep feature/source identifiers in the archive note, proof bundle, or commit message, not in the domain header. A stale date is a visible distrust signal.
- Content is future-facing behavior facts only: how the area works now, plus links to governing ADRs. No history, no implementation details, no rationale (that lives in ADRs). Do not leave `docs/specs/changes/archive/*` references or long `NNN-<slug>` lists as the current-truth body; extract the surviving facts instead.

## Invariants

- A READY feature is not current truth until its durable conclusions are merged.
- Archiving is a directory move, never deletion; archived directories are read-only history.
- Never archive an in-flight feature (full-lane spec status `草稿`/`已确认`, or delivery receipt missing/non-READY in either lane).
- Never archive when the reviewed Git/non-Git state is known to have changed or its freshness cannot be established; rerun `feature-done` instead.
- A resolvable reviewed commit SHA is immutable delivery evidence even after the current branch or PR head advances; current-truth conclusions still require independent present-state validation.
- Explicit single-feature invocation needs no duplicate confirmation. Sweep candidates and uncertain lifecycle decisions remain visible to the user.
- There is no "historical foundation" status: if parts of an archived spec remain valid (data model, API, pipeline), those facts belong in `docs/specs/<area>.md` — extract them during the merge instead of keeping the old spec in the active tree as a reference.
- Do not edit implementation code.

## Validation

- Confirm the current-truth document reflects present behavior rather than merely repeating the historically delivered spec, and respects the size cap.
- Confirm each archived feature used a current-task READY result or another confidently unchanged reviewed Git/non-Git state; otherwise rerun `feature-done` and stop that candidate.
- Confirm every archived spec's status line reflects its final state and superseded ones link their successor.
- Confirm every local Markdown link in each archived directory resolves after relocation; do not report the archive complete with broken ADR, domain-doc, sibling, or reference-style links.
- Report which documents were touched, which features were archived, and any ADR follow-ups.
