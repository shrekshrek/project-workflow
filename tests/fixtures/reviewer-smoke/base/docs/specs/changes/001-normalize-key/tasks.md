# 001 normalize-key — Tasks

## Tasks

- [x] Implement `src/normalize-key.js`.
- [x] Add the matching test under `test/`.

## Proof Bundle

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]`; `endpoint-outputs=[tasks.md receipt, READY spec status when written]`
- Checks:
- Review execution:`L2=<reviewer; mode=fresh-subagent|result-reuse|main-session fallback; status; fallback-reason>|not-run(completion preflight)|not-run(L1 prerequisite); L3=<same shape>`
- L2:`verdict; baseline=[convention sources]; add findings/unverified/ambiguities only when non-empty` or `not-run(completion preflight)` or `not-run(L1 prerequisite)`
- L3:`verdict; baseline=[spec path + applicable sections]; add findings/unverified/ambiguities only when non-empty` or `not-run(completion preflight)` or `not-run(L1 prerequisite)`
- Current truth:
