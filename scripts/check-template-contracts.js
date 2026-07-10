#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const problems = [];

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

const esmRoot = fs.mkdtempSync(path.join(os.tmpdir(), "project-workflow-esm-hooks-"));
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

console.log(`Template contracts OK: ${ruleFiles.length} rules + ${hookCases.length + (esmScripts.length * esmInputs.length)} hook cases.`);
