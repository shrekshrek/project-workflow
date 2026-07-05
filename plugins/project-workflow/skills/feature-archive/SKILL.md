---
name: feature-archive
description: Run the project-workflow lifecycle closure for delivered features. Default sweep mode finds all delivered-but-unarchived features and closes them as a batch; merges durable conclusions into docs/current/<area>.md when the proof bundle marked a pending current-truth update, marks superseded older specs, then moves every closed feature directory into docs/specs/archive/ with git mv. Use periodically after feature-done READY features accumulate, or with a slug for single-feature closure.
---

# Feature Archive

Match the user's language in natural-language output. This is the Codex adapter for the lifecycle closure action.

Canonical action spec: `../../docs/actions/feature-archive.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance. Lifecycle semantics: bundled `../../docs/spec-driven.md §5.1`.

## Workflow

1. Select closure candidates.
   - No argument = sweep mode: scan `docs/specs/<NNN>-*/` (excluding `archive/`) for features with a READY proof bundle, a delivered spec status, and no uncommitted related changes; list them for user confirmation. Empty list → report "nothing to archive" and stop.
   - With `<slug>`/`<NNN>`/path/`current`: close that single feature; if it is not READY, tell the user to run `$feature-done` first and stop.
   - Never archive an in-flight feature (draft/confirmed status or missing/non-READY proof bundle).

2. Merge current truth (only for features whose proof bundle marked "current truth update pending").
   - Derive the product area from spec Outcomes, plan module impact, and the proof-bundle diff; ask the user when unclear.
   - Extract durable, future-facing conclusions (behavior, contracts, IA, defaults) and confirm the list with the user.
   - Update `docs/current/<area>.md` by rewriting the affected sections (replace, don't append), or create it (and `docs/current/`) on first use: title, freshness line, one-line area definition, current-state sections, `## Sources` with governing ADR links and supporting spec ids.
   - Discipline: keep the document under ~150 lines (split the area or prune if exceeded); set the first line under the title to `> 最后核对:YYYY-MM-DD(as of <NNN>-<slug>)`.
   - ADR consistency: if a merged conclusion contradicts an `Accepted` ADR, stop and resolve (new superseding ADR or the conclusion is wrong); if a cross-feature direction change has no ADR, ask the user to record one first.

3. Mark superseded older specs (when this delivery replaces an earlier direction).
   - Confirm per spec with the user: `已取代` (superseded, link the successor) or `已废弃` (abandoned). There is no "historical foundation" status — still-valid facts from old specs are extracted into current truth, and the spec is archived normally.
   - Apply only two edits per old spec: move the bold status marker, and add one line under the status line linking to the replacement with a one-sentence reason. Never edit spec body content.
   - Marked specs join this round's archive list.

4. Physically archive.
   - For each closed feature: append an `## Archive Note` line to its `tasks.md` (date; what was merged, if anything), then `mkdir -p docs/specs/archive && git mv docs/specs/<NNN>-<slug> docs/specs/archive/<NNN>-<slug>`.
   - Update `docs/specs/index.md` (id → title/status/location) if the file exists; do not create it unprompted.
   - Numbering stays globally unique across active and archive; archived ids are never reused.

5. Report.
   - Archived features, current-truth documents created/updated (with line counts), status changes, ADR follow-ups.
   - Suggest a commit message; do not commit automatically.

## Guardrails

- Do not edit implementation code. Archiving is `git mv`, never deletion; archived content is read-only history.
- Every status change and the archive list need explicit user approval.
- After updating, verify current truth no longer contradicts delivered behavior, respects the size cap, and has a fresh 最后核对 line.
- If the user cannot decide whether an old spec is superseded, recommend `$spec-reconcile` for a full-area diagnosis.
