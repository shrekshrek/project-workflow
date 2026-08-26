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
const requireTerms = (relative, label, terms) => {
  const content = read(relative);
  const missing = terms.filter((term) => (
    typeof term === "string" ? !content.includes(term) : !term.test(content)
  ));
  if (missing.length > 0) problems.push(`${relative}: incomplete ${label}`);
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
  ["phase check", /dependency or risk checkpoint[\s\S]*smallest\s+relevant check/i],
  ["phase handoff", /After a meaningful phase[\s\S]*compact handoff[\s\S]*Wait for the user/i],
  ["tracking is not a child prerequisite", /External tracking is never a prerequisite/i],
  ["pre-draft decision closure", /Before drafting a full-lane artifact[\s\S]*ceremonial reconfirmation/i],
  ["pre-implementation execution preview", /Before the first implementation edit[\s\S]*execution preview[\s\S]*current outcome and consumer[\s\S]*included and excluded change boundary[\s\S]*current facts[\s\S]*minimum sufficient approach[\s\S]*operating-cost boundaries[\s\S]*verification direction[\s\S]*meaningful phases[\s\S]*user's acceptance/i],
]);
forbidPatterns("docs/actions/feature-init.md", [
  ["mandatory risk-size labels", /small, medium, large, or extra-large/i],
  ["legacy required handoff blocker", /required decision, selection, or handoff/i],
  ["legacy automatic implementation continuation", /returns control to that request without another confirmation/i],
]);

requirePatterns("docs/actions/spec-quality-check.md", [
  ["requirements reconciliation", /^## Requirements Reconciliation$/m],
  ["reconciliation statuses", /`ALIGNED`[\s\S]*`MISMATCH`[\s\S]*`SOURCE GAP`/],
  ["conditional sibling alignment", /Merely touching several modules does not require an alignment table/i],
  ["smallest proof obligations", /smallest non-redundant proof obligations/i],
  ["frozen correction handoff", /`N\/A\(route: spec-revise\)`[\s\S]*before mechanical checks or reviewer dispatch/i],
  ["direct correction evidence", /exact user statement[\s\S]*normalized[\s\S]*supersedes/i],
  ["quality consumes decision closure", /decision closure[\s\S]*does not replay product[\s\S]*reopen a settled choice/i],
  ["quality preserves execution preview", /Continue into implementation only[\s\S]*execution preview[\s\S]*accepted/i],
]);
forbidPatterns("docs/actions/spec-quality-check.md", [
  ["forced empty decision token", /N\/A\(no durable why\/source decision\)/i],
  ["mandatory risk-size classes", /Large\/extra-large/i],
]);

requirePatterns("docs/actions/spec-revise.md", [
  ["implicit latest-user correction trigger", /latest user instruction materially corrects, rejects, removes, or replaces/i],
  ["stale quality gate forbidden", /do not run[\s\S]*`spec-quality-check` against the stale artifact/i],
  ["supersession trace", /exact current user[\s\S]*normalized replacement rule[\s\S]*older rule/i],
  ["revision decision closure", /close the material correction set[\s\S]*ceremonial reconfirmation/i],
]);

requirePatterns("docs/reviewers/spec-quality-reviewer.md", [
  ["correction source gap", /caller-authored "user confirmed"[\s\S]*`SOURCE GAP`/i],
  ["exclusion semantic remnant", /"remove"[\s\S]*optional, conditional, fallback, or compatibility path[\s\S]*`superseded-remnant`/i],
  ["endpoint-owned task rejection", /READY[\s\S]*endpoint\/lifecycle[\s\S]*circular[\s\S]*fails Q7a/i],
  ["reviewer does not reopen closure", /decision-closure result[\s\S]*Do not reopen a resolved product choice/i],
]);

requirePatterns("docs/actions/feature-done.md", [
  ["completion preflight", /^## Completion Preflight$/m],
  ["review layers", /^## Review Layers$/m],
  ["delivery receipt", /^## Delivery Receipt/m],
  ["stable snapshot", /stable final snapshot/i],
  ["terminal endpoint handoff", /Each gate run reviews one stable final snapshot[\s\S]*never repairs[\s\S]*non-READY verdict returns control/i],
  ["L1 L2 L3", /L1 Mechanical:[\s\S]*L2 Project conventions:[\s\S]*L3 Change-spec compliance:/],
  ["full review scheduling", /L2 Project conventions: required for full lane[\s\S]*parallel-scheduled full-lane review[\s\S]*dispatch L2 and L3 together[\s\S]*ordinary full-lane work[\s\S]*dispatch L3 first[\s\S]*dispatch L2[\s\S]*same snapshot/i],
  ["review input separation", /authoritative convention population from the filesystem[\s\S]*`AGENTS\.md`[\s\S]*Caller-supplied[\s\S]*hints only[\s\S]*Route convention sources to L2 and the change-spec package to L3/i],
  ["archive boundary", /close, archive, or submit[\s\S]*feature-archive[\s\S]*without asking again/i],
  ["compact failed history", /explicit rerun of an active `已实现` feature preserves[\s\S]*prior[\s\S]*READY receipt[\s\S]*Ordinary non-READY reruns replace[\s\S]*full Previous Proof Bundles are reserved/i],
  ["deferred current truth", /Domain doc check: defer it until L1[\s\S]*form a READY candidate[\s\S]*`not-run\(non-READY prerequisite\)`/i],
  ["review drift", /review-input drift/i],
  ["compact reviews", /`Reviews`:[\s\S]*`completed`[\s\S]*`invalidated`/],
  ["current truth", /`Current truth`:/],
  ["endpoint-owned checklist boundary", /checklists limited to implementation, review, and check outcomes[\s\S]*archive eligibility[\s\S]*circular checklist item/i],
  ["non-ready next route", /`Next`:[\s\S]*`direct-repair`[\s\S]*`spec-revise`[\s\S]*`user-decision`[\s\S]*`separate-boundary`/i],
  ["delivery artifact baseline", /accepted feature artifact as the requirements baseline/i],
]);
requireTerms("docs/actions/feature-done.md", "mechanical feature boundary", [
  "Git-derived feature population",
  /complete\s+`base`-to-worktree population/,
  "tracked changes plus untracked paths reported by Git",
  "`base` is `HEAD` when all",
  /include\s+committed and uncommitted work/,
  "`base..reviewed` commit range",
  "population as indivisible",
  "before expanded L1",
]);
forbidPatterns("docs/actions/feature-done.md", [
  ["forced primary-flow summary", /primary-flow result/i],
  ["duplicated review-execution receipt", /- `Review execution`:/],
  ["stale reviewer-result reuse after L1 failure", /preserve (?:any )?(?:still-valid )?(?:same-task )?reviewer (?:results|evidence)/i],
  ["same-run implementation repair", /bounded repair|same-run repair-delta|one permitted repair/i],
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
  ["main-session execution", /use the main session under the same read-only role contract/i],
  ["stable owner snapshot", /stable owner-supplied snapshot/i],
  ["independent role contracts", /Each role retains its independent canonical contract/i],
  ["single reviewer fallback", /exactly one[\s\S]*execution fallback[\s\S]*only when no terminal result exists/i],
]);
requireTerms("docs/project-workflow-overview.drawio", "current feature-done overview", [
  "机械 Feature 边界",
  "non-READY 交回用户",
  "不在 gate 内修实现",
  "高风险并行,普通先 L3 后 L2",
  "READY → archive pending",
  "明确关闭/归档/提交 → /feature-archive",
]);
forbidPatterns("docs/project-workflow-overview.drawio", [
  ["legacy parallel scheduling", /L2\/L3 容量允许时并行/],
  ["legacy explicit-rerun-only flow", /用户再次要求时复审|非 READY 不自动重跑/],
]);
forbidPatterns("docs/reviewers/README.md", [
  ["status-only protocol", /status-only/i],
  ["single terminal-report choreography", /one terminal report/i],
  ["same-run repair delta", /same-run repair-delta/i],
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
    ["canonical action delegation", /Execute the complete canonical action/i],
  ]);
  forbidPatterns(`adapters/${host}/skills/feature-done/SKILL.md`, [
    ["same-run repair delegation", /bounded repair|repair-delta reconciliation/i],
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

requirePatterns("adapters/claude/skills/feature-init/SKILL.md", [
  ["Claude materializer", /CLAUDE_PLUGIN_ROOT[\s\S]*materialize-feature-artifact\.cjs/],
]);
requirePatterns("adapters/codex/skills/feature-init/SKILL.md", [
  ["Codex plugin root and materializer", /\.codex-plugin\/plugin\.json[\s\S]*materialize-feature-artifact\.cjs/],
]);
for (const host of ["claude", "codex"]) {
  requirePatterns(`adapters/${host}/skills/feature-done/SKILL.md`, [
    ["receipt", /## Proof Bundle/],
  ]);
  requirePatterns(`adapters/${host}/skills/feature-done/SKILL.md`, [
    ["archive handoff", /close\/archive\/submit intent continues to[\s\S]*feature-archive/i],
  ]);
}

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
]) {
  requirePatterns(relative, [
    ["endpoint-owned task boundary", /READY[\s\S]*Proof Bundle[\s\S]*不写成 checkbox/i],
    ["non-ready next route", /Next:[\s\S]*direct-repair[\s\S]*spec-revise[\s\S]*user-decision[\s\S]*separate-boundary/i],
  ]);
}

requirePatterns("docs/examples/reviewer-mutation-smoke.md", [
  ["endpoint-owned task smoke", /run feature-done and become READY[\s\S]*endpoint\/lifecycle[\s\S]*cleanup before review/i],
  ["non-ready route smoke", /non-READY receipt[\s\S]*`direct-repair`[\s\S]*`spec-revise`/i],
  ["decision closure reviewer smoke", /resolved multi-turn decision closure[\s\S]*without reopening the choice[\s\S]*`SOURCE GAP`/i],
  ["complete dirty worktree population smoke", /commit an earlier selected-feature change[\s\S]*tracked edit[\s\S]*untracked selected-feature file[\s\S]*actual feature base[\s\S]*complete committed-and-uncommitted worktree population/i],
  ["mixed ownership boundary smoke", /Mix another active feature or unrelated work[\s\S]*`BLOCKED` before L1[\s\S]*instead of subtracting paths/i],
  ["scheduling-neutral review drift smoke", /sequential or capacity-serialized run[\s\S]*after one reviewer returns[\s\S]*before final aggregation[\s\S]*invalidated\(review-input drift\)/i],
]);

requirePatterns("docs/examples/feature-init-scenario-matrix.md", [
  ["decision closure interaction", /multi-turn full-feature conversation[\s\S]*no duplicate confirmation[\s\S]*before any artifact is materialized/i],
]);

requirePatterns("adapters/codex/.codex-plugin/plugin.json", [
  ["default correction route", /materially corrects accepted feature behavior[\s\S]*\$spec-revise[\s\S]*\$spec-quality-check/i],
]);

if (problems.length) {
  console.error("Workflow structure check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log("Workflow structure OK: canonical ownership, lightweight adapters, safe materialization, risk-scheduled review, compact receipts, and flexible phase execution.");
