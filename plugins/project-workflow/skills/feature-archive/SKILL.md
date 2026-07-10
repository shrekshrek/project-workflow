---
name: feature-archive
description: "Close delivered features in Codex by merging durable conclusions into current-truth domain docs, marking superseded specs, and moving closed feature directories into archive with git history preserved."
---

# Feature Archive (Codex)

Match the user's language and preserve file language. Read [`../../docs/actions/feature-archive.md`](../../docs/actions/feature-archive.md) completely before acting.

## Workflow

1. Resolve candidates from an explicit feature argument or sweep active `docs/specs/changes/<NNN>-*/` directories.
2. Accept only candidates with a READY proof bundle, valid final spec status when present, and no relevant uncommitted implementation or artifact changes. Never archive draft or confirmed in-flight work.
3. Present the candidate list, current-truth pending state, and any suspected supersession; obtain confirmation before lifecycle status changes or moves.
4. For each pending feature, extract only durable present-tense behavior and constraints. Confirm an uncertain product area rather than guessing.
5. Update an existing `docs/specs/<area>.md` by replacement, not append-only history. Create a new domain document from the plugin template only when a delivered feature establishes durable domain truth; update `docs/specs/index.md`.
6. Keep the freshness header current, target roughly 150 lines per domain document, link governing ADRs, and remove stale or superseded statements.
7. Stop if the proposed current truth contradicts an Accepted ADR until a superseding decision is resolved.
8. With user approval, mark replaced older specs as superseded or abandoned, link the successor, and preserve their body unchanged.
9. Append an archive note to each feature's `tasks.md`; update an existing changes index when present.
10. Move every approved closed directory with `git mv` into `docs/specs/changes/archive/`. Immediately run the packaged `scripts/relocate-markdown-links.cjs <old-dir> <new-dir>` after each move; resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Missing local targets block completion. Do not delete history or edit implementation code.

Report archived features, current-truth files created/updated and their line counts, superseded specs, ADR follow-ups, and a commit-message draft. Default invocation is sweep mode.
