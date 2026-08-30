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
// Assertions are prose phrases, so a pure Markdown reflow must not fail them. Testing the collapsed copy
// tolerates a moved line break while still requiring the exact word sequence.
const collapse = (text) => text.replace(/[ \t]*\r?\n[ \t]*/g, " ");
const present = (term, content) => (typeof term === "string"
  ? content.includes(term) || collapse(content).includes(term)
  : term.test(content) || term.test(collapse(content)));
const requirePatterns = (relative, entries) => {
  const content = read(relative);
  for (const [label, pattern] of entries) {
    if (!present(pattern, content)) problems.push(`${relative}: missing ${label}`);
  }
};
const forbidPatterns = (relative, entries) => {
  const content = read(relative);
  for (const [label, pattern] of entries) {
    if (present(pattern, content)) problems.push(`${relative}: contains forbidden ${label}`);
  }
};
const requireTerms = (relative, label, terms) => {
  const content = read(relative);
  const missing = terms.filter((term) => !present(term, content));
  if (missing.length > 0) problems.push(`${relative}: incomplete ${label}`);
};

requirePatterns("docs/actions/README.md", [
  ["contract ownership section", /^## Contract ownership$/m],
  ["single normative owner", /one normative definition/i],
  ["shared declarable surface", /\*\*Declarable surface\*\*[\s\S]*not a declarable surface[\s\S]*ordinary implementation rules/i],
  ["shared verification escalation", /\*\*Verification escalation\*\*[\s\S]*independent escalation options, never a package[\s\S]*not escalation reasons/i],
]);
requirePatterns("docs/actions/feature-init.md", [
  ["discovery before records", /^## Conversation and discovery$/m],
  ["bounded authorized experiments", /specifically authorized trial[\s\S]*isolated trial is not authorization to implement/i],
  ["observations distinct from acceptance", /observed results separately from accepted expected behavior/i],
  ["unchanged criteria", /do not rewrite the criterion to make it pass/i],
  ["direct work does not require a record by shape", /feature name, several files or multiple implementation steps[\s\S]*do not by[\s\S]*themselves require a record/i],
  ["record-need anchors", /No record:[\s\S]*Record:[\s\S]*Volume never decides/i],
  ["natural independent outcome decomposition", /several outcomes can deliver value[\s\S]*recommend the smallest useful first feature[\s\S]*Keep a coupled transaction/i],
  ["zero-context respectful explanation", /Assume no prior knowledge[\s\S]*preserving the user's[\s\S]*authority[\s\S]*do not patronize/i],
  ["pre-implementation evidence is not delivery E2E", /Before implementation[\s\S]*smallest bounded trial[\s\S]*Use E2E only when it is the smallest reliable/i],
  ["record need independent of verification", /Decide whether to create, reuse or omit a record independently of verification depth/i],
  ["preview and apply", /`PREVIEW`[\s\S]*`APPLY`/],
  ["single record default", /Default new record:[\s\S]*\/spec\.md`[\s\S]*Do not precreate `plan\.md`, `tasks\.md`/],
  ["optional useful split", /Only split[\s\S]*materially helps reading or handoff/i],
  ["single active accepted record", /active feature uses `spec\.md` as its accepted record[\s\S]*Archived directories remain history/i],
  ["preview without duplicate approval", /execution preview[\s\S]*accepted preview is reused[\s\S]*do not insert duplicate confirmation/i],
  ["long-run execution envelope", /materially long, paid, external, opaque[\s\S]*execution envelope[\s\S]*partial-result persistence[\s\S]*canary or sample alternative/i],
  ["accepted envelope preserves useful handoffs", /accepted envelope covers ordinary work[\s\S]*does not suppress informative handoffs/i],
  ["batched context-preserving updates", /Answer the current question first[\s\S]*Batch writeback[\s\S]*exclusions, unresolved questions, permission limits/i],
  ["no bookkeeping context reset", /Do not[\s\S]*clear the session merely because a document changed/i],
  ["ordinary discoveries proceed", /Discovery continues during implementation[\s\S]*can proceed without approval/i],
  ["affected work stops for material discovery", /Stop the affected implementation[\s\S]*authorization, data disposition, operating cost[\s\S]*ask the smallest useful question/i],
  ["local revision and continuation", /After confirmation[\s\S]*spec-revise[\s\S]*update only affected[\s\S]*continue the authorized implementation/i],
  ["slice execution and judgment handoff", /Within a useful slice[\s\S]*material problem[\s\S]*even mid-slice[\s\S]*meaningful user-judgeable slice boundary[\s\S]*Wait before beginning that next slice[\s\S]*small direct task may be one slice/i],
  ["repair convergence handoff", /cycling without converging[\s\S]*recommended next[\s\S]*wait for the user's decision/i],
  ["judgment-useful progress observability", /Progress reports must help the user judge[\s\S]*evidence and its meaning[\s\S]*cannot observe exact progress[\s\S]*never invent percentages/i],
  ["stage-matched verification", /Before implementation[\s\S]*During implementation[\s\S]*Before delivery[\s\S]*E2E/i],
  ["shared escalation reference", /Focused evidence is the default[\s\S]*verification escalation\]\(README\.md#shared-runtime-conventions\)/i],
  ["progressive verification fail-fast", /lower-cost failure stops[\s\S]*costlier expansion/i],
  ["external tracking optional", /External tracking is never a prerequisite/i],
  ["decision closure before drafting", /Normalize accepted material decisions and explicit supersessions before drafting/i],
]);
forbidPatterns("docs/actions/feature-init.md", [
  ["mandatory risk-size labels", /small, medium, large, or extra-large/i],
  ["legacy required handoff blocker", /required decision, selection, or handoff/i],
  ["keyword-driven routing", /no full-lane trigger applies|Use light lane only when all are true|Architecture-shaped work remains ordinary FULL/i],
]);
requirePatterns("docs/actions/spec-quality-check.md", [
  ["semantic rather than form gate", /Check meaning, not template completion/i],
  ["requirements reconciliation", /^## Requirements Reconciliation$/m],
  ["reconciliation statuses", /`ALIGNED`[\s\S]*`MISMATCH`[\s\S]*`SOURCE GAP`/],
  ["conditional sibling alignment", /Merely touching several modules does not require[\s\S]*an alignment table/i],
  ["minimum sufficient planned proof", /smallest non-redundant proof obligations[\s\S]*executable verification path[\s\S]*not completed delivery evidence/i],
  ["stage-matched quality gate", /Before implementation[\s\S]*decision evidence[\s\S]*Distinguish implementation feedback from delivery proof/i],
  ["shared escalation reference", /verification escalation\]\(README\.md#shared-runtime-conventions\)/i],
  ["correction handoff", /`N\/A\(route: spec-revise\)` before mechanical checks or[\s\S]*reviewer dispatch/i],
  ["direct correction evidence", /exact user statement[\s\S]*normalized replacement[\s\S]*supersedes/i],
  ["reuse decision closure", /Preserve the decision-closure result/i],
  ["conditional independent review", /main session performs[\s\S]*fresh independent[\s\S]*when requested[\s\S]*security\/authorization/i],
  ["no file count readiness", /cannot establish clarity or readiness from heading counts, file[\s\S]*counts/i],
  ["quality preserves authorization", /Continue into implementation only with an accepted approach[\s\S]*previously accepted execution preview/i],
]);
forbidPatterns("docs/actions/spec-quality-check.md", [
  ["forced empty decision token", /N\/A\(no durable why\/source decision\)/i],
  ["mandatory risk-size classes", /Large\/extra-large/i],
]);

requirePatterns("docs/actions/spec-revise.md", [
  ["implicit latest-user correction trigger", /latest user instruction materially corrects, rejects, removes, or replaces/i],
  ["stale quality gate forbidden", /do not run[\s\S]*`spec-quality-check` against the stale artifact/i],
  ["supersession trace", /exact current user[\s\S]*normalized replacement rule[\s\S]*older rule/i],
  ["revision decision closure", /Close the material correction set[\s\S]*conversation rules[\s\S]*accepted replacements/i],
]);

requirePatterns("docs/reviewers/spec-quality-reviewer.md", [
  ["correction source gap", /caller-authored "user confirmed"[\s\S]*`SOURCE GAP`/i],
  ["exclusion semantic remnant", /"remove"[\s\S]*optional, conditional, fallback, or compatibility path[\s\S]*`superseded-remnant`/i],
  ["endpoint-owned task rejection", /READY[\s\S]*endpoint\/lifecycle[\s\S]*circular[\s\S]*fails Q7a/i],
  ["reviewer consumes resolved decisions", /decision-closure result[\s\S]*faithful representation of resolved material decisions/i],
]);

requirePatterns("docs/actions/feature-done.md", [
  ["completion preflight", /^## Completion Preflight$/m],
  ["review layers", /^## Review Layers$/m],
  ["delivery receipt", /^## Delivery Receipt/m],
  ["stable snapshot", /stable final snapshot/i],
  ["terminal endpoint handoff", /Each gate run reviews one stable final snapshot[\s\S]*never repairs[\s\S]*non-READY verdict returns control/i],
  ["focused repair before endpoint retry", /non-READY verdict[\s\S]*ends this gate[\s\S]*direct-repair[\s\S]*one focused repair slice[\s\S]*hand off the blocker, fix, changed evidence and remaining risk[\s\S]*wait before a fresh endpoint run/i],
  ["L1 L2 L3", /L1 Mechanical:[\s\S]*L2 Project conventions:[\s\S]*L3 Change-spec compliance:/],
  ["risk-based review scheduling", /When both reviews apply, dispatch L2 and L3 together[\s\S]*security\/authorization[\s\S]*Otherwise dispatch L3 first[\s\S]*same snapshot/i],
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
  ["conditional L3 without coverage waiver", /L3 Change-spec compliance: required for a concrete[\s\S]*Otherwise record a[\s\S]*reasoned N\/A[\s\S]*execute or mechanically check every applicable obligation/i],
  ["single spec delivery receipt", /append the receipt to `spec\.md` only at delivery[\s\S]*single canonical receipt/i],
  ["cost-tier fail-fast", /Order necessary evidence by cost and discrimination[\s\S]*lower-cost failure makes READY impossible[\s\S]*skip unrelated higher-cost checks/i],
  ["final candidate completes required evidence", /final READY candidate must finish all independently executable required checks/i],
  ["shared escalation reference", /verification escalation\]\(README\.md#shared-runtime-conventions\)/i],
  ["endpoint long-run handoff", /Long-run execution:[\s\S]*actual next run[\s\S]*does not skip that handoff or its wait[\s\S]*observable counts or milestones[\s\S]*inventing it/i],
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
  ["blanket light review skip or lane upgrade", /L3 remains N\/A|N\/A\(light lane\)|a match is a misclassification/i],
]);
requirePatterns("docs/reviewers/spec-reviewer.md", [
  ["actual accepted baseline", /accepted observable behavior[\s\S]*feature record[\s\S]*Missing optional files/i],
]);

requirePatterns("docs/spec-driven.md", [
  ["observations and acceptance distinct", /试验观察[\s\S]*接受规则[\s\S]*交付证据/],
  ["active revision versus successor boundary", /活动且未归档[\s\S]*spec-revise[\s\S]*已归档[\s\S]*successor feature/],
  ["stage-matched verification guide", /开发前只解决[\s\S]*开发中用聚焦检查[\s\S]*开发后/],
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
  "non-READY → 聚焦修复切片",
  "不在 gate 内修实现",
  "高风险并行,普通先 L3 后 L2",
  "READY → archive pending",
  "明确关闭/归档/提交 → /feature-archive",
]);
requireTerms("docs/project-workflow-overview.drawio", "progressive verification overview", [
  "开发前决策证据",
  "开发中 focused check",
  "完整交付 gate",
  "矩阵 / E2E / 全仓库",
  "独立选用",
  "必要低层失败",
  "长跑前执行预告",
]);
forbidPatterns("docs/project-workflow-overview.drawio", [
  ["legacy parallel scheduling", /L2\/L3 容量允许时并行/],
]);
forbidPatterns("docs/reviewers/README.md", [
  ["status-only protocol", /status-only/i],
  ["single terminal-report choreography", /one terminal report/i],
  ["same-run repair delta", /same-run repair-delta/i],
]);

for (const relative of [
  "template/docs/specs/changes/_template/spec.md",
  "template/docs/specs/changes/_template/plan.md",
  "template/docs/specs/changes/_template/tasks.md",
]) {
  forbidPatterns(relative, [
    ["premature receipt fields", /^## Proof Bundle$|^- Verdict:|^- Reviews:/m],
    ["literal filler decision", /\{\{TODO\}\}/],
    ["numeric exclusion quota", /至少\s*2-3\s*条/],
    ["forced decision N/A", /N\/A\(no durable why\/source decision\)/i],
  ]);
}
requirePatterns("template/docs/specs/changes/_template/spec.md", [
  ["expected and actual evidence", /预期结果[\s\S]*实际检查/],
]);

for (const relative of [
  "docs/actions/feature-init.md",
  "docs/actions/spec-quality-check.md",
  "docs/actions/feature-done.md",
  "template/docs/specs/changes/_template/plan.md",
  "template/docs/specs/changes/_template/spec.md",
  "template/docs/specs/changes/_template/tasks.md",
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

forbidPatterns("docs/examples/feature-record.md", [
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

requirePatterns("docs/examples/reviewer-mutation-smoke.md", [
  ["endpoint-owned task smoke", /run feature-done and become READY[\s\S]*endpoint\/lifecycle[\s\S]*cleanup before review/i],
  ["non-ready route smoke", /non-READY receipt[\s\S]*`direct-repair`[\s\S]*`spec-revise`/i],
  ["decision closure reviewer smoke", /resolved multi-turn decision closure[\s\S]*without reopening the choice[\s\S]*`SOURCE GAP`/i],
  ["complete dirty worktree population smoke", /commit an earlier selected-feature change[\s\S]*tracked edit[\s\S]*untracked selected-feature file[\s\S]*actual feature base[\s\S]*complete committed-and-uncommitted worktree population/i],
  ["mixed ownership boundary smoke", /Mix another active feature or unrelated work[\s\S]*`BLOCKED` before L1[\s\S]*instead of subtracting paths/i],
  ["scheduling-neutral review drift smoke", /sequential or capacity-serialized run[\s\S]*after one reviewer returns[\s\S]*before final aggregation[\s\S]*invalidated\(review-input drift\)/i],
]);

requirePatterns("docs/examples/feature-init-scenario-matrix.md", [
  ["decision closure interaction", /multi-turn feature conversation[\s\S]*no[\s\S]*duplicate confirmation[\s\S]*before any artifact is materialized/i],
  ["stage-matched verification interactions", /pre-implementation decision evidence[\s\S]*implementation feedback[\s\S]*delivery evidence/i],
  ["long-run and fail-fast interactions", /execution envelope[\s\S]*lower-cost necessary\s+check fails[\s\S]*exact progress is unavailable/i],
]);

requirePatterns("template/AGENTS.md", [
  ["plain-language collaboration", /plain language that requires no repository or testing knowledge[\s\S]*user's decision authority/i],
  ["cost-aware independent verification", /cheapest useful evidence[\s\S]*Matrix, E2E and repository-wide suites are independent options[\s\S]*not a package[\s\S]*observable facts/i],
]);

requirePatterns("adapters/codex/.codex-plugin/plugin.json", [
  ["default correction route", /materially corrects accepted feature behavior[\s\S]*\$spec-revise[\s\S]*\$spec-quality-check/i],
]);

if (problems.length) {
  console.error("Workflow structure check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log("Workflow structure OK: canonical ownership, conversation and evidence, single-record defaults, safe materialization, conditional review, and truthful receipts (structural checks, not model execution).");
