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
- Change:`review-scope=[exact paths reviewed by L2/light verification]; base/worktree=[Git context when available]; endpoint-outputs=[tasks.md receipt]`
- Checks / 轻车道验证 / 不变量反核:
- Review execution:`L2=<reviewer; mode; status; fallback-reason>; L3=N/A(light lane)`
- L2:`verdict; findings; applicable-rules; applicable-unverified; ambiguities`
- L3:`N/A(light lane); verification=[item#id: PASS|FAIL]`
- Current truth:
