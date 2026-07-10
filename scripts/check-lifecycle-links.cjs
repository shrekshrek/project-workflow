#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const relocator = path.join(repoRoot, "scripts", "relocate-markdown-links.cjs");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "project-workflow-archive-links-"));
const active = path.join(fixture, "docs/specs/changes/001-links");
const archived = path.join(fixture, "docs/specs/changes/archive/001-links");

fs.mkdirSync(path.join(fixture, "docs/adr"), { recursive: true });
fs.mkdirSync(active, { recursive: true });
fs.writeFileSync(path.join(fixture, "docs/adr/0001-choice.md"), "# ADR\n");
fs.writeFileSync(path.join(fixture, "docs/adr/choice(1).md"), "# ADR with parentheses\n");
fs.writeFileSync(path.join(fixture, "docs/specs/area.md"), "# Area\n\n## Contract\n");
fs.writeFileSync(path.join(active, "plan.md"), "# Plan\n");
fs.writeFileSync(path.join(active, "spec.md"), [
  "# Spec",
  "",
  "[ADR](../../../adr/0001-choice.md)",
  "[ADR with parentheses](../../../adr/choice(1).md)",
  "[ADR with title](../../../adr/0001-choice.md \"Choice\")",
  "[Domain](../../area.md#contract)",
  "[Plan](plan.md)",
  "[Local anchor](#scope)",
  "[ADR reference]: ../../../adr/0001-choice.md",
  "`[Inline code](../../../adr/not-a-link.md)`",
  "",
  "```markdown",
  "[Fenced code](../../../adr/not-a-link.md)",
  "[Fenced reference]: ../../../adr/not-a-link.md",
  "```",
  "",
  "## Scope",
  "",
].join("\n"));

fs.mkdirSync(path.dirname(archived), { recursive: true });
fs.renameSync(active, archived);
const result = spawnSync(process.execPath, [relocator, active, archived], {
  cwd: fixture,
  encoding: "utf8",
});

const problems = [];
if (result.status !== 0) problems.push(`relocator exit ${result.status}: ${result.stderr.trim()}`);
const spec = fs.readFileSync(path.join(archived, "spec.md"), "utf8");
for (const expected of [
  "[ADR](../../../../adr/0001-choice.md)",
  "[ADR with parentheses](../../../../adr/choice(1).md)",
  "[ADR with title](../../../../adr/0001-choice.md \"Choice\")",
  "[Domain](../../../area.md#contract)",
  "[Plan](plan.md)",
  "[Local anchor](#scope)",
  "[ADR reference]: ../../../../adr/0001-choice.md",
  "`[Inline code](../../../adr/not-a-link.md)`",
  "[Fenced code](../../../adr/not-a-link.md)",
  "[Fenced reference]: ../../../adr/not-a-link.md",
]) {
  if (!spec.includes(expected)) problems.push(`missing expected relocation: ${expected}`);
}

const brokenActive = path.join(fixture, "docs/specs/changes/002-broken");
const brokenArchived = path.join(fixture, "docs/specs/changes/archive/002-broken");
fs.mkdirSync(brokenActive, { recursive: true });
fs.writeFileSync(path.join(brokenActive, "spec.md"), "[Missing](../../../adr/9999-missing.md)\n");
fs.renameSync(brokenActive, brokenArchived);
const broken = spawnSync(process.execPath, [relocator, brokenActive, brokenArchived], {
  cwd: fixture,
  encoding: "utf8",
});
if (broken.status === 0 || !broken.stderr.includes("missing local targets")) {
  problems.push("missing-target fixture did not fail clearly");
}

fs.rmSync(fixture, { recursive: true, force: true });

if (problems.length > 0) {
  console.error("Lifecycle link check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Lifecycle links OK: archive relocation + missing-target failure.");
