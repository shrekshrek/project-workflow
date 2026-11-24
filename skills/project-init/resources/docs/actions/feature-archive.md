---
name: feature-archive
description: "Close READY features by merging durable conclusions into current truth and archiving approved feature directories."
---

# feature-archive

Close a delivered feature by merging durable conclusions into the product documentation and moving the
whole feature directory out of the active tree. Archived records remain available as read-only history.

## Use When

Use an explicit candidate when closing one delivered feature. With no argument, sweep the active
tree and confirm the candidate set. Archive may share the delivery commit.

## Closure authorization

Close only when the user explicitly intends to finish the feature lifecycle, including an explicit archive
invocation. A commit, push or PR submission alone is not closure authorization. Preserve a request to inspect,
test or provide feedback before closing, even if an earlier request included closure. If intent is unclear,
leave archive pending; ask only when closure is the requested next action. Reuse unchanged explicit closure
authorization without another approval round.

## Inputs

- Feature directory/slug, or an empty argument for a sweep.
- The candidate's canonical [delivery receipt](feature-done.md#delivery-receipt--proof-bundle-on-disk)
  and lifecycle status (`已实现`, or `已取代`/`已废弃` set by `spec-reconcile`).
- Related current-truth documents (`docs/specs/<area>.md`), if any.
- Related earlier specs and ADRs in the same product area.
- Present implementation evidence and later active/successor changes when current truth is pending or the reviewed delivery is no longer the latest change in that area.

## Outputs

- Updated `docs/specs/<area>.md` when the receipt marks an update pending or delivery changes documented
  behavior. Use the [domain template](../../template/docs/specs/_template/domain.md) when a durable product rule needs a new area document.
  Update `docs/specs/index.md` when ownership changes.
- Each closed feature at `docs/specs/changes/archive/<NNN>-<slug>/`, keeping its unique number and all
  attachments. Its receipt records what was merged and the archive date.
- Earlier specs superseded by this delivery archived in the same pass, marked `已取代` with a successor
  link or `已废弃` if abandoned. Update the number, title, status and location in the change index
  (`docs/specs/changes/index.md`) if the project maintains one.

## Workflow

1. Apply [closure authorization](#closure-authorization) to the candidate or confirmed sweep.
2. Reuse the complete READY receipt for the reviewed state. In the same task, an unchanged worktree
   and intact receipt/status outputs suffice. Across tasks in Git, the reviewed commit must resolve
   and the recorded outputs must be intact. A later commit containing a dirty-worktree receipt cannot
   establish that identity. A newer branch head alone does not invalidate an immutable reviewed commit.
   Outside Git compare the explicit reviewed inputs. If the receipt is incomplete or invalid, the verdict
   is not READY, or the reviewed state cannot be verified, leave the candidate active and route back
   to `feature-done`. A valid receipt carries its checks and reviews into archive.
3. For each candidate, draft the durable present-tense facts, lifecycle status changes, archive note, and optional index update without applying them. A stable READY receipt proves the historical delivery, not today's product behavior: validate every pending current-truth fact against present implementation evidence, current domain documents, and later active/successor changes. Do not merge a stale fact merely because the old receipt remains valid. If pruning still leaves independently changing responsibilities in one document, finish an otherwise unambiguous archive and report a nonblocking restructuring proposal; uncertain fact ownership remains a user question. Do not bundle the restructuring into the archive unless the user authorized it. Stop on unresolved supersession or contradiction with an Accepted ADR until the governing decision is resolved.
4. Rename the directory on the filesystem, including untracked files. Run [the bundled link relocator](../../scripts/relocate-markdown-links.cjs) with `<old-dir> <new-dir>` so links within the feature stay local and links to other files keep their targets.
   If any target is missing or relocation fails, move the directory back and stop before applying
   the prepared edits.
5. Apply the prepared current-truth, final-status, archive-note, governing-ADR, and optional index updates.

## Current-Truth Document Discipline

- **Replace, don't append**: merging rewrites the sections that changed; superseded statements are deleted, not stacked. The document always reads as a single consistent present tense.
- **Responsibility boundaries**: organize area documents by coherent product/system responsibility, not length. After pruning, split independently changing responsibilities while keeping coupled facts together; each detailed fact has one owner. An existing file may remain a concise overview when useful.
- **Freshness header**: first line under the title is `> 最后核对:YYYY-MM-DD`, updated on every merge. Keep feature/source identifiers in the archive note, proof bundle, or commit message, not in the domain header. A stale date is a visible distrust signal.
- Content is future-facing behavior facts only: how the area works now, plus links to governing ADRs. No history, no implementation details, no rationale (that lives in ADRs). Do not leave `docs/specs/changes/archive/*` references or long `NNN-<slug>` lists as the current-truth body; extract the surviving facts instead.
- Merge only durable rules verified against current behavior. Keep diagrams that mix those rules with feature-specific details or delivery evidence in the feature archive. Link to an existing diagram that already explains those rules. Move a feature diagram and its editable source together beside the domain document only if the domain needs the diagram, its entire content is verified as current, and it is no longer needed as delivery evidence. Update affected links after the move.

## Invariants

- Only close eligible records with a verified READY receipt. Drafts and records awaiting implementation
  (`草稿` or `已确认`) stay active.
- Preserve archived history and leave implementation code untouched.

## Validation

- Confirm current truth reflects present behavior under the document discipline above.
- Confirm each archived directory is at its expected path, its spec has the final status, and superseded specs link their successor.
- Confirm every local Markdown link in each archived directory resolves after relocation; do not report the archive complete with broken ADR, domain-doc, sibling, or reference-style links.
- Report which documents were touched, which features were archived, and any ADR follow-ups.
