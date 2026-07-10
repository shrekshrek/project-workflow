# Normalize key

> 状态: 已确认

## 1. Outcomes

- `normalizeKey(input)` trims surrounding whitespace and lowercases ASCII letters.
- Empty string input returns the empty string.

## 2. Scope

- Do: expose `normalizeKey` from `src/normalize-key.js`.
- Do not: add third-party dependencies.

## 3. Constraints

- Every string input returns a string without throwing.

## 4. Verification

- Automated tests cover mixed case, surrounding whitespace, and empty input.
