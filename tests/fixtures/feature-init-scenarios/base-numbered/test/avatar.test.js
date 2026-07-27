const assert = require("node:assert/strict");
const test = require("node:test");

const { avatarFallback } = require("../src/user/avatar.js");

test("builds a stable two-letter avatar fallback", () => {
  assert.equal(avatarFallback("Ada Lovelace"), "AL");
});
