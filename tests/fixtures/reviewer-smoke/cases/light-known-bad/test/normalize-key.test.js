const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeKey } = require("../src/normalize-key");

test("normalizes mixed case and whitespace", () => {
  assert.equal(normalizeKey("  AbC  "), "abc");
});
