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

const verdictContract = "Verdict contract: L1 failure or unreliable required checks = `BLOCKED`; fixable L2/L3/current-truth findings = `NEEDS WORK`; all required gates and proof complete = `READY`.";
for (const relative of [
  "docs/actions/feature-done.md",
  "skills/feature-done/SKILL.md",
  "plugins/project-workflow/skills/feature-done/SKILL.md",
]) {
  requireMarkers(relative, [verdictContract]);
}

requireMarkers("docs/actions/feature-init.md", [
  "do not create a pseudo-lane",
  "Use full lane for high-risk or contract-shaped work",
  "Use light lane only when all are true",
]);
requireMarkers("skills/feature-init/SKILL.md", ["无需新 artifact", "轻车道", "全道"]);
requireMarkers("plugins/project-workflow/skills/feature-init/SKILL.md", ["no artifact", "light lane", "full lane"]);

requireMarkers("docs/actions/project-personalize.md", [
  "complete, partial, unrelated, or missing project-workflow baseline",
  "A non-empty codebase without `AGENTS.md` is retrofit, not greenfield",
]);
requireMarkers("skills/project-personalize/SKILL.md", [
  "partial/missing baseline",
  "只有目标目录为空时才建议 `/project-init`",
]);
requireMarkers("plugins/project-workflow/skills/project-personalize/SKILL.md", [
  "complete, partial/custom, or missing",
  "all three non-empty cases continue in retrofit mode",
]);

requireMarkers("docs/actions/project-init.md", ["inactive scaffold", "hook: scaffold/inactive"]);
requireMarkers("skills/project-init/SKILL.md", ["hook: scaffold/inactive", "active + verified"]);
requireMarkers("plugins/project-workflow/skills/project-init/SKILL.md", ["hook: scaffold/inactive"]);

requireMarkers("skills/project-init/SKILL.md", ["empty or genuinely new target"]);
requireMarkers("docs/quickstart.md", ["任意非空既有代码库 retrofit"]);
for (const relative of [
  "docs/actions/project-personalize.md",
  "skills/project-personalize/SKILL.md",
  "plugins/project-workflow/skills/project-personalize/SKILL.md",
]) {
  requireMarkers(relative, ["scaffold/inactive"]);
}
requireMarkers("docs/workflow.md", [
  "未改变已声明 current truth",
  "契约/流程语义变更仍按风险选 light/full",
]);

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

console.log("Workflow contracts OK: lanes, retrofit routing, verdicts, hooks, and stack-neutral templates.");
