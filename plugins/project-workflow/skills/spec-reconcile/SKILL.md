---
name: spec-reconcile
description: "Repair accumulated spec conflicts in a product area using Codex. Builds an evidence-backed conflict matrix, asks the user to choose precedence, archives losing specs, and identifies current-truth and ADR gaps."
---

# Spec Reconcile (Codex)

Match the user's language. Read [`../../docs/actions/spec-reconcile.md`](../../docs/actions/spec-reconcile.md) completely before acting.

## Workflow

1. Resolve a product area, module path, or explicit feature list. Collect at least two related active specs, relevant domain documents, ADRs, and optionally implementation evidence.
2. Extract concrete assertions about behavior, contracts, defaults, ownership, and structure. Report only direct contradictions, each with exact file and section evidence.
3. Build a conflict matrix showing each side, current truth, ADR support, implementation evidence when supplied, and the evidence tendency. Do not silently choose the winner.
4. Ask the user to select the source of truth for each contradiction and classify each losing spec as superseded or abandoned. Unresolved contradictions block new implementation in the area.
5. After explicit approval, update only losing status markers and successor links, then move losing directories to `docs/specs/changes/archive/` with `git mv`. Immediately run the packaged `scripts/relocate-markdown-links.cjs <old-dir> <new-dir>` after each move; resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Missing local targets block the lifecycle update.
6. Extract still-valid facts from losing specs into current-truth gaps; do not invent a “historical foundation” lifecycle state.
7. Replace archive-link lists or historical narratives in domain docs with present-tense facts when the user approves the current-truth update.
8. Flag any losing direction backed by an Accepted ADR for a superseding ADR or status correction.
9. Update an existing changes index when present. Never delete history or modify implementation code.

Return `CLEAN`, `NEEDS LIFECYCLE UPDATE`, or `BLOCKED`, with the conflict matrix, applied moves, current-truth gaps, ADR follow-ups, and next action.
