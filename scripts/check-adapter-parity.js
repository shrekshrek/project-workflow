#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const claudeSkillsRoot = path.join(repoRoot, "skills");
const codexPackageRoot = path.join(repoRoot, "plugins", "project-workflow");
const codexSkillsRoot = path.join(repoRoot, "plugins", "project-workflow", "skills");
const actionsRoot = path.join(repoRoot, "docs", "actions");
const claudeManifestPath = path.join(repoRoot, ".claude-plugin", "plugin.json");
const codexManifestPath = path.join(repoRoot, "plugins", "project-workflow", ".codex-plugin", "plugin.json");

const expected = [
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

const codexForbidden = [
  "AskUserQuestion",
  "Task tool",
  "subagent_type:",
  "/project-workflow:",
  "Claude Code-native",
  "Claude Code execution",
];

const codexRuleBridgeActions = [
  "agents-md-revise",
  "feature-done",
  "feature-init",
  "project-init",
  "project-personalize",
  "spec-revise",
];
const codexRuleBridgeRef = "docs/adapters/codex-scoped-rule-bridge.md";
const codexRuleBridgePath = path.join(repoRoot, codexRuleBridgeRef);
const lifecycleLinkActions = ["feature-archive", "spec-reconcile"];
const lifecycleLinkScriptRef = "scripts/relocate-markdown-links.cjs";
const lifecycleLinkScriptPath = path.join(repoRoot, lifecycleLinkScriptRef);
const packagedLifecycleLinkScriptPath = path.join(codexPackageRoot, lifecycleLinkScriptRef);
const codexRuleBridgeMarkers = [
  ".claude/rules/**/*.md",
  "paths:",
  "YAML list",
  "unsupported",
  "ambiguous",
  "L3",
];

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

function lineCount(content) {
  return content.split(/\r?\n/).length - (content.endsWith("\n") ? 1 : 0);
}

const problems = [];
const claudeNames = skillNames(claudeSkillsRoot);
const codexNames = skillNames(codexSkillsRoot);
const claudeManifest = JSON.parse(fs.readFileSync(claudeManifestPath, "utf8"));
const codexManifest = JSON.parse(fs.readFileSync(codexManifestPath, "utf8"));

if (!fs.existsSync(lifecycleLinkScriptPath)) {
  problems.push(`missing ${lifecycleLinkScriptRef}`);
}

if (!fs.existsSync(packagedLifecycleLinkScriptPath)) {
  problems.push(`Codex package: missing ${lifecycleLinkScriptRef}`);
}

if (!fs.existsSync(codexRuleBridgePath)) {
  problems.push(`missing ${codexRuleBridgeRef}`);
} else {
  const bridgeContent = fs.readFileSync(codexRuleBridgePath, "utf8");
  for (const marker of codexRuleBridgeMarkers) {
    if (!bridgeContent.includes(marker)) {
      problems.push(`Codex scoped-rule bridge: required contract marker missing ${JSON.stringify(marker)}`);
    }
  }
  if (bridgeContent.includes("globs:")) {
    problems.push("Codex scoped-rule bridge must not retain legacy scope-key compatibility");
  }
}

if (claudeManifest.name !== "project-workflow" || codexManifest.name !== "project-workflow") {
  problems.push("Both plugin manifests must keep the project-workflow identity");
}
if (claudeManifest.version !== codexManifest.version) {
  problems.push(`Plugin version mismatch: Claude=${claudeManifest.version}, Codex=${codexManifest.version}`);
}
if (codexManifest.skills !== "./skills/") {
  problems.push(`Codex manifest skills path must be ./skills/, got ${codexManifest.skills}`);
}
if ((codexManifest.interface?.defaultPrompt?.length || 0) > 3) {
  problems.push("Codex manifest defaultPrompt supports at most 3 entries");
}

if (!sameList(claudeNames, expected)) {
  problems.push(`Claude action set mismatch: ${claudeNames.join(", ")}`);
}
if (!sameList(codexNames, expected)) {
  problems.push(`Codex action set mismatch: ${codexNames.join(", ")}`);
}
if (!sameList(claudeNames, codexNames)) {
  problems.push("Claude and Codex action sets differ");
}

for (const name of expected) {
  const actionPath = path.join(actionsRoot, `${name}.md`);
  if (!fs.existsSync(actionPath)) {
    problems.push(`missing canonical action docs/actions/${name}.md`);
  }

  for (const [adapter, root] of [["Claude", claudeSkillsRoot], ["Codex", codexSkillsRoot]]) {
    const skillPath = path.join(root, name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;
    const content = fs.readFileSync(skillPath, "utf8");
    const declaredName = content.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    if (declaredName !== name) {
      problems.push(`${adapter} ${name}: frontmatter name is ${declaredName || "missing"}`);
    }
    if (!content.includes(`docs/actions/${name}.md`)) {
      problems.push(`${adapter} ${name}: canonical action reference missing`);
    }
    const lines = lineCount(content);
    if (lines >= 200) {
      problems.push(`${adapter} ${name}: SKILL.md is ${lines} lines (must be < 200)`);
    }
    if (adapter === "Codex") {
      const links = [...content.matchAll(/\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)];
      for (const match of links) {
        if (/^[a-z]+:/i.test(match[1])) continue;
        const resolved = path.resolve(path.dirname(skillPath), match[1]);
        if (!fs.existsSync(resolved)) {
          problems.push(`Codex ${name}: broken local reference ${match[1]}`);
        }
      }
      if (codexRuleBridgeActions.includes(name) && !content.includes(codexRuleBridgeRef)) {
        problems.push(`Codex ${name}: scoped-rule bridge reference missing`);
      }
      if (lifecycleLinkActions.includes(name) && !content.includes(lifecycleLinkScriptRef)) {
        problems.push(`Codex ${name}: lifecycle link relocator reference missing`);
      }
    } else if (content.includes(codexRuleBridgeRef)) {
      problems.push(`Claude ${name}: Codex-only scoped-rule bridge leaked into Claude runtime adapter`);
    } else if (lifecycleLinkActions.includes(name) && !content.includes(lifecycleLinkScriptRef)) {
      problems.push(`Claude ${name}: lifecycle link relocator reference missing`);
    }
  }

  const codexPath = path.join(codexSkillsRoot, name, "SKILL.md");
  if (fs.existsSync(codexPath)) {
    const content = fs.readFileSync(codexPath, "utf8");
    for (const marker of codexForbidden) {
      if (content.includes(marker)) {
        problems.push(`Codex ${name}: forbidden Claude-native marker ${JSON.stringify(marker)}`);
      }
    }
  }
}

const codexAgentsRoot = path.join(repoRoot, "plugins", "project-workflow", "agents");
if (fs.existsSync(codexAgentsRoot) && fs.readdirSync(codexAgentsRoot).length > 0) {
  problems.push("Codex package must use bundled reviewer specs, not Claude agent adapters");
}

if (problems.length > 0) {
  console.error("Adapter parity check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Adapter parity OK: 9 Claude-native skills + 9 Codex-native skills.");
