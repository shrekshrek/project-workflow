#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const problems = [];
const read = (relative) => {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    problems.push(`${relative}: missing file`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
};
const requirePatterns = (relative, entries) => {
  const content = read(relative);
  for (const [label, pattern] of entries) {
    if (!pattern.test(content)) problems.push(`${relative}: missing ${label}`);
  }
};
const forbidPatterns = (relative, entries) => {
  const content = read(relative);
  for (const [label, pattern] of entries) {
    if (pattern.test(content)) problems.push(`${relative}: contains forbidden ${label}`);
  }
};

requirePatterns("docs/actions/README.md", [
  ["contract ownership section", /^## Contract ownership$/m],
  ["single normative owner", /one normative definition/i],
]);
requirePatterns("docs/actions/feature-init.md", [
  ["route decision", /^## Route Decision$/m],
  ["three routes", /`DIRECT`[\s\S]*`LIGHT`[\s\S]*`FULL`/],
  ["preview and apply", /`PREVIEW`[\s\S]*`APPLY`/],
  ["scope stop", /Implementation Scope Stop/],
  ["phase check", /dependency or risk checkpoint[\s\S]*smallest relevant check/i],
  ["tracking is not a child prerequisite", /External tracking is never a prerequisite/i],
]);
forbidPatterns("docs/actions/feature-init.md", [
  ["mandatory risk-size labels", /small, medium, large, or extra-large/i],
  ["legacy required handoff blocker", /required decision, selection, or handoff/i],
]);

requirePatterns("docs/actions/spec-quality-check.md", [
  ["requirements reconciliation", /^## Requirements Reconciliation$/m],
  ["reconciliation statuses", /`ALIGNED`[\s\S]*`MISMATCH`[\s\S]*`SOURCE GAP`/],
  ["conditional sibling alignment", /Merely touching several modules does not require an alignment table/i],
  ["smallest proof obligations", /smallest non-redundant proof obligations/i],
]);
forbidPatterns("docs/actions/spec-quality-check.md", [
  ["forced empty decision token", /N\/A\(no durable why\/source decision\)/i],
  ["mandatory risk-size classes", /Large\/extra-large/i],
]);

requirePatterns("docs/actions/feature-done.md", [
  ["completion preflight", /^## Completion Preflight$/m],
  ["review layers", /^## Review Layers$/m],
  ["delivery receipt", /^## Delivery Receipt/m],
  ["stable snapshot", /stable final snapshot/i],
  ["terminal invocation boundary", /non-READY verdict ends[\s\S]*does not implicitly authorize another L2\/L3 cycle/i],
  ["explicit rerun request", /later explicit user request/i],
  ["L1 L2 L3", /L1 Mechanical:[\s\S]*L2 Project conventions:[\s\S]*L3 Change-spec compliance:/],
  ["review drift", /review-input drift/i],
  ["compact reviews", /`Reviews`:[\s\S]*`completed`[\s\S]*`invalidated`/],
  ["current truth", /`Current truth`:/],
]);
forbidPatterns("docs/actions/feature-done.md", [
  ["forced primary-flow summary", /primary-flow result/i],
  ["duplicated review-execution receipt", /- `Review execution`:/],
  ["automatic feature-done reentry", /may apply[\s\S]{0,160}and invoke `feature-done` again/i],
  ["stale reviewer-result reuse after L1 failure", /preserve (?:any )?(?:still-valid )?(?:same-task )?reviewer (?:results|evidence)/i],
]);

requirePatterns("docs/spec-driven.md", [
  ["external tracking is not a child prerequisite", /外部 tracking 不是启动所选 child 的前置条件/],
  ["active revision versus successor boundary", /活动且未归档[\s\S]*`spec-revise`[\s\S]*已归档[\s\S]*successor feature/],
]);
forbidPatterns("docs/spec-driven.md", [
  ["legacy mandatory deferred tracking", /先把暂缓结果持久化到既有 Issue\/PM/],
  ["legacy risk-size phase labels", /large\s*\/\s*extra-large/i],
  ["ambiguous all-change successor rule", /确认并开始实施后冻结,变更 = 起新功能目录|^### 变更需求 = 起新功能目录$/m],
]);

requirePatterns("docs/reviewers/README.md", [
  ["execution contract", /^## Reviewer execution contract$/m],
  ["independent reviewer", /independent reviewer/i],
  ["main-session fallback", /main-session fallback/i],
  ["stable owner snapshot", /stable owner-supplied snapshot/i],
]);
forbidPatterns("docs/reviewers/README.md", [
  ["status-only protocol", /status-only/i],
  ["single terminal-report choreography", /one terminal report/i],
]);

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
]) {
  requirePatterns(relative, [
    ["proof bundle", /^## Proof Bundle$/m],
    ["verdict", /^- Verdict:/m],
    ["change identity", /^- Change:/m],
    ["checks", /^- Checks/m],
    ["compact reviews", /^- Reviews:/m],
    ["current truth", /^- Current truth:/m],
  ]);
  forbidPatterns(relative, [["duplicated review execution", /^- Review execution:/m]]);
}
forbidPatterns("template/docs/specs/changes/_template/spec-greenfield.md", [
  ["numeric exclusion quota", /\u81f3\u5c11\s*2-3\s*\u6761/],
]);
forbidPatterns("template/docs/specs/changes/_template/plan.md", [
  ["mandatory all-multi-module alignment", /\u6d89\u53ca\u591a\u6a21\u5757\u65f6\u5fc5\u586b/],
  ["forced decision N\/A", /N\/A\(no durable why\/source decision\)/i],
]);
forbidPatterns("template/docs/specs/changes/_template/tasks.md", [
  ["forced verification N\/A", /N\/A\(all spec \u00a74 obligations already covered\)/i],
]);

for (const relative of [
  "docs/actions/feature-init.md",
  "docs/actions/spec-quality-check.md",
  "docs/actions/feature-done.md",
  "template/docs/specs/changes/_template/plan.md",
  "template/docs/specs/changes/_template/spec-brownfield.md",
  "template/docs/specs/changes/_template/spec-greenfield.md",
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
  "tests/fixtures/feature-init-scenarios/base-numbered/docs/specs/changes/001-approved-feature/plan.md",
  "tests/fixtures/feature-init-scenarios/base-numbered/docs/specs/changes/001-approved-feature/spec.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/plan.md",
]) {
  forbidPatterns(relative, [
    ["legacy mandatory delivery baseline", /Delivery Shape Baseline/i],
    ["legacy primary-flow marker", /Primary flow/i],
    ["mandatory slice choreography", /contract-bearing slice|slice ID/i],
  ]);
}
forbidPatterns("docs/actions/agents-md-revise.md", [
  ["duplicate apply approval", /user-approved consolidated diff|single consolidated preview/i],
]);
forbidPatterns("docs/actions/project-personalize.md", [
  ["duplicate apply approval", /user-approved consolidated diff|single consolidated preview/i],
]);

for (const host of ["claude", "codex"]) {
  forbidPatterns(`adapters/${host}/skills/project-personalize/SKILL.md`, [
    ["duplicate approval choreography", /before approval|consolidated approval/i],
  ]);
  requirePatterns(`adapters/${host}/skills/agents-md-revise/SKILL.md`, [
    ["current-request authorization", /authorized by the current request/i],
  ]);
  forbidPatterns(`adapters/${host}/skills/agents-md-revise/SKILL.md`, [
    ["legacy approved-only wording", /user-approved drift fixes|approved drift fixes|approved convention edits/i],
  ]);
  requirePatterns(`adapters/${host}/skills/feature-done/SKILL.md`, [
    ["terminal verdict boundary", /end on its\s+terminal verdict/i],
    ["no automatic reentry", /must not re-enter this skill automatically/i],
  ]);
}

forbidPatterns("docs/examples/full-feature-artifact.md", [
  ["legacy risk-size field", /Delivery risk signal/i],
]);
forbidPatterns("docs/examples/feature-init-scenario-matrix.md", [
  ["legacy durable-handoff refusal", /refusal when deferred children lack durable issue\/PM references/i],
  ["fixed single clarification", /single clarification question/i],
]);
forbidPatterns("tests/fixtures/feature-init-scenarios/expected.json", [
  ["mandatory risk-size expectation", /large or extra-large/i],
  ["fixed tracking field", /"Tracking:"/i],
  ["fixed one-question expectation", /用一个问题确认/],
]);
forbidPatterns("docs/examples/reviewer-mutation-smoke.md", [
  ["legacy exact-population output", /exact-population evidence|evidence ID|enumerates the full population/i],
]);

const actions = [
  "project-init", "project-personalize", "feature-init", "spec-quality-check",
  "spec-revise", "feature-done", "feature-archive", "spec-reconcile", "agents-md-revise",
];
for (const action of actions) {
  for (const host of ["claude", "codex"]) {
    const relative = `adapters/${host}/skills/${action}/SKILL.md`;
    const content = read(relative);
    if (content.split(/\r?\n/).length >= 200) problems.push(`${relative}: skill must remain below 200 lines`);
    requirePatterns(relative, [
      ["user-language contract", /Match the user's language/i],
      ["canonical action reference", new RegExp(`docs/actions/${action}\\.md`)],
    ]);
    forbidPatterns(relative, [
      ["unsafe checkout restore", /git checkout/i],
      ["automatic commit", /\bgit commit\b/i],
      ["continue silently choreography", /continue silently/i],
    ]);
  }
}

requirePatterns("adapters/claude/skills/feature-init/SKILL.md", [
  ["Claude materializer", /CLAUDE_PLUGIN_ROOT[\s\S]*materialize-feature-artifact\.cjs/],
]);
requirePatterns("adapters/codex/skills/feature-init/SKILL.md", [
  ["Codex plugin root and materializer", /\.codex-plugin\/plugin\.json[\s\S]*materialize-feature-artifact\.cjs/],
]);
for (const host of ["claude", "codex"]) {
  requirePatterns(`adapters/${host}/skills/feature-done/SKILL.md`, [
    ["L2 reviewer", /agents-md-reviewer/],
    ["L3 reviewer", /spec-reviewer/],
    ["receipt", /## Proof Bundle/],
  ]);
  requirePatterns(`adapters/${host}/skills/spec-quality-check/SKILL.md`, [
    ["single quality reviewer", /spec-quality-reviewer/],
    ["requirements reconciliation", /Requirements Reconciliation/],
  ]);
}

for (const relative of ["scripts/materialize-feature-artifact.cjs", "scripts/materialize-project-baseline.cjs"]) {
  requirePatterns(relative, [
    ["symlink/path safety", /symlink|symbolic|lstat|realpath/i],
    ["no-clobber safety", /exist|occup|conflict|clobber/i],
  ]);
}

if (problems.length) {
  console.error("Workflow structure check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log("Workflow structure OK: canonical ownership, lightweight adapters, safe materialization, risk-routed review, compact receipts, and flexible phase execution.");
