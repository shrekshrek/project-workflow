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

function forbidRegex(relative, regex, label) {
  if (regex.test(read(relative))) problems.push(`${relative}: contains forbidden ${label}`);
}

function requireReviewerExecutionContract(relative, dispatchVerb) {
  requireRegex(relative, new RegExp(`\\bMUST ${dispatchVerb}\\b`), `mandatory ${dispatchVerb} semantics`);
  if (dispatchVerb === "spawn") {
    requireRegex(relative, /MUST spawn a fresh general subagent/i, "fresh Codex subagent semantics");
    requireRegex(relative, /never retask an existing subagent instance/i, "no Codex reviewer retask semantics");
  }
  requireRegex(relative, /no extra workflow confirmation[\s\S]{0,120}host security approvals still apply/i, "workflow-vs-host authorization boundary");
  requireRegex(relative, /fallback is allowed only when[\s\S]{0,220}(?:capacity|slot)[\s\S]{0,160}observed reason/i, "evidenced fallback conditions");
  requireRegex(relative, /Review(?:er)? execution/i, "reviewer execution evidence");
  forbidMarkers(relative, ["Attempt dispatch before fallback"]);
}

function verdictContract(relative) {
  const match = read(relative).match(/^-?[ \t]*Verdict contract:.*$/m);
  if (!match) {
    problems.push(`${relative}: missing verdict contract`);
    return null;
  }
  return match[0].replace(/^-\s*/, "");
}

const verdict = verdictContract("docs/actions/feature-done.md");
if (!verdict?.includes("only explicit nonblocking advisories")) {
  problems.push("feature-done verdict contract must distinguish blocking findings from nonblocking advisories");
}
forbidMarkers("adapters/claude/skills/feature-done/SKILL.md", [
  "Agent 返回空 findings = ✅",
  "L2 ✅/🟡",
  "git checkout HEAD",
]);
requireMarkers("adapters/claude/skills/feature-done/SKILL.md", ["agents-md-reviewer", "spec-reviewer", "## Proof Bundle", "same-session"]);
requireMarkers("adapters/codex/skills/feature-done/SKILL.md", ["agents-md-reviewer.md", "spec-reviewer.md", "## Proof Bundle", "same-session", "never reviewer instances", "result-reuse"]);
requireMarkers("docs/actions/feature-done.md", ["Light-lane verification", "Reviewers must still return exact applicable identifiers", "receipt-only edits", "greenfield full-lane delivery", "area unresolved", "Validate the receipt structurally", "block verbatim", "review traceability, not a cache key"]);
forbidMarkers("docs/actions/feature-done.md", ["reproducible diff identity", "content fingerprint"]);
requireMarkers("docs/actions/feature-done.md", ["independently executable", "non-execution only", "Review execution", "dispatch capability", "fallback reason", "blocks `READY`"]);
requireMarkers("docs/actions/feature-done.md", ["transient enumeration", "exact changed-file and applicable-item population", "never infer complete coverage from `findings=none` alone"]);

requireMarkers("docs/actions/spec-quality-check.md", ["Reviewer execution", "dispatch capability", "fallback reason", "blocks `READY`"]);
const runtimeActions = ["project-init", "project-personalize", "feature-init", "spec-quality-check", "spec-revise", "feature-done", "feature-archive", "spec-reconcile", "agents-md-revise"];
for (const action of ["feature-done", "feature-init", "project-personalize", "spec-quality-check", "spec-revise", "agents-md-revise"]) {
  requireReviewerExecutionContract(`adapters/claude/skills/${action}/SKILL.md`, "dispatch");
  requireReviewerExecutionContract(`adapters/codex/skills/${action}/SKILL.md`, "spawn");
}
for (const action of runtimeActions) {
  for (const host of ["claude", "codex"]) {
    const relative = `adapters/${host}/skills/${action}/SKILL.md`;
    forbidRegex(relative, /[\u3400-\u9fff]/u, "non-English runtime instruction prose");
    requireRegex(relative, /Match the user's language/i, "user-language response contract");
  }
}
for (const filename of fs.readdirSync(path.join(repoRoot, "adapters/claude/agents")).filter((name) => name.endsWith(".md"))) {
  const relative = `adapters/claude/agents/${filename}`;
  forbidRegex(relative, /[\u3400-\u9fff]/u, "non-English runtime instruction prose");
  requireRegex(relative, /\*\*Response language\*\*:\s*Match the calling (?:skill's|user's) language/i, "caller-language response contract");
}
requireMarkers("docs/reviewers/README.md", ["Reviewer execution contract", "dispatch capability", "fresh subagent invocation", "never an agent instance", "fresh-subagent", "result-reuse", "observed reason", "host security approvals still apply", "fail closed"]);
requireRegex("docs/reviewers/README.md", /Codex plugin skills[\s\S]{0,160}must use[\s\S]{0,160}subagent/i, "mandatory Codex reviewer index wording");
for (const action of ["feature-init", "project-personalize", "spec-revise", "agents-md-revise"]) {
  requireMarkers(`docs/actions/${action}.md`, ["## Reviewer Execution", "../reviewers/README.md", "`Reviewer execution`", "blocking"]);
}

for (const relative of ["docs/reviewers/agents-md-reviewer.md", "docs/reviewers/spec-reviewer.md"]) {
  requireMarkers(relative, ["exact changed", "applicable but unverified", "UNRELIABLE"]);
  forbidMarkers(relative, ["coverage is 100%", "coverage is at least 95%", "coverage >= 95%", "confidence", "skipped-critical"]);
}
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["definite non-matches", "applicable population"]);
for (const relative of [
  "docs/reviewers/agents-md-reviewer.md",
  "docs/reviewers/spec-reviewer.md",
  "docs/reviewers/spec-quality-reviewer.md",
  "docs/reviewers/decision-completeness-auditor.md",
]) {
  forbidMarkers(relative, ["coverage percentage", "coverage score", "confidence score", "confidence=<"]);
}
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Q3", "Q4", "Q5", "Q7", "reviewed items", "blocking ambiguity"]);
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["Decision Matrix", "Must-fix", "Warnings", "Cross-file Consistency", "Completeness"]);

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
]) {
  requireRegex(relative, /^- Verdict:/m, "receipt Verdict field");
  requireRegex(relative, /^- Change:.*review-scope=\[exact paths reviewed.*endpoint-outputs=/m, "exact review scope and endpoint outputs");
  requireRegex(relative, /^- Checks/m, "receipt Checks field");
  requireRegex(relative, /^- Review execution:/m, "reviewer execution evidence field");
  requireRegex(relative, /^- Current truth:/m, "receipt Current truth field");
  forbidMarkers(relative, ["coverage=", "confidence=", "Rule sources:", "drift ledger"]);
}
requireRegex("template/docs/specs/changes/_template/tasks.md", /^- L2:.*baseline=\[.*findings=\[.*unverified=\[.*ambiguities=/m, "compact full-lane L2 receipt");
requireRegex("template/docs/specs/changes/_template/tasks.md", /^- L3:.*baseline=\[.*findings=\[.*unverified=\[.*ambiguities=/m, "compact full-lane L3 receipt");
forbidMarkers("template/docs/specs/changes/_template/tasks.md", ["applicable-rules=", "applicable-items=", "applicable-unverified="]);
requireRegex("template/docs/specs/changes/_template/tasks-light.md", /^- L2:.*findings=\[.*applicable-rules=.*applicable-unverified=.*ambiguities=/m, "light-lane L2 evidence shape");
requireRegex("template/docs/specs/changes/_template/tasks-light.md", /^- L3:.*verification=\[/m, "light-lane L3 verification field");
requireMarkers("template/docs/specs/changes/_template/tasks-light.md", ["verification=[item#id: PASS|FAIL]"]);

requireMarkers("docs/actions/feature-init.md", ["do not create a pseudo-lane", "Use full lane for high-risk or contract-shaped work", "Use light lane only when all are true"]);
requireMarkers("docs/actions/feature-init.md", ["when the project uses such an optional declaration"]);
requireMarkers("docs/actions/feature-init.md", ["normalizes an existing target-root symlink", "rejects symlinked destinations beneath the resolved root"]);
requireMarkers("docs/actions/feature-done.md", ["Projects without this optional declaration", "do not need an empty path list"]);
for (const relative of ["docs/actions/feature-init.md", "adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["materialize-feature-artifact.cjs", "no-clobber"]);
}
requireMarkers("scripts/materialize-feature-artifact.cjs", ["realpathSync", "Target root must resolve to a directory", "Atomic no-clobber gate", "COPYFILE_EXCL", "rerun feature-init"]);
forbidMarkers("scripts/materialize-feature-artifact.cjs", ["assertNoSymlinkComponents(requestedTarget)"]);
forbidMarkers("scripts/materialize-feature-artifact.cjs", [".project-workflow-nnn-", "reservation"]);
requireMarkers("docs/actions/README.md", ["active runtime adapter", "CLAUDE_PLUGIN_ROOT", ".codex-plugin/plugin.json", "Do not scan another host's cache", "required asset"]);
forbidMarkers("docs/actions/README.md", ["~/.claude/plugins/cache", "~/.codex/plugins/cache", "most recently installed compatible package"]);
requireMarkers("adapters/claude/skills/feature-init/SKILL.md", ["`CLAUDE_PLUGIN_ROOT` is required", "scripts/materialize-feature-artifact.cjs"]);
requireRegex("adapters/claude/skills/feature-init/SKILL.md", /occupied directory.*leave it untouched.*rerun feature-init/i, "occupied-directory no-clobber rerun semantics");
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["scripts/materialize-project-baseline.cjs", "six target-mapped files", "Do not ask stack questions"]);
requireMarkers("docs/workflow.md", ["未改变已声明 current truth", "契约/流程语义变更仍按风险选 light/full"]);

requireMarkers("docs/actions/project-personalize.md", ["complete, partial, unrelated, or missing project-workflow baseline", "A non-empty codebase without `AGENTS.md` is retrofit, not greenfield"]);
requireMarkers("docs/actions/project-personalize-reference.md", ["## Evidence order", "Never use an example below as a default", "## Legacy default cleanup", "## Optional high-impact path declarations", "not part of the generated baseline or default personalization flow"]);
forbidMarkers("docs/actions/project-personalize-reference.md", ["默认 80", "default 80", "固定 GitHub", "默认 conventional", "default Playwright"]);
requireMarkers("adapters/claude/skills/project-personalize/SKILL.md", ["partial/missing baseline", "materialize-project-baseline.cjs"]);
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /missing baseline does not copy host-private rules, hooks, or tier examples/i, "missing-baseline host-private exclusion semantics");
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /`codebase-explorer` applies only[\s\S]{0,180}`tech-researcher` applies only/i, "role-applicability prose");
requireMarkers("adapters/codex/skills/project-personalize/SKILL.md", ["complete/partial/custom/missing baseline", "materialize-project-baseline.cjs", "Do not copy host-private rules/hooks/tier examples by default"]);
for (const relative of ["docs/actions/project-personalize.md", "adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md"]) {
  requireMarkers(relative, ["commands", "source/test paths", "project-specific rules", "tier ownership"]);
}
requireMarkers("adapters/claude/skills/project-personalize/SKILL.md", ["--stage", "Consolidated Preview + Apply Gate", "symlink"]);
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /leaves the target unchanged/i, "rejected-apply unchanged-target semantics");
requireMarkers("adapters/codex/skills/project-personalize/SKILL.md", ["one consolidated diff", "target unchanged", "symlink"]);

requireMarkers("template/AGENTS.md", [
  "deferred until a scaffold defines it",
  "host's `feature-init` action",
  "no-artifact/direct work",
  "light tracked change",
  "full spec/plan/tasks",
  "exclude `docs/specs/changes/archive/` unless tracing history",
]);
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, [
    "Use before implementing a new feature or durable behavior change",
    "direct/no-artifact, light tasks-only, or full spec/plan/tasks",
    "initialize artifacts only when needed",
  ]);
}
forbidMarkers("template/AGENTS.md", ["{{HOOK_INDEX}}", ".claude/hooks/", ".codex/hooks.json", "High-Blast-Radius Paths", "None declared yet"]);
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "--apply-staged", "Recommend `/project-workflow:project-personalize`"]);
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["explicit invocation already authorizes"]);
forbidMarkers("adapters/claude/skills/project-init/SKILL.md", ["rm -f ./.claude/settings.json", "-exec cp -r"]);
requireMarkers("adapters/codex/skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "six target-mapped files", "--stage", "leaving the target unchanged"]);
requireMarkers("README.md", ["docs/specs/changes/", "six-file", "optional"]);
for (const relative of ["docs/actions/project-init.md", "docs/actions/project-personalize.md", "adapters/claude/skills/project-init/SKILL.md", "adapters/claude/skills/project-personalize/SKILL.md"]) {
  forbidMarkers(relative, ["scaffold/inactive", "inactive scaffold"]);
}

requireMarkers("docs/actions/spec-revise.md", ["ADRs are conditional", "one consolidated proposed-diff approval", "without changing the worktree"]);
forbidMarkers("docs/actions/spec-revise.md", ["two approval points", "second approval"]);
requireMarkers("template/docs/adr/README.md", ["ADR_REQUIRED", "项目目录不保留空模板"]);
for (const relative of ["adapters/claude/skills/spec-revise/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md"]) {
  requireMarkers(relative, ["ADR_REQUIRED"]);
  requireRegex(relative, /accepted[- ]spec|accepted spec|已确认.*spec/, "accepted-spec trigger");
  forbidMarkers(relative, ["git checkout", "docs/adr/0000-template.md` to"]);
}
requireMarkers("adapters/claude/skills/spec-revise/SKILL.md", ["${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md"]);
requireRegex("adapters/claude/skills/spec-revise/SKILL.md", /worktree remains unchanged/i, "pre-approval unchanged-worktree semantics");
requireMarkers("adapters/codex/skills/spec-revise/SKILL.md", ["bundled `template/docs/adr/0000-template.md`", "approved consolidated diff"]);

requireMarkers("docs/quickstart.md", ["area unresolved"]);
forbidMarkers("docs/quickstart.md", ["current-truth check(仅当", "使用 feature spec + ADR"]);
requireMarkers("template/docs/adr/README.md", ["ADR_REQUIRED"]);
forbidMarkers("template/docs/adr/README.md", ["/agents-md-revise` 周期性点名", "零引用 + 60 天以上"]);
for (const relative of ["docs/actions/agents-md-revise.md", "adapters/claude/skills/agents-md-revise/SKILL.md", "adapters/codex/skills/agents-md-revise/SKILL.md"]) {
  forbidMarkers(relative, ["current-truth freshness", "current-truth 新鲜度", "ADR orphan", "ADR 孤儿"]);
}
forbidMarkers("adapters/claude/skills/agents-md-revise/SKILL.md", ["every 2-4 weeks", "每 2-4 周", "每 2 周"]);

for (const relative of ["docs/workflow.md", "adapters/claude/skills/agents-md-revise/SKILL.md"]) {
  forbidMarkers(relative, ["Item 5a", "Item 5b", "proof bundle 5 项"]);
}
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["## Dispatch Boundary", "simple single-source synchronization", "decisions spanning multiple files/artifacts"]);
for (const relative of [
  "adapters/claude/skills/feature-init/SKILL.md", "adapters/claude/skills/project-personalize/SKILL.md", "adapters/claude/skills/spec-revise/SKILL.md", "adapters/claude/skills/agents-md-revise/SKILL.md",
  "adapters/codex/skills/feature-init/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md", "adapters/codex/skills/agents-md-revise/SKILL.md",
]) requireRegex(relative, /decision-completeness[- ]auditor/, "decision-completeness auditor reference");

requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Known-bad mutation smoke", "feature-done", "release blocker"]);
requireMarkers("tests/fixtures/reviewer-smoke/expected.json", ["known-bad", "clean"]);
requireMarkers("scripts/check-reviewer-fixtures.cjs", ["reviewerExecutionReliable !== true", "missing reviewer execution evidence must BLOCK"]);
for (const relative of [
  "docs/examples/full-feature-artifact.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/tasks.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) requireRegex(relative, /^- Review execution:/m, "reviewer execution evidence field");
requireMarkers("docs/actions/feature-archive.md", ["legacy candidate", "no `Verdict:`", "Never infer READY", "current task", "ordinary filesystem rename", "move the directory back", "rerun `feature-done`"]);
requireMarkers("adapters/claude/skills/feature-archive/SKILL.md", ["current-task READY", "ordinary filesystem rename", "move the directory back", "feature-done"]);
requireMarkers("adapters/codex/skills/feature-archive/SKILL.md", ["current-task READY", "ordinary filesystem rename", "move the directory back", "$feature-done"]);
for (const relative of [
  "docs/actions/feature-archive.md",
  "adapters/claude/skills/feature-archive/SKILL.md",
  "adapters/codex/skills/feature-archive/SKILL.md",
  "docs/actions/spec-reconcile.md",
  "adapters/claude/skills/spec-reconcile/SKILL.md",
  "adapters/codex/skills/spec-reconcile/SKILL.md",
]) forbidMarkers(relative, ["git mv", "diff identity"]);

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

console.log("Workflow contracts OK: canonical verdict ownership, evidence-backed reviews, receipt schema, lanes, staged baselines, evidence-only personalization references, hooks, conditional ADRs/audits, and endpoint fixture contracts.");
