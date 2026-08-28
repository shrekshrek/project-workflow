function normalizeKey(input) {
  if (input !== "" && input.trim() === "") throw new Error("blank key");
  return input.trim().toLowerCase();
}

module.exports = { normalizeKey };
