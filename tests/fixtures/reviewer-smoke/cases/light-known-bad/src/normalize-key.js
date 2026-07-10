function normalizeKey(input) {
  if (input === "") throw new Error("empty key");
  return input.trim().toLowerCase();
}

module.exports = { normalizeKey };
