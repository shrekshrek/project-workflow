# feature-archive

Canonical lifecycle action for closing delivered features: merge durable conclusions into current truth, then physically move closed feature directories into `docs/specs/changes/archive/`.

The active tree `docs/specs/changes/` holds **in-flight work only**. History leaves the active tree instead of being merely marked: directory boundaries are respected by retrieval tools (grep/glob), top-of-file status markers are not. This is the core defense against stale changes polluting LLM attention.

## Use When

- `feature-done` returned `READY` (whether or not its current-truth check reported an update pending).
- Periodically, as a sweep: close every delivered-but-unarchived feature in one pass.
- After `spec-reconcile` resolved a messy area and left features ready to close.

Default invocation is **sweep mode**: with no argument, find all features whose delivery is complete (READY delivery receipt in `## Proof Bundle`, work committed) and propose closing them as a batch. Per-feature cost stays near zero; forgetting to archive after each feature is fine — the next sweep catches up.

Upgrade migration: an older `## Proof Bundle` that has checked L1/L2/L3 rows but no `Verdict:` is a **legacy candidate**, not evidence of READY under the current contract. Sweep mode lists these separately instead of silently ignoring them and offers to rerun `feature-done` to normalize the receipt. Never infer READY or archive from legacy checkboxes alone.

## Inputs

- Feature directory/slug, or nothing (sweep mode).
- Each candidate's delivery receipt (must have `Verdict: READY`) and `spec.md` status (`已实现`, or `已取代`/`已废弃` set by `spec-reconcile`). A missing Verdict routes to the visible legacy-migration list.
- Related current-truth documents (`docs/specs/<area>.md`), if any.
- Related earlier specs and ADRs in the same product area.

## Outputs

1. **Current truth merge** (only for features whose receipt `Current truth` is `update pending`, or that change behavior already declared in a domain document): update `docs/specs/<area>.md`. P0 creates only `docs/specs/index.md`; create a new area document from the plugin domain template only when the delivered feature establishes a durable domain truth.
2. **Physical archive**: `git mv docs/specs/changes/<NNN>-<slug>/ docs/specs/changes/archive/<NNN>-<slug>/` for every closed feature — full lane and light lane alike. Git history is preserved; numbering stays unique across active and archive. After each move, recompute local Markdown destinations from the old file location to the new one so links outside the feature keep the same semantic target while links within the moved directory remain local. Missing local targets block completion.
3. **Lifecycle status on superseded older specs**: when this delivery replaces an earlier feature's direction, mark that spec `已取代` (superseded, link the successor) or `已废弃` (abandoned) and archive it in the same pass.
4. **ADR consistency check**: if a merged conclusion contradicts an `Accepted` ADR, stop and resolve — either a new ADR supersedes the old one, or the conclusion is wrong. Current-truth documents link the ADRs governing the area.
5. A closing note in the feature's `tasks.md` recording what was merged and when it was archived.
6. Updated `docs/specs/changes/index.md` (optional, if the project keeps one): a flat list mapping `NNN` → title/status/location, so links to archived specs stay resolvable.

## Current-Truth Document Discipline

- **Replace, don't append**: merging rewrites the sections that changed; superseded statements are deleted, not stacked. The document always reads as a single consistent present tense.
- **Size discipline**: aim to keep each `docs/specs/<area>.md` around 150 lines. If it grows well beyond that, check whether the area should split or stale detail should be pruned — a bloated current-truth doc is the next pollution source. Complex domains may exceed this when the content is still current, structured, and useful.
- **Freshness header**: first line under the title is `> 最后核对:YYYY-MM-DD`, updated on every merge. Keep feature/source identifiers in the archive note, proof bundle, or commit message, not in the domain header. A stale date is a visible distrust signal.
- Content is future-facing behavior facts only: how the area works now, plus links to governing ADRs. No history, no implementation details, no rationale (that lives in ADRs). Do not leave `docs/specs/changes/archive/*` references or long `NNN-<slug>` lists as the current-truth body; extract the surviving facts instead.

## Invariants

- A READY feature is not current truth until its durable conclusions are merged.
- Archiving is `git mv`, never deletion; archived directories are read-only history.
- Never archive an in-flight feature (spec status `草稿`/`已确认`, or delivery receipt missing/non-READY).
- There is no "historical foundation" status: if parts of an archived spec remain valid (data model, API, pipeline), those facts belong in `docs/specs/<area>.md` — extract them during the merge instead of keeping the old spec in the active tree as a reference.
- Do not edit implementation code.

## Validation

- Confirm the current-truth document no longer contradicts the delivered behavior and respects the size cap.
- Confirm every archived spec's status line reflects its final state and superseded ones link their successor.
- Confirm every local Markdown link in each archived directory resolves after relocation; do not report the archive complete with broken ADR, domain-doc, sibling, or reference-style links.
- Report which documents were touched, which features were archived, and any ADR follow-ups.
