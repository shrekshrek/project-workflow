# 002 Normalize key

状态: 已确认

## 目标 / 边界

- 做: normalize empty and whitespace-only strings to an empty string without throwing.
- 不做: change public API shape.

## 验证

- `node -e "const {normalizeKey}=require('./src/normalize-key'); if (normalizeKey('') !== '') process.exit(1)"`

## 已完成工作

- [x] Implement `src/normalize-key.js`.
- [x] Add `test/normalize-key.test.js`.
