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
- Change:`<diff identity>; review-scope=[exact paths reviewed by L2/light verification]; endpoint-outputs=[tasks.md receipt, drift ledger when written]`
- Checks / 轻车道验证 / 不变量反核:
- L2:
- Rule sources:
- L3:`N/A(light lane); verification=<PASS|FAIL>`
- Current truth:
