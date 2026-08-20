#!/usr/bin/env node

const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const checks = [
  ["Generated plugin packages", ["scripts/build-plugin-packages.cjs", "--check"]],
  ["Claude/Codex adapter parity", ["scripts/check-adapter-parity.js"]],
  ["Workflow structural contracts", ["scripts/check-workflow-contracts.cjs"]],
  ["Reviewer fixtures", ["scripts/check-reviewer-fixtures.cjs"]],
  ["Feature-init fixtures", ["scripts/check-feature-init-fixtures.cjs"]],
  ["Template contracts", ["scripts/check-template-contracts.js"]],
  ["Lifecycle links", ["scripts/check-lifecycle-links.cjs"]],
  ["Markdown links", ["scripts/check-markdown-links.cjs"]],
];

const results = [];

for (const [name, args] of checks) {
  console.log(`\n==> ${name}`);
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  const passed = result.status === 0 && !result.error;
  results.push({ name, passed, status: result.status, signal: result.signal, error: result.error });
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}`);
}

console.log("\nCheck summary:");
for (const result of results) {
  let detail = "";
  if (result.error) detail = ` (${result.error.message})`;
  else if (!result.passed && result.signal) detail = ` (signal ${result.signal})`;
  else if (!result.passed) detail = ` (exit ${result.status ?? "unknown"})`;
  console.log(`- ${result.passed ? "PASS" : "FAIL"}: ${result.name}${detail}`);
}

const failed = results.filter((result) => !result.passed);
if (failed.length > 0) {
  console.error(`\n${failed.length} of ${results.length} checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${results.length} checks passed.`);
}
