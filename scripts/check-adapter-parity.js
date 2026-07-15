#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const claudeAdapterRoot = path.join(repoRoot, "adapters", "claude");
const codexAdapterRoot = path.join(repoRoot, "adapters", "codex");
const claudeSkillsRoot = path.join(claudeAdapterRoot, "skills");
const codexSkillsRoot = path.join(codexAdapterRoot, "skills");
const actionsRoot = path.join(repoRoot, "docs", "actions");
const claudeAgentsRoot = path.join(claudeAdapterRoot, "agents");
const claudeManifestPath = path.join(claudeAdapterRoot, ".claude-plugin", "plugin.json");
const codexManifestPath = path.join(codexAdapterRoot, ".codex-plugin", "plugin.json");

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

const lifecycleLinkActions = ["feature-archive", "spec-reconcile"];
const lifecycleLinkScriptRef = "scripts/relocate-markdown-links.cjs";
const lifecycleLinkScriptPath = path.join(repoRoot, lifecycleLinkScriptRef);
const expectedReviewerAdapters = [
  "agents-md-reviewer",
  "codebase-explorer",
  "decision-completeness-auditor",
  "spec-quality-reviewer",
  "spec-reviewer",
  "tech-researcher",
];

const requiredReviewerRefs = {
  "agents-md-revise": ["decision-completeness-auditor"],
  "feature-done": ["agents-md-reviewer", "spec-reviewer"],
  "feature-init": ["decision-completeness-auditor"],
  "project-personalize": ["codebase-explorer", "decision-completeness-auditor", "tech-researcher"],
  "spec-quality-check": ["spec-quality-reviewer"],
  "spec-revise": ["decision-completeness-auditor"],
};

const reachableReviewers = [...new Set(Object.values(requiredReviewerRefs).flat())].sort();

const canonicalOwnership = {
  "agents-md-revise": ["## Workflow", "## Invariants", "## Validation"],
  "feature-archive": ["## Workflow", "## Invariants", "## Validation"],
  "feature-done": ["## Review Layers", "## Delivery Receipt", "## Verdict", "## Invariants"],
  "feature-init": ["## Lane Classification", "## Workflow", "## Invariants", "## Validation"],
  "project-init": ["## Workflow", "## Invariants"],
  "project-personalize": ["## Workflow", "## Invariants", "## Validation"],
  "spec-quality-check": ["## Checks", "### Mechanical check table", "## Workflow", "## Verdict"],
  "spec-reconcile": ["## Workflow", "## Verdict", "## Invariants"],
  "spec-revise": ["## Workflow", "## Invariants", "## Validation"],
};

const adapterOwnedSectionHeadings = [
  "## Workflow",
  "## Verdict",
  "## Failure modes",
  "## Lane Classification",
  "## Delivery Receipt",
  "## Mechanical check table",
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
if (!sameList(reachableReviewers, [...expectedReviewerAdapters].sort())) {
  const missing = expectedReviewerAdapters.filter((name) => !reachableReviewers.includes(name));
  problems.push(`Reviewer call matrix leaves roles unreachable: ${missing.join(", ")}`);
}

for (const name of expected) {
  const actionPath = path.join(actionsRoot, `${name}.md`);
  if (!fs.existsSync(actionPath)) {
    problems.push(`missing canonical action docs/actions/${name}.md`);
  } else {
    const actionContent = fs.readFileSync(actionPath, "utf8");
    for (const marker of canonicalOwnership[name]) {
      if (!actionContent.includes(marker)) {
        problems.push(`canonical ${name}: missing portable contract section ${marker}`);
      }
    }
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
    for (const heading of adapterOwnedSectionHeadings) {
      if (content.includes(heading)) {
        problems.push(`${adapter} ${name}: adapter duplicates canonical-owned section ${heading}`);
      }
    }
    if (/^\|\s*M(?:1|1b)\s*\|/m.test(content)) {
      problems.push(`${adapter} ${name}: adapter duplicates the canonical mechanical check table`);
    }
    if (/^\|\s*\*\*?(?:Verdict|Checks|L2|L3|Current truth)\*\*?\s*\|/mi.test(content)) {
      problems.push(`${adapter} ${name}: adapter duplicates the canonical delivery receipt schema`);
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
      for (const reviewer of requiredReviewerRefs[name] || []) {
        if (!content.includes(`docs/reviewers/${reviewer}.md`)) {
          problems.push(`Codex ${name}: canonical reviewer reference missing for ${reviewer}`);
        }
      }
      if (lifecycleLinkActions.includes(name) && !content.includes(lifecycleLinkScriptRef)) {
        problems.push(`Codex ${name}: lifecycle link relocator reference missing`);
      }
    } else {
      const canonicalRuntimeRef = `\${CLAUDE_PLUGIN_ROOT}/docs/actions/${name}.md`;
      if (!content.includes(canonicalRuntimeRef) || !content.includes("Read") || !content.includes("completely")) {
        problems.push(`Claude ${name}: installed-plugin canonical Read must use ${canonicalRuntimeRef}`);
      }
      for (const reviewer of requiredReviewerRefs[name] || []) {
        if (!content.includes(reviewer)) {
          problems.push(`Claude ${name}: named reviewer dispatch missing for ${reviewer}`);
        }
      }
      if (lifecycleLinkActions.includes(name) && !content.includes(lifecycleLinkScriptRef)) {
        problems.push(`Claude ${name}: lifecycle link relocator reference missing`);
      }
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

for (const name of expectedReviewerAdapters) {
  const adapterPath = path.join(claudeAgentsRoot, `${name}.md`);
  if (!fs.existsSync(adapterPath)) {
    problems.push(`missing Claude reviewer adapter agents/${name}.md`);
    continue;
  }
  const content = fs.readFileSync(adapterPath, "utf8");
  if (/^model:/m.test(content)) {
    problems.push(`Claude reviewer ${name}: fixed model selection must remain host-controlled`);
  }
  const canonicalRuntimeRef = `\${CLAUDE_PLUGIN_ROOT}/docs/reviewers/${name}.md`;
  if (!content.includes(canonicalRuntimeRef) || !content.includes("read completely")) {
    problems.push(`Claude reviewer ${name}: canonical Read must use ${canonicalRuntimeRef}`);
  }
}

const codexAgentsRoot = path.join(codexAdapterRoot, "agents");
if (fs.existsSync(codexAgentsRoot) && fs.readdirSync(codexAgentsRoot).length > 0) {
  problems.push("Codex package must use bundled reviewer specs, not Claude agent adapters");
}

if (problems.length > 0) {
  console.error("Adapter parity check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Adapter parity OK: 9 Claude-native skills + 9 Codex-native skills.");
