---
name: spec-reconcile
description: Repair conflicts across accumulated project-workflow specs in one product area. Builds a conflict matrix across specs, current truth, ADRs, and optionally code; the user selects the source of truth per contradiction; losing specs are marked superseded/abandoned and moved to docs/specs/archive/; reports current-truth gaps and a CLEAN / NEEDS LIFECYCLE UPDATE / BLOCKED verdict. Primarily a retrofit tool for projects adopting lifecycle management with piled-up direction changes; rarely needed once archive sweeps run routinely. Not for revising one active spec mid-implementation — use spec-revise.
---

# Spec Reconcile

Match the user's language in natural-language output. This is the Codex adapter for the spec reconciliation action.

Canonical action spec: `../../docs/actions/spec-reconcile.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance. Lifecycle semantics: bundled `../../docs/spec-driven.md §5.1`.

## Workflow

1. Scope the area.
   - Accept an area name, module path, or comma-separated `<NNN>` list; ask when empty.
   - List candidate specs (id + title + current status) and confirm the scope with the user. Fewer than two specs → report "nothing to reconcile" and stop.
   - Collect `docs/current/<area>.md` and related ADRs when present; include implementation files only if the user provides them.

2. Build the conflict matrix.
   - Extract concrete assertions (IA, behavior, contracts, defaults) with file + section citations.
   - Report only objective contradictions where documents disagree; never report vague "may be stale" findings.
   - For each conflict, show the quoted statements, which document is later, whether an ADR already decided it, and which side the code follows if code was provided.

3. Let the user pick the source of truth per conflict (batch at most 5 per round).
   - Winner: a later spec, an ADR, current truth, or the code's current state.
   - Loser status: `已取代` (superseded, link the successor) or `已废弃` (abandoned). There is no "historical foundation" status — still-valid facts from losing specs (data model, API, infrastructure) are recorded as current-truth gaps in step 4; the spec itself is archived.
   - Conflicts the user does not decide must not receive any marker.

4. Apply (mark + archive) and report gaps.
   - Apply the two-line lifecycle edit to each losing spec (status marker + replacement link; never edit body content), then `mkdir -p docs/specs/archive && git mv docs/specs/<NNN>-<slug> docs/specs/archive/<NNN>-<slug>`.
   - Update `docs/specs/index.md` (id → title/status/location) if the file exists.
   - Report current-truth gaps: durable facts scattered across winning specs or surviving from losing specs but missing from `docs/current/<area>.md`; fill them with user approval when the gap is large, or recommend a `$feature-archive` sweep (which also archives delivered winners).
   - ADR consistency: losers backed by an `Accepted` ADR are flagged for a superseding ADR or status update.

5. Return the canonical verdict.
   - `CLEAN`: no conflicts; specs and current truth align.
   - `NEEDS LIFECYCLE UPDATE`: conflicts found; status/archive/current-truth updates applied or pending before new implementation.
   - `BLOCKED`: undecided contradictions remain — new implementation in this area is unsafe until the user picks a precedence.

## Guardrails

- Read-only for implementation code.
- Superseding is marking plus archiving with `git mv`, never deleting.
- Every reported conflict cites exact files and sections.
- All status changes and archive moves require explicit user approval.
