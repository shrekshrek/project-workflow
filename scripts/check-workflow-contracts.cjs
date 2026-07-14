#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const problems = [];

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), "utf8");
}

function requireMarkers(relative, markers) {
  const content = read(relative);
  for (const marker of markers) {
    if (!content.includes(marker)) problems.push(`${relative}: missing contract marker ${JSON.stringify(marker)}`);
  }
}

function forbidMarkers(relative, markers) {
  const content = read(relative);
  for (const marker of markers) {
    if (content.includes(marker)) problems.push(`${relative}: forbidden legacy/unsafe marker ${JSON.stringify(marker)}`);
  }
}

function requireRegex(relative, regex, label) {
  if (!regex.test(read(relative))) problems.push(`${relative}: missing ${label}`);
}

function verdictContract(relative) {
  const match = read(relative).match(/^-?[ \t]*Verdict contract:.*$/m);
  if (!match) {
    problems.push(`${relative}: missing verdict contract`);
    return null;
  }
  return match[0].replace(/^-\s*/, "");
}

const verdictFiles = [
  "docs/actions/feature-done.md",
  "skills/feature-done/SKILL.md",
  "plugins/project-workflow/skills/feature-done/SKILL.md",
];
const verdicts = verdictFiles.map(verdictContract).filter(Boolean);
if (new Set(verdicts).size !== 1) problems.push(`feature-done verdict contracts differ: ${JSON.stringify(verdicts)}`);
if (!verdicts[0]?.includes("only explicit nonblocking advisories")) {
  problems.push("feature-done verdict contract must distinguish blocking findings from nonblocking advisories");
}
forbidMarkers("skills/feature-done/SKILL.md", [
  "Agent 返回空 findings = ✅",
  "L2 ✅/🟡",
  "git checkout HEAD",
]);
requireMarkers("skills/feature-done/SKILL.md", ["blocking partial", "## 验证", "仅 `## Proof Bundle`", "schema self-check", "逐字包含"]);
requireMarkers("plugins/project-workflow/skills/feature-done/SKILL.md", ["100% applicable coverage", "## 验证", "receipt-only edits", "structurally validate", "block verbatim"]);
requireMarkers("docs/actions/feature-done.md", ["Light-lane verification", "100%-coverage evidence", "receipt-only edits", "greenfield full-lane delivery", "area unresolved", "validate the receipt structurally", "block verbatim"]);
requireMarkers("plugins/project-workflow/skills/feature-done/SKILL.md", ["greenfield full-lane delivery", "update pending", "area unresolved"]);
for (const relative of verdictFiles) {
  requireMarkers(relative, ["independently executable", "non-execution only"]);
}

for (const relative of ["docs/reviewers/agents-md-reviewer.md", "docs/reviewers/spec-reviewer.md"]) {
  requireMarkers(relative, ["coverage is 100%", "exact changed", "applicable but unverified", "UNRELIABLE"]);
  forbidMarkers(relative, ["coverage is at least 95%", "coverage >= 95%", "skipped-critical"]);
}
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["definite non-matches", "do not enter the coverage denominator"]);
requireMarkers("docs/reviewers/spec-reviewer.md", ["do not enter the denominator"]);

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
]) {
  requireRegex(relative, /^- Verdict:/m, "receipt Verdict field");
  requireRegex(relative, /^- Change:.*review-scope=\[exact paths reviewed.*endpoint-outputs=/m, "exact review scope and endpoint outputs");
  requireRegex(relative, /^- Checks/m, "receipt Checks field");
  requireRegex(relative, /^- L2:.*findings=<N>.*applicable-rules=/m, "L2 evidence shape");
  requireRegex(relative, /^- Rule sources:.*global=<N>.*matched=<N>.*skipped=<N>.*ambiguous=<N>/m, "bridge source counts");
  requireRegex(relative, /^- L3:/m, "receipt L3 field");
  requireRegex(relative, /^- Current truth:/m, "receipt Current truth field");
}
requireMarkers("template/docs/specs/changes/_template/tasks-light.md", ["verification=<PASS|FAIL>"]);

requireMarkers("docs/actions/feature-init.md", ["do not create a pseudo-lane", "Use full lane for high-risk or contract-shaped work", "Use light lane only when all are true"]);
requireMarkers("skills/feature-init/SKILL.md", ["无需新 artifact", "轻车道", "全道"]);
requireMarkers("plugins/project-workflow/skills/feature-init/SKILL.md", ["no artifact", "light lane", "full lane"]);
for (const relative of ["docs/actions/feature-init.md", "skills/feature-init/SKILL.md", "plugins/project-workflow/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["materialize-feature-artifact.cjs", "no-clobber"]);
}
requireMarkers("scripts/materialize-feature-artifact.cjs", [".project-workflow-nnn-", "wx"]);
requireMarkers("docs/actions/README.md", ["most recently installed compatible package", "required asset"]);
requireMarkers("skills/feature-init/SKILL.md", ["-print0", "xargs -0 ls -t", "scripts/materialize-feature-artifact.cjs"]);
requireMarkers("skills/project-init/SKILL.md", ["-print0", "xargs -0 ls -t", "scripts/materialize-project-baseline.cjs"]);
requireMarkers("docs/workflow.md", ["未改变已声明 current truth", "契约/流程语义变更仍按风险选 light/full"]);

requireMarkers("docs/actions/project-personalize.md", ["complete, partial, unrelated, or missing project-workflow baseline", "A non-empty codebase without `AGENTS.md` is retrofit, not greenfield"]);
requireMarkers("skills/project-personalize/SKILL.md", ["partial/missing baseline", "materialize-project-baseline.cjs", "{{HOOK_INDEX}}"]) ;
requireMarkers("plugins/project-workflow/skills/project-personalize/SKILL.md", ["complete, partial/custom, or missing", "materialize-project-baseline.cjs", "hook index"]);
requireMarkers("skills/project-personalize/SKILL.md", ["--stage", "Consolidated Preview + Apply Gate", "target 保持不变", "symlink"]);
requireMarkers("plugins/project-workflow/skills/project-personalize/SKILL.md", ["--stage", "one consolidated diff", "leaves the target unchanged", "symlink"]);

requireMarkers("template/AGENTS.md", ["{{HOOK_INDEX}}"]) ;
forbidMarkers("template/AGENTS.md", [".claude/hooks/", ".codex/hooks.json"]);
requireMarkers("skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "reusable template", "hook: not installed + reason", "--apply-staged", "唯一 target write gate"]);
forbidMarkers("skills/project-init/SKILL.md", ["rm -f ./.claude/settings.json", "-exec cp -r"]);
requireMarkers("plugins/project-workflow/skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "hook index", "stage no hook files/mapping", "--stage", "leaves the target unchanged"]);
requireMarkers("README.md", ["docs/specs/_template/", "docs/specs/changes/", "docs/adr/0000-template.md", "All reusable templates stay"]);
for (const relative of ["docs/actions/project-init.md", "docs/actions/project-personalize.md", "skills/project-init/SKILL.md", "skills/project-personalize/SKILL.md"]) {
  forbidMarkers(relative, ["scaffold/inactive", "inactive scaffold"]);
}

requireMarkers("docs/actions/spec-revise.md", ["ADRs are conditional", "two approval points", "without changing the worktree"]);
requireMarkers("template/docs/adr/README.md", ["ADR_REQUIRED", "项目目录不保留空模板"]);
for (const relative of ["skills/spec-revise/SKILL.md", "plugins/project-workflow/skills/spec-revise/SKILL.md"]) {
  requireMarkers(relative, ["ADR_REQUIRED", "proposed diff"]);
  requireRegex(relative, /accepted[- ]spec|accepted spec|已确认.*spec/, "accepted-spec trigger");
  forbidMarkers(relative, ["git checkout", "docs/adr/0000-template.md` to"]);
}
requireMarkers("skills/spec-revise/SKILL.md", ["${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md", "worktree 保持不变"]);
requireMarkers("plugins/project-workflow/skills/spec-revise/SKILL.md", ["plugin's bundled `template/docs/adr/0000-template.md`", "only then apply"]);

requireMarkers("docs/quickstart.md", ["area unresolved"]);
forbidMarkers("docs/quickstart.md", ["current-truth check(仅当", "使用 feature spec + ADR"]);
requireMarkers("template/docs/adr/README.md", ["ADR_REQUIRED"]);
forbidMarkers("template/docs/adr/README.md", ["/agents-md-revise` 周期性点名", "零引用 + 60 天以上"]);
for (const relative of ["docs/actions/agents-md-revise.md", "skills/agents-md-revise/SKILL.md", "plugins/project-workflow/skills/agents-md-revise/SKILL.md"]) {
  forbidMarkers(relative, ["current-truth freshness", "current-truth 新鲜度", "ADR orphan", "ADR 孤儿"]);
}
forbidMarkers("skills/agents-md-revise/SKILL.md", ["every 2-4 weeks", "每 2-4 周", "每 2 周"]);

for (const relative of ["docs/workflow.md", "skills/agents-md-revise/SKILL.md"]) {
  forbidMarkers(relative, ["Item 5a", "Item 5b", "proof bundle 5 项"]);
}
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["## Dispatch Boundary", "simple single-source synchronization", "decisions spanning multiple files/artifacts"]);
for (const relative of [
  "skills/feature-init/SKILL.md", "skills/project-personalize/SKILL.md", "skills/spec-revise/SKILL.md", "skills/agents-md-revise/SKILL.md",
  "plugins/project-workflow/skills/feature-init/SKILL.md", "plugins/project-workflow/skills/project-personalize/SKILL.md", "plugins/project-workflow/skills/spec-revise/SKILL.md", "plugins/project-workflow/skills/agents-md-revise/SKILL.md",
]) requireRegex(relative, /decision-completeness[- ]auditor/, "decision-completeness auditor reference");

requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Known-bad mutation smoke", "feature-done", "release blocker"]);
requireMarkers("tests/fixtures/reviewer-smoke/expected.json", ["known-bad", "clean"]);
requireMarkers("docs/actions/feature-archive.md", ["legacy candidate", "no `Verdict:`", "Never infer READY"]);
requireMarkers("skills/feature-archive/SKILL.md", ["legacy receipt migration", "不从 checkbox 推断 READY"]);
requireMarkers("plugins/project-workflow/skills/feature-archive/SKILL.md", ["legacy receipts", "never infer READY"]);

const plan = read("template/docs/specs/changes/_template/plan.md");
const tasks = read("template/docs/specs/changes/_template/tasks.md");
for (const forbidden of ["Alembic", "main.py", "{__init__,models,schemas,service,router}.py", "401 / 404 / 422", "### Backend", "### Frontend"]) {
  if (`${plan}\n${tasks}`.includes(forbidden)) problems.push(`full-lane templates retain stack-specific default ${JSON.stringify(forbidden)}`);
}

const projectGotchas = read("template/docs/gotchas.md");
if (projectGotchas.split(/\r?\n/).length > 30 || !projectGotchas.includes("(none yet)")) {
  problems.push("template/docs/gotchas.md must remain a short, empty project-local ledger");
}

if (problems.length > 0) {
  console.error("Workflow contract check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Workflow contracts OK: semantic verdict parity, evidence-backed reviews, receipt schema, lanes, staged baselines, plugin-only templates, hooks, conditional ADRs/audits, and endpoint fixture contracts.");
