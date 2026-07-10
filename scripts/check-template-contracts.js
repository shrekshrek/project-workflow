#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { applyStaged, materialize } = require("./materialize-project-baseline.cjs");

const repoRoot = path.resolve(__dirname, "..");
const problems = [];
const realTmpRoot = fs.realpathSync(os.tmpdir());

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

function relative(file) {
  return path.relative(repoRoot, file);
}

const activeSources = [
  path.join(repoRoot, "docs", "actions"),
  path.join(repoRoot, "docs", "adapters"),
  path.join(repoRoot, "docs", "reviewers"),
  path.join(repoRoot, "docs", "cross-tool-methodology.md"),
  path.join(repoRoot, "docs", "spec-driven.md"),
  path.join(repoRoot, "docs", "workflow.md"),
  path.join(repoRoot, "skills"),
  path.join(repoRoot, "template"),
].flatMap((entry) => (fs.statSync(entry).isDirectory() ? walkFiles(entry) : [entry]));

for (const file of activeSources.filter((entry) => /\.(md|js|json)$/.test(entry))) {
  const content = fs.readFileSync(file, "utf8");
  if (/\bglobs\b/i.test(content)) {
    problems.push(`${relative(file)}: historical rule scope key remains in active source`);
  }
  for (const line of content.split(/\r?\n/)) {
    if (/description.{0,120}<\s*80|<\s*80.{0,120}description/i.test(line)) {
      problems.push(`${relative(file)}: description character limit remains`);
    }
  }
}

const templateAgents = fs.readFileSync(path.join(repoRoot, "template", "AGENTS.md"), "utf8");
if (/@\.claude\/rules\//.test(templateAgents)) {
  problems.push("template/AGENTS.md: generated projects must rely on automatic rule discovery, not imports");
}

const baselineRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-baseline-"));
const baselineStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-stage-"));
const baselineResult = materialize(path.join(repoRoot, "template"), baselineStage, { againstRoot: baselineRoot });
if (walkFiles(baselineRoot).length !== 0) problems.push("staging baseline wrote to target before approval/apply");
const applyResult = applyStaged(baselineStage, baselineRoot);
const baselineFiles = walkFiles(baselineRoot).map((file) => path.relative(baselineRoot, file).split(path.sep).join("/"));
for (const forbidden of [
  "docs/specs/_template/domain.md",
  "docs/specs/changes/_template/tasks.md",
  "docs/adr/0000-template.md",
  ".claude/settings.json",
  ".claude/hooks/lint-on-edit.cjs",
  ".codex/hooks.json",
]) {
  if (baselineFiles.includes(forbidden)) problems.push(`materialized baseline retains plugin-only asset ${forbidden}`);
}
for (const required of ["AGENTS.md", "CLAUDE.md", "docs/specs/index.md", "docs/adr/README.md", ".claude/rules/security.md"]) {
  if (!baselineFiles.includes(required)) problems.push(`materialized baseline missing ${required}`);
}
if (baselineResult.skippedExisting.length !== 0) problems.push("empty-target baseline unexpectedly skipped existing files");
if (applyResult.copied.length !== baselineResult.copied.length) problems.push("approved staged baseline did not apply the complete planned population");
fs.rmSync(baselineStage, { recursive: true, force: true });
fs.rmSync(baselineRoot, { recursive: true, force: true });

const retrofitRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-retrofit-"));
fs.writeFileSync(path.join(retrofitRoot, "AGENTS.md"), "# User-owned conventions\n");
const retrofitResult = materialize(path.join(repoRoot, "template"), retrofitRoot);
if (fs.readFileSync(path.join(retrofitRoot, "AGENTS.md"), "utf8") !== "# User-owned conventions\n") {
  problems.push("baseline materializer overwrote an existing AGENTS.md");
}
if (!retrofitResult.skippedExisting.includes("AGENTS.md")) problems.push("baseline materializer did not report skipped existing AGENTS.md");
fs.rmSync(retrofitRoot, { recursive: true, force: true });

const symlinkRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-symlink-target-"));
const symlinkOutside = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-symlink-outside-"));
const symlinkStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-symlink-stage-"));
fs.symlinkSync(symlinkOutside, path.join(symlinkRoot, "docs"), "dir");
let symlinkRejected = false;
try {
  materialize(path.join(repoRoot, "template"), symlinkStage, { againstRoot: symlinkRoot });
} catch (error) {
  symlinkRejected = /symlink destination/.test(error.message);
}
if (!symlinkRejected) problems.push("baseline materializer did not reject a symlinked target parent");
if (walkFiles(symlinkOutside).length !== 0) problems.push("baseline materializer wrote through a target symlink");
fs.rmSync(symlinkRoot, { recursive: true, force: true });
fs.rmSync(symlinkOutside, { recursive: true, force: true });
fs.rmSync(symlinkStage, { recursive: true, force: true });

const absentParent = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-absent-parent-"));
const absentTarget = path.join(absentParent, "not-created-during-stage");
const absentStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-absent-stage-"));
materialize(path.join(repoRoot, "template"), absentStage, { againstRoot: absentTarget });
if (fs.existsSync(absentTarget)) problems.push("baseline staging created an absent target before approval");
fs.rmSync(absentParent, { recursive: true, force: true });
fs.rmSync(absentStage, { recursive: true, force: true });

const rootLinkOutside = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-root-link-outside-"));
const rootLinkParent = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-root-link-parent-"));
const rootLink = path.join(rootLinkParent, "target-link");
const rootLinkStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-root-link-stage-"));
fs.writeFileSync(path.join(rootLinkStage, "escape.txt"), "must stay staged\n");
fs.symlinkSync(rootLinkOutside, rootLink, "dir");
let rootLinkRejected = false;
try {
  applyStaged(rootLinkStage, rootLink);
} catch (error) {
  rootLinkRejected = /symlink target (?:root|component)/.test(error.message);
}
if (!rootLinkRejected) problems.push("staged apply did not reject a symlink target root");
if (walkFiles(rootLinkOutside).length !== 0) problems.push("staged apply wrote through a symlink target root");
fs.rmSync(rootLinkParent, { recursive: true, force: true });
fs.rmSync(rootLinkOutside, { recursive: true, force: true });
fs.rmSync(rootLinkStage, { recursive: true, force: true });

const linkedParentOutside = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-linked-parent-outside-"));
const linkedParentRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-linked-parent-root-"));
const linkedParentStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-linked-parent-stage-"));
const linkedParent = path.join(linkedParentRoot, "linked");
const missingThroughLink = path.join(linkedParent, "new-target");
fs.symlinkSync(linkedParentOutside, linkedParent, "dir");
fs.writeFileSync(path.join(linkedParentStage, "escape.txt"), "must not traverse parent link\n");
let linkedParentRejected = false;
try {
  applyStaged(linkedParentStage, missingThroughLink);
} catch (error) {
  linkedParentRejected = /symlink target component/.test(error.message);
}
if (!linkedParentRejected) problems.push("staged apply did not reject an absent target below a symlink parent");
if (walkFiles(linkedParentOutside).length !== 0) problems.push("staged apply wrote through a symlink target parent");
fs.rmSync(linkedParentRoot, { recursive: true, force: true });
fs.rmSync(linkedParentOutside, { recursive: true, force: true });
fs.rmSync(linkedParentStage, { recursive: true, force: true });

const conflictRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-apply-conflict-"));
const conflictStage = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-conflict-stage-"));
fs.writeFileSync(path.join(conflictRoot, "same.txt"), "user version\n");
fs.writeFileSync(path.join(conflictStage, "same.txt"), "staged version\n");
fs.writeFileSync(path.join(conflictStage, "fresh.txt"), "must not partially apply\n");
let conflictRejected = false;
try {
  applyStaged(conflictStage, conflictRoot);
} catch (error) {
  conflictRejected = /Refusing partial apply/.test(error.message);
}
if (!conflictRejected) problems.push("staged apply did not reject approval-time target drift");
if (fs.readFileSync(path.join(conflictRoot, "same.txt"), "utf8") !== "user version\n") problems.push("staged apply overwrote a conflicting file");
if (fs.existsSync(path.join(conflictRoot, "fresh.txt"))) problems.push("staged apply partially wrote non-conflicting files after a conflict");
fs.rmSync(conflictRoot, { recursive: true, force: true });
fs.rmSync(conflictStage, { recursive: true, force: true });

const rulesRoot = path.join(repoRoot, "template", ".claude", "rules");
const ruleFiles = walkFiles(rulesRoot)
  .filter((file) => file.endsWith(".md"))
  .filter((file) => path.basename(file) !== "README.md");

for (const file of ruleFiles) {
  const content = fs.readFileSync(file, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!frontmatter) {
    problems.push(`${relative(file)}: missing YAML frontmatter`);
    continue;
  }
  if (!/^description:\s*\S.+$/m.test(frontmatter)) {
    problems.push(`${relative(file)}: missing non-empty description metadata`);
  }

  const lines = frontmatter.split(/\r?\n/);
  const pathsIndex = lines.findIndex((line) => line === "paths:");
  const isGlobal = path.basename(file) === "security.md";
  if (isGlobal) {
    if (pathsIndex >= 0) problems.push(`${relative(file)}: global rule must omit paths`);
    continue;
  }
  if (pathsIndex < 0) {
    problems.push(`${relative(file)}: path-scoped rule must declare paths YAML list`);
    continue;
  }

  const scopeLines = lines.slice(pathsIndex + 1);
  const hasConcreteItem = scopeLines.some((line) => /^  - "[^"]+"$/.test(line));
  const hasTemplateBlock = scopeLines.some((line) => /^\{\{(?:CODE_STYLE|TESTING)_PATHS\}\}$/.test(line));
  if (!hasConcreteItem && !hasTemplateBlock) {
    problems.push(`${relative(file)}: paths must be a quoted YAML list or approved template block`);
  }
}

const hookPath = path.join(repoRoot, "template", ".claude", "hooks", "lint-on-edit.cjs");
const wrapperPath = path.join(repoRoot, "template", ".codex", "hooks", "lint-on-edit.cjs");
const hookCases = [
  ["valid file input", JSON.stringify({ cwd: repoRoot, tool_input: { file_path: "README.md" } })],
  ["empty input", ""],
  ["Codex patch input", JSON.stringify({
    cwd: repoRoot,
    tool_input: { command: "*** Begin Patch\n*** Update File: README.md\n*** End Patch" },
  })],
  ["malformed JSON", "{invalid"],
];

for (const [name, input] of hookCases) {
  const result = spawnSync(process.execPath, [hookPath], {
    cwd: repoRoot,
    input,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    problems.push(`hook ${name}: expected exit 0, got ${result.status}`);
  }
  if (name === "malformed JSON" && !result.stderr.includes("malformed hook JSON")) {
    problems.push("hook malformed JSON: expected concise warning");
  }
}

const esmRoot = fs.mkdtempSync(path.join(realTmpRoot, "project-workflow-esm-hooks-"));
fs.mkdirSync(path.join(esmRoot, ".claude", "hooks"), { recursive: true });
fs.mkdirSync(path.join(esmRoot, ".codex", "hooks"), { recursive: true });
fs.writeFileSync(path.join(esmRoot, "package.json"), JSON.stringify({ type: "module" }));
fs.copyFileSync(hookPath, path.join(esmRoot, ".claude", "hooks", "lint-on-edit.cjs"));
fs.copyFileSync(wrapperPath, path.join(esmRoot, ".codex", "hooks", "lint-on-edit.cjs"));

const esmScripts = [
  ["Claude hook", ".claude/hooks/lint-on-edit.cjs"],
  ["Codex wrapper", ".codex/hooks/lint-on-edit.cjs"],
];
const esmInputs = [
  ["valid file input", JSON.stringify({ cwd: esmRoot, tool_input: { file_path: "package.json" } })],
  ["empty input", ""],
  ["patch input", JSON.stringify({
    cwd: esmRoot,
    tool_input: { command: "*** Begin Patch\n*** Update File: package.json\n*** End Patch" },
  })],
  ["malformed JSON", "{invalid"],
];

for (const [scriptName, script] of esmScripts) {
  for (const [inputName, input] of esmInputs) {
    const result = spawnSync(process.execPath, [path.join(esmRoot, script)], {
      cwd: esmRoot,
      input,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      problems.push(`hook ${scriptName} ${inputName} in ESM project: expected exit 0, got ${result.status}`);
    }
    if (inputName === "malformed JSON" && !result.stderr.includes("malformed hook JSON")) {
      problems.push(`hook ${scriptName} malformed JSON in ESM project: expected concise warning`);
    }
  }
}
fs.rmSync(esmRoot, { recursive: true, force: true });

for (const config of [
  path.join(repoRoot, "template", ".claude", "settings.json"),
  path.join(repoRoot, "template", ".codex", "hooks.json"),
]) {
  const content = fs.readFileSync(config, "utf8");
  if (!content.includes("lint-on-edit.cjs") || content.includes("lint-on-edit.js")) {
    problems.push(`${relative(config)}: hook configuration must reference .cjs only`);
  }
}

const codexHookConfig = fs.readFileSync(path.join(repoRoot, "template", ".codex", "hooks.json"), "utf8");
if (!codexHookConfig.includes("commandWindows") || !codexHookConfig.includes("powershell -NoProfile")) {
  problems.push("template/.codex/hooks.json: Windows command override is required");
}

const hookContent = fs.readFileSync(hookPath, "utf8");
for (const marker of ["Scripts', `${name}.exe`", "Scripts', `${name}.cmd`", ".bin', `${name}.cmd`"]) {
  if (!hookContent.includes(marker)) problems.push(`template hook: missing Windows local-bin marker ${JSON.stringify(marker)}`);
}

if (problems.length > 0) {
  console.error("Template contract check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Template contracts OK: staged/strict baseline boundaries + ${ruleFiles.length} rules + ${hookCases.length + (esmScripts.length * esmInputs.length)} hook cases.`);
