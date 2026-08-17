# 001 normalize-key — Tasks

## Tasks

- [x] Implement `src/normalize-key.js`.
- [x] Add the matching test under `test/`.

## Proof Bundle

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]`; `endpoint-outputs=[tasks.md receipt, READY spec status when written]`
- Checks:
- Review execution:`L2=<state=completed|not-run(completion preflight)|not-run(L1 prerequisite)|not-run(review-package incomplete)|invalidated(review-input drift); reviewer/mode/completion/fallback-reason when dispatched>; L3=<same shape>`
- L2:`verdict; baseline=[convention sources]; add findings/unverified/ambiguities only when non-empty` or `not-run(completion preflight)` or `not-run(L1 prerequisite)` or `not-run(review-package incomplete)` or `invalidated(review-input drift)`
- L3:`verdict; baseline=[spec path + applicable sections]; add findings/unverified/ambiguities only when non-empty` or `not-run(completion preflight)` or `not-run(L1 prerequisite)` or `not-run(review-package incomplete)` or `invalidated(review-input drift)`
- Current truth:
