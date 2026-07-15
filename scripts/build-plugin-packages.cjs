#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const sourceRepoUrl = "https://github.com/shrekshrek/project-workflow/blob/main";
const expectedActions = [
  "agents-md-revise",
  "feature-archive",
  "feature-done",
  "feature-init",
  "project-init",
  "project-personalize",
  "spec-quality-check",
  "spec-reconcile",
  "spec-revise",
];
const expectedReviewers = [
  "agents-md-reviewer",
  "codebase-explorer",
  "decision-completeness-auditor",
  "spec-quality-reviewer",
  "spec-reviewer",
  "tech-researcher",
];

const sharedDirectories = [
  ["docs/actions", "docs/actions"],
  ["docs/reviewers", "docs/reviewers"],
  ["template", "template"],
];

const sharedFiles = [
  ["docs/workflow.md", "docs/workflow.md"],
  ["docs/spec-driven.md", "docs/spec-driven.md"],
  ["docs/cross-tool-methodology.md", "docs/cross-tool-methodology.md"],
  ["docs/gotchas.md", "docs/gotchas.md"],
  ["docs/tooling.md", "docs/tooling.md"],
  ["docs/quickstart.md", "docs/quickstart.md"],
  ["docs/examples/full-feature-artifact.md", "docs/examples/full-feature-artifact.md"],
  ["scripts/relocate-markdown-links.cjs", "scripts/relocate-markdown-links.cjs"],
  ["scripts/materialize-project-baseline.cjs", "scripts/materialize-project-baseline.cjs"],
  ["scripts/materialize-feature-artifact.cjs", "scripts/materialize-feature-artifact.cjs"],
  ["LICENSE", "LICENSE"],
];

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

function copyFile(source, target, transform = (value) => value) {
  if (!fs.existsSync(source)) throw new Error(`Missing package source: ${path.relative(repoRoot, source)}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (/\.(?:md|json|c?js)$/.test(source)) {
    fs.writeFileSync(target, transform(fs.readFileSync(source, "utf8")));
    fs.chmodSync(target, fs.statSync(source).mode);
  } else {
    fs.copyFileSync(source, target);
  }
}

function copyDirectory(source, target, transform = (value) => value, include = () => true) {
  if (!fs.existsSync(source)) throw new Error(`Missing package source: ${path.relative(repoRoot, source)}`);
  for (const file of walkFiles(source)) {
    const relative = path.relative(source, file);
    if (!include(relative)) continue;
    copyFile(file, path.join(target, relative), transform);
  }
}

function includeTemplateFile(relative, host) {
  const normalized = relative.split(path.sep).join("/");
  if (host === "claude") return !normalized.startsWith(".codex/");
  return !normalized.startsWith(".claude/");
}

function sourceLink(relative) {
  return `${sourceRepoUrl}/${relative}`;
}

function transformDocumentation(content, host) {
  let transformed = content
    .replace(/\]\(\.\.\/README\.md([^)#]*)?(#[^)]+)?\)/g, `](${sourceRepoUrl}/README.md$2)`)
    .replace(/\]\(\.\.\/scripts\/([^)]+)\)/g, `](${sourceRepoUrl}/scripts/$1)`)
    .replace(/\]\(\.\.\/examples\/reviewer-mutation-smoke\.md([^)#]*)?(#[^)]+)?\)/g, `](${sourceRepoUrl}/docs/examples/reviewer-mutation-smoke.md$2)`);

  if (host === "claude") {
    transformed = transformed
      .replace(/\]\(\.\.\/adapters\/claude\/skills\/([^)]+)\)/g, "](../skills/$1)")
      .replace(/\]\(\.\.\/adapters\/claude\/agents\/([^)]+)\)/g, "](../agents/$1)")
      .replace(/\]\(\.\.\/adapters\/codex\/skills\/([^)]+)\)/g, (_, value) => `](${sourceLink(`adapters/codex/skills/${value}`)})`);
  } else {
    transformed = transformed
      .replace(/\]\(\.\.\/adapters\/codex\/skills\/([^)]+)\)/g, "](../skills/$1)")
      .replace(/\]\(\.\.\/adapters\/claude\/skills\/([^)]+)\)/g, (_, value) => `](${sourceLink(`adapters/claude/skills/${value}`)})`)
      .replace(/\]\(\.\.\/adapters\/claude\/agents\/([^)]+)\)/g, "](reviewers/$1)")
      .replace(/\]\(\.\.\/agents\/([^)]+)\)/g, "](reviewers/$1)");
  }
  return transformed;
}

function transformAdapter(content, host) {
  if (host !== "codex") return content;
  return content.replaceAll("../../../../docs/", "../../docs/");
}

function skillNames(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(root, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
}

function sameList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function requirePath(packageRoot, relative) {
  if (!fs.existsSync(path.join(packageRoot, relative))) {
    throw new Error(`${path.basename(path.dirname(packageRoot))} package missing ${relative}`);
  }
}

function validatePackage(packageRoot, host) {
  const manifestPath = path.join(packageRoot, host === "claude" ? ".claude-plugin/plugin.json" : ".codex-plugin/plugin.json");
  requirePath(packageRoot, path.relative(packageRoot, manifestPath));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.name !== "project-workflow") throw new Error(`${host} manifest name changed`);

  const names = skillNames(path.join(packageRoot, "skills"));
  if (!sameList(names, expectedActions)) {
    throw new Error(`${host} package action set differs: ${names.join(", ")}`);
  }
  for (const name of expectedActions) requirePath(packageRoot, `docs/actions/${name}.md`);
  for (const name of expectedReviewers) requirePath(packageRoot, `docs/reviewers/${name}.md`);
  for (const relative of [
    "template/AGENTS.md",
    "scripts/materialize-feature-artifact.cjs",
    "scripts/materialize-project-baseline.cjs",
    "scripts/relocate-markdown-links.cjs",
    "docs/actions/project-personalize-reference.md",
  ]) requirePath(packageRoot, relative);

  if (host === "claude") {
    requirePath(packageRoot, "template/.claude/settings.json");
    const reviewers = fs.readdirSync(path.join(packageRoot, "agents"))
      .filter((value) => value.endsWith(".md"))
      .map((value) => value.replace(/\.md$/, ""))
      .sort();
    if (!sameList(reviewers, expectedReviewers)) {
      throw new Error(`Claude package agent set differs: ${reviewers.join(", ")}`);
    }
    if (fs.existsSync(path.join(packageRoot, "plugins"))) {
      throw new Error("Claude package must not contain the Codex plugin package");
    }
    if (fs.existsSync(path.join(packageRoot, "template/.codex"))) {
      throw new Error("Claude package must not contain Codex-private template assets");
    }
  } else {
    requirePath(packageRoot, "template/.codex/hooks.json");
    if (manifest.skills !== "./skills/") throw new Error("Codex manifest skills path must be ./skills/");
    if (fs.existsSync(path.join(packageRoot, "agents"))) {
      throw new Error("Codex package must use reviewer specs through native subagents, not Claude agent adapters");
    }
    if (fs.existsSync(path.join(packageRoot, "template/.claude"))) {
      throw new Error("Codex package must not contain Claude-private template assets");
    }
  }

  const hookPath = path.join(packageRoot, host === "claude"
    ? "template/.claude/hooks/lint-on-edit.cjs"
    : "template/.codex/hooks/lint-on-edit.cjs");
  const hookResult = spawnSync(process.execPath, [hookPath], {
    cwd: packageRoot,
    encoding: "utf8",
    input: "{}\n",
  });
  if (hookResult.status !== 0) {
    throw new Error(`${host} packaged hook is not self-contained: ${hookResult.stderr.trim()}`);
  }
  return manifest.version;
}

function validateLinks(packageRoots) {
  const checker = path.join(repoRoot, "scripts", "check-markdown-links.cjs");
  const targets = packageRoots.flatMap((root) => ["docs", "skills", "agents"].map((entry) => path.join(root, entry)))
    .filter((target) => fs.existsSync(target));
  const result = spawnSync(process.execPath, [checker, ...targets], { cwd: repoRoot, encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error("Generated package Markdown validation failed");
  }
}

function buildHost(host, outputRoot) {
  const packageRoot = path.join(outputRoot, host, "project-workflow");
  const adapterRoot = path.join(repoRoot, "adapters", host);
  copyDirectory(adapterRoot, packageRoot, (value) => transformAdapter(value, host));

  for (const [sourceRelative, targetRelative] of sharedDirectories) {
    const transform = sourceRelative.startsWith("docs/")
      ? (value) => transformDocumentation(value, host)
      : (value) => value;
    const include = sourceRelative === "template"
      ? (relative) => includeTemplateFile(relative, host)
      : undefined;
    copyDirectory(path.join(repoRoot, sourceRelative), path.join(packageRoot, targetRelative), transform, include);
  }
  for (const [sourceRelative, targetRelative] of sharedFiles) {
    const transform = sourceRelative.startsWith("docs/")
      ? (value) => transformDocumentation(value, host)
      : (value) => value;
    copyFile(path.join(repoRoot, sourceRelative), path.join(packageRoot, targetRelative), transform);
  }
  if (host === "codex") {
    // Keep one source implementation while shipping a host-self-contained Codex hook.
    copyFile(
      path.join(repoRoot, "template/.claude/hooks/lint-on-edit.cjs"),
      path.join(packageRoot, "template/.codex/hooks/lint-on-edit.cjs"),
    );
  }
  return packageRoot;
}

function writeGeneratedMarketplaces(outputRoot) {
  const claudeMarketplace = {
    name: "project-workflow",
    owner: { name: "shrek.wang" },
    metadata: {
      description: "project-workflow v3 — spec-driven feature development blueprint for AI-assisted coding",
    },
    plugins: [{ name: "project-workflow", source: "./claude/project-workflow" }],
  };
  const codexMarketplace = {
    name: "project-workflow",
    interface: { displayName: "Project Workflow" },
    plugins: [{
      name: "project-workflow",
      source: { source: "local", path: "./codex/project-workflow" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Productivity",
    }],
  };
  const claudePath = path.join(outputRoot, ".claude-plugin", "marketplace.json");
  const codexPath = path.join(outputRoot, ".agents", "plugins", "marketplace.json");
  fs.mkdirSync(path.dirname(claudePath), { recursive: true });
  fs.mkdirSync(path.dirname(codexPath), { recursive: true });
  fs.writeFileSync(claudePath, `${JSON.stringify(claudeMarketplace, null, 2)}\n`);
  fs.writeFileSync(codexPath, `${JSON.stringify(codexMarketplace, null, 2)}\n`);
}

function build(outputRoot) {
  if (path.resolve(outputRoot) === repoRoot) throw new Error("Output root must not be the source repository");
  if (fs.existsSync(outputRoot) && fs.readdirSync(outputRoot).length > 0) {
    throw new Error(`Output root must be empty: ${outputRoot}`);
  }
  fs.mkdirSync(outputRoot, { recursive: true });

  const claudeRoot = buildHost("claude", outputRoot);
  const codexRoot = buildHost("codex", outputRoot);
  writeGeneratedMarketplaces(outputRoot);
  const claudeVersion = validatePackage(claudeRoot, "claude");
  const codexVersion = validatePackage(codexRoot, "codex");
  if (claudeVersion !== codexVersion) {
    throw new Error(`Plugin version mismatch: Claude=${claudeVersion}, Codex=${codexVersion}`);
  }
  validateLinks([claudeRoot, codexRoot]);
  console.log(`Plugin packages built: v${claudeVersion} (${outputRoot})`);
  return { claudeRoot, codexRoot, version: claudeVersion };
}

function parseOutput() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--check") return { check: true };
  if (args.length === 2 && args[0] === "--out") return { output: path.resolve(args[1]) };
  throw new Error("Usage: node scripts/build-plugin-packages.cjs --check | --out <empty-directory>");
}

if (require.main === module) {
  let temporaryRoot = null;
  try {
    const options = parseOutput();
    const outputRoot = options.check
      ? path.join((temporaryRoot = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "project-workflow-packages-"))), "dist")
      : options.output;
    build(outputRoot);
  } finally {
    if (temporaryRoot) fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

module.exports = { build };
