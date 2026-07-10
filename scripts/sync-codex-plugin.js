#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pluginRoot = path.join(repoRoot, "plugins", "project-workflow");
const checkOnly = process.argv.includes("--check");
const sourceRepoUrl = "https://github.com/shrekshrek/project-workflow/blob/main";

const copiedDirs = [
  ["docs/actions", "docs/actions"],
  ["docs/examples", "docs/examples"],
  ["docs/reviewers", "docs/reviewers"],
  ["template", "template"],
];

const copiedFiles = [
  ["skills/project-init/reference.md", "skills/project-init/reference.md"],
  ["docs/workflow.md", "docs/workflow.md"],
  ["docs/spec-driven.md", "docs/spec-driven.md"],
  ["docs/cross-tool-methodology.md", "docs/cross-tool-methodology.md"],
  ["docs/gotchas.md", "docs/gotchas.md"],
  ["docs/tooling.md", "docs/tooling.md"],
  ["docs/quickstart.md", "docs/quickstart.md"],
  ["docs/adapters/codex-scoped-rule-bridge.md", "docs/adapters/codex-scoped-rule-bridge.md"],
  ["scripts/relocate-markdown-links.cjs", "scripts/relocate-markdown-links.cjs"],
];

const removedTemplateFiles = [
  "template/docs/spec-driven.md",
];

const removedPluginDirs = [
  "agents",
];

function transformPluginDoc(content) {
  return content
    .replace(/\]\(\.\.\/README\.md([^)#]*)?(#[^)]+)?\)/g, `](${sourceRepoUrl}/README.md$2)`)
    .replace(/\]\(\.\.\/scripts\/([^)]+)\)/g, `](${sourceRepoUrl}/scripts/$1)`)
    .replace(/\]\(\.\.\/agents\/([^)]+)\)/g, "](reviewers/$1)");
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function fileEquals(left, right) {
  if (!fs.existsSync(left) || !fs.existsSync(right)) return false;
  return fs.readFileSync(left).equals(fs.readFileSync(right));
}

function textFileEquals(source, target, transform = (value) => value) {
  if (!fs.existsSync(source) || !fs.existsSync(target)) return false;
  return transform(fs.readFileSync(source, "utf8")) === fs.readFileSync(target, "utf8");
}

function compareDir(source, target) {
  const sourceFiles = walkFiles(source).map((file) => path.relative(source, file)).sort();
  const targetFiles = walkFiles(target).map((file) => path.relative(target, file)).sort();
  const sourceSet = new Set(sourceFiles);
  const targetSet = new Set(targetFiles);
  const problems = [];

  for (const rel of sourceFiles) {
    const sourceFile = path.join(source, rel);
    const targetFile = path.join(target, rel);
    if (!targetSet.has(rel)) {
      problems.push(`missing ${path.relative(repoRoot, targetFile)}`);
    } else if (!fileEquals(sourceFile, targetFile)) {
      problems.push(`diff ${path.relative(repoRoot, targetFile)}`);
    }
  }

  for (const rel of targetFiles) {
    if (!sourceSet.has(rel)) {
      problems.push(`extra ${path.relative(repoRoot, path.join(target, rel))}`);
    }
  }

  return problems;
}

function copyDir(source, target) {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function copyTextFile(source, target, transform = (value) => value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, transform(fs.readFileSync(source, "utf8")));
}

const problems = [];

for (const targetRel of removedPluginDirs) {
  const target = path.join(pluginRoot, targetRel);
  if (checkOnly) {
    if (walkFiles(target).length > 0) {
      problems.push(`extra ${path.relative(repoRoot, target)}/`);
    }
  } else {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

for (const targetRel of removedTemplateFiles) {
  const target = path.join(repoRoot, targetRel);
  if (checkOnly) {
    if (fs.existsSync(target)) {
      problems.push(`extra ${path.relative(repoRoot, target)}`);
    }
  } else {
    fs.rmSync(target, { force: true });
  }
}

for (const [sourceRel, targetRel] of copiedDirs) {
  const source = path.join(repoRoot, sourceRel);
  const target = path.join(pluginRoot, targetRel);
  if (checkOnly) {
    problems.push(...compareDir(source, target));
  } else {
    copyDir(source, target);
  }
}

for (const [sourceRel, targetRel] of copiedFiles) {
  const source = path.join(repoRoot, sourceRel);
  const target = path.join(pluginRoot, targetRel);
  const transform = targetRel.startsWith("docs/") ? transformPluginDoc : (value) => value;
  if (checkOnly) {
    if (!textFileEquals(source, target, transform)) {
      problems.push(`diff ${path.relative(repoRoot, target)}`);
    }
  } else {
    copyTextFile(source, target, transform);
  }
}

if (problems.length > 0) {
  console.error("Codex plugin package is out of sync:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(checkOnly ? "Codex plugin package is in sync." : "Codex plugin package synced.");
