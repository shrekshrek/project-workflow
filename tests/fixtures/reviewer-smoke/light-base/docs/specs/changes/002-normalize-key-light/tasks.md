# 002 normalize-key-light — Tasks

## 目标 / 边界

- 做: normalize an empty string without throwing.
- 不做: change public API shape.

## 验证

- `node -e "const {normalizeKey}=require('./src/normalize-key'); if (normalizeKey('') !== '') process.exit(1)"`

## Tasks

- [x] Implement `src/normalize-key.js`.
- [x] Add `test/normalize-key.test.js`.

## Proof Bundle

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]`; `endpoint-outputs=[tasks.md receipt]`
- Checks / 轻车道验证 / 不变量反核:
- Review execution:`L2=N/A(low-risk light lane; no L2 trigger after convention-scope triage); L3=N/A(light lane)`
- L2:`N/A(low-risk light lane; no L2 trigger after convention-scope triage)`
- L3:`N/A(light lane); verification=[item#id: PASS|FAIL]`
- Current truth:
