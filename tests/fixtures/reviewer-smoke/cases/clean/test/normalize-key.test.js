const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeKey } = require("../src/normalize-key");

test("normalizes mixed case and whitespace", () => {
  assert.equal(normalizeKey("  AbC  "), "abc");
});

test("returns an empty string for empty input", () => {
  assert.equal(normalizeKey(""), "");
});
