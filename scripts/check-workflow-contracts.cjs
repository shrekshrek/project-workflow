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

function requireReceiptChangeSchema(relative) {
  const changeLine = read(relative).split(/\r?\n/).find((line) => line.startsWith("- Change:"));
  if (!changeLine) {
    problems.push(`${relative}: missing receipt Change field`);
    return;
  }
  const stable = "git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]";
  const dirty = "git=[base=<commit SHA>; reviewed=worktree; dirty=yes]";
  if (!changeLine.includes(stable) || !changeLine.includes(dirty) || !changeLine.includes("endpoint-outputs=")) {
    problems.push(`${relative}: receipt Change field does not expose the current stable/dirty schema`);
  }
  if (changeLine.includes("repo=")) {
    problems.push(`${relative}: receipt Change field contains an unused repository label`);
  }
}

function requireReviewerExecutionContract(relative) {
  requireRegex(relative, /\bfresh\b/i, "fresh reviewer semantics");
  requireRegex(relative, /(?:shared|canonical) execution contract/i, "canonical reviewer execution contract reference");
  requireRegex(relative, /fallback/i, "fallback semantics");
  requireRegex(relative, /Review(?:er)? execution|audit execution/i, "reviewer execution evidence");
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

requireMarkers("docs/actions/README.md", [
  "## Contract ownership",
  "one normative definition",
  "The action specs are the executable contract",
  "## Architecture risk routing",
  "There is no standalone architecture action",
]);
requireMarkers("docs/architecture-design.md", ["durable trust/authorization ownership boundaries", "ordinary permission", "does not trigger"]);

const ciWorkflow = read(".github/workflows/version-sync-check.yml");
for (const marker of [
  "needs: validate",
  "needs.validate.outputs.release",
  "needs.validate.outputs.commit_ver",
]) {
  if (!ciWorkflow.includes(marker)) problems.push(`CI workflow: missing ${JSON.stringify(marker)}`);
}
if (ciWorkflow.includes("needs.version-sync")) {
  problems.push("CI workflow: stale version-sync job reference");
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
for (const relative of ["adapters/claude/skills/feature-done/SKILL.md", "adapters/codex/skills/feature-done/SKILL.md"]) {
  requireMarkers(relative, ["agents-md-reviewer", "spec-reviewer", "## Proof Bundle", "After required L1 passes", "Reviewers are read-only", "completion preflight", "not-run(completion preflight)", "preserve the prior non-empty receipt", "Lifecycle: READY; archive pending", "do not inline the full receipt"]);
  forbidMarkers(relative, ["lightweight architecture-drift observation", "architecture-drift observation"]);
}
requireMarkers("docs/actions/feature-done.md", ["Light-lane verification", "transient validation evidence", "receipt/history edits", "Resolved durable behavior with no existing area document is `update pending`", "area unresolved", "Persist only fields with a downstream consumer", "Completion Preflight", "primary-flow smoke", "mixed-feature", "Do not inline the full receipt"]);
requireMarkers("docs/actions/feature-done.md", ["unfinished checklist item", "return `BLOCKED`", "git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]", "git=[base=<commit SHA>; reviewed=worktree; dirty=yes]", "repository-relative `tasks.md#proof-bundle` path"]);
requireMarkers("docs/actions/feature-done.md", ["Delivery Shape Baseline", "high-impact surfaces", "routes to `spec-revise`, lane upgrade, or a child feature", "legacy-unambiguous impact boundary", "accepted-scope-"]);
forbidMarkers("docs/actions/feature-done.md", ["newly added or materially expanded test layers", "Architecture drift observation", "architecture-drift observation", "bounded architecture-drift"]);
requireMarkers("docs/actions/feature-done.md", ["Ignore the canonical", "Previous Proof Bundle", "not-run(completion preflight)", "do not leave an older READY receipt", "date-or-sequence", "non-READY rerun returns the status to `已确认`", "existing Verification obligation", "explicitly marked `Primary flow`", "must not invent an additional smoke", "older active artifact", "legacy-unambiguous selection", "frozen artifact", "Zero or several plausible legacy choices"]);
requireMarkers("docs/actions/feature-done.md", ["explicit Verification checks", "standard mechanical", "changed project scope", "repository-wide or release suites", "Do not treat every command listed"]);
requireMarkers("docs/actions/feature-done.md", ["reuse a passing check", "relevant inputs", "changed-scope classification", "provably unchanged", "uncertainty requires a rerun", "failed or affected checks", "dependency closure", "full changed-scope L1 population", "workspace or build cache sequentially", "same-task reuse", "must not be presented as newly executed", "Before the first full L2/L3 dispatch", "non-receipt spec/plan/tasks edits", "never repairs implementation or non-receipt artifacts"]);
for (const relative of ["template/docs/specs/changes/_template/tasks.md", "template/docs/specs/changes/_template/tasks-light.md", "docs/examples/full-feature-artifact.md"]) {
  requireMarkers(relative, ["mode=run|same-task reuse", "reused evidence reference"]);
}
for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
  "docs/examples/full-feature-artifact.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/tasks.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) forbidMarkers(relative, ["Architecture reflection:", "architecture-reflection-reviewer", "AR=", "N/A(no architecture signal)"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["## L1 reuse smoke", "same-task reuse", "original evidence reference", "workspace or build cache run sequentially", "relevant-input boundary uncertain"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["## Completion-preflight smoke", "## Endpoint-summary smoke", "## Reopen smoke", "does not inline", "git=[base=...; reviewed=...; dirty=...]", "ignores both receipt regions", "Lifecycle: READY; archive pending", "pure implementation regression", "not-run(completion preflight)"]);
forbidMarkers("docs/actions/feature-done.md", ["reproducible diff identity", "content fingerprint"]);
requireMarkers("docs/actions/feature-done.md", ["independently executable required L1 checks", "do not dispatch new reviewers", "still-valid same-task reviewer results", "not-run(L1 prerequisite)", "current-truth check", "receipt", "After L1 passes, missing execution evidence", "../reviewers/README.md#reviewer-execution-contract"]);
requireMarkers("docs/actions/feature-done.md", ["review-cycle snapshot", "Git/non-Git changed-path population", "exact applicable rule/spec IDs", "unverified-item-count=0", "blocking-ambiguity-count=0", "Never infer coverage from `findings=none`", "A PASS never persists applicable IDs or populations", "manual file populations", "population/content hashes", "dependency closure"]);
requireMarkers("docs/actions/feature-done.md", ["same-task, same-review-cycle optimization", "new revision of the cycle snapshot", "original full-population terminal evidence", "fix limited to the cited findings and their dependency closure", "change outside the finding/dependency closure", "unaffected changed-path population", "A later task", "base=<commit SHA>", "before writing those endpoint-owned outputs", "reviewed=<commit SHA>; dirty=no", "reviewed=worktree; dirty=yes", "Other reviewed/dirty pairings are invalid", "target-branch merge base", "ambiguous repository, base, or feature boundary blocks", "Derive changed paths from Git", "For light lane, run it only when", "declared receipt/status write is the only permitted endpoint-output difference"]);
requireMarkers("docs/actions/feature-done.md", ["Within one snapshot revision", "Across a permitted focused-re-review revision", "reviewer-specific scope, inputs, evidence dependencies, and applicable population", "cycle-level reviewed identity itself advances"]);
forbidMarkers("docs/actions/feature-done.md", ["cached L2/L3 results"]);
requireMarkers("docs/actions/feature-done.md", ["one transient review-cycle snapshot", "authoritative Git/non-Git changed-path population", "L1 command/result evidence map", "L2 convention-source paths", "L3 spec/artifact paths", "same snapshot revision and changed-path population", "must not rerun, substitute, or expand L1 commands", "evidence ID", "mapped obligation or convention-rule IDs", "relevant-input scope", "original execution-evidence reference", "L2 package may be explicitly empty", "every Verification obligation must map", "dispatch L2 and L3 in parallel", "sequential fresh dispatch", "not a fallback condition", "dispatch-to-aggregation window", "revalidate the current reviewed inputs", "later explicit `feature-done` invocation", "do not persist its path list"]);
requireMarkers("docs/actions/feature-done.md", ["Validate the complete owner-supplied review package", "one representation for every Verification obligation", "validates package structure, presence, and readability", "explicit gap or failed mapped evidence is a finding", "record every applicable review slot", "not-run(review-package incomplete)", "invalidated(review-input drift)", "never auto-start another full-population", "terminates the current"]);
requireMarkers("docs/reviewers/README.md", ["failure form defined by its canonical role and owning action", "roles whose verdict", "terminal `UNRELIABLE` report", "must not request the missing material", "piecemeal questions", "supplement the active invocation"]);
requireMarkers("docs/reviewers/spec-reviewer.md", ["complete package explicitly records a `verification gap`", "mapped evidence reliably shows failure"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["owner-required review-package input", "every applicable slot", "dispatches no reviewer", "rejects the cycle for aggregation", "does not auto-start another full-population cycle", "requesting the missing package", "explicit `verification gap`"]);
requireMarkers("docs/actions/feature-done.md", ["full authoritative changed-path population", "every ancestor tier/module `AGENTS.md`", "union the chains", "path-to-source applicability map", "root-to-nearest inheritance", "unrelated sibling guidance"]);
requireMarkers("docs/actions/feature-archive.md", ["receipt-schema migration candidate", "review-scope", "git=[base=...; reviewed=...; dirty=...]", "eligible only as a current-task result", "does not re-anchor it", "not proof that the reviewed worktree was unchanged", "delivery evidence and current truth as separate freshness questions", "later movement of a current branch or PR head does not by itself invalidate", "validate every pending current-truth fact against present implementation evidence"]);
requireMarkers("docs/actions/spec-revise.md", ["delivered-but-unarchived", "implementation regression under an unchanged accepted contract does not use this action", "return `已实现` to `已确认`", "Previous Proof Bundle", "date-or-sequence", "exactly one canonical `## Proof Bundle`", "archived feature requires a successor change"]);
requireMarkers("docs/actions/spec-revise.md", ["necessary-detail", "contract-correction", "separable-outcome", "speculative-capability", "bundled-risk", "already-written implementation", "becomes incomplete again", "scope expansion, contraction, or semantic correction"]);
requireMarkers("docs/actions/spec-revise.md", ["Stop implementation work", "code, tests, migrations, or compatibility paths", "compact `Scope stop`", "at most one"]);
for (const relative of ["adapters/claude/skills/spec-revise/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md"]) {
  requireMarkers(relative, ["delivered-but-unarchived", "implementation regression under an unchanged contract", "feature-done", "uniquely named dated-or-numbered superseded heading"]);
}

requireMarkers("docs/actions/spec-quality-check.md", ["Reviewer Execution", "../reviewers/README.md#reviewer-execution-contract", "fallback reason", "`BLOCKED`", "mechanical prerequisites failed", "stop before subjective review", "explicitly authorizes implementation", "`READY` consumes that authorization", "pure check/review request remains read-only", "`BORDERLINE` never consumes", "Q7a", "Q7b", "Q7c", "Q7d", "Size alone never changes the verdict", "do not ask twice", "Requirements Source Map", "Requirements Reconciliation", "`ALIGNED`", "`MISMATCH`", "`SOURCE GAP`", "bidirectional", "never dispatch a second", "reconciliation reviewer"]);
for (const relative of ["adapters/claude/skills/spec-quality-check/SKILL.md", "adapters/codex/skills/spec-quality-check/SKILL.md"]) {
  requireMarkers(relative, ["On `READY`", "continue implementation", "Pure checks remain read-only", "`BORDERLINE` requires explicit acceptance", "any status transition", "Requirements Source Map", "Requirements Reconciliation", "`MISMATCH` or `SOURCE GAP`"]);
  requireRegex(relative, /never dispatch\s+a separate reconciliation reviewer/i, "single reconciliation-reviewer dispatch");
}
const runtimeActions = ["project-init", "project-personalize", "feature-init", "spec-quality-check", "spec-revise", "feature-done", "feature-archive", "spec-reconcile", "agents-md-revise"];
for (const action of ["feature-done", "feature-init", "project-personalize", "spec-quality-check", "spec-revise", "agents-md-revise"]) {
  requireReviewerExecutionContract(`adapters/claude/skills/${action}/SKILL.md`);
  requireReviewerExecutionContract(`adapters/codex/skills/${action}/SKILL.md`);
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
requireMarkers("docs/reviewers/README.md", ["Reviewer execution contract", "dispatch capability", "fresh subagent invocation", "never an agent instance", "fresh-subagent", "result-reuse", "observed reason", "host security approvals still apply", "fail closed", "dependency closure", "same task and review cycle", "original full-population evidence", "multiple user turns", "must not rerun, expand, or substitute", "status-only and non-authoritative", "one terminal report"]);
requireRegex("docs/reviewers/README.md", /Codex plugin skills[\s\S]{0,160}must use[\s\S]{0,160}subagent/i, "mandatory Codex reviewer index wording");
for (const action of ["feature-init", "project-personalize", "spec-revise", "agents-md-revise"]) {
  requireMarkers(`docs/actions/${action}.md`, ["## Reviewer Execution", "../reviewers/README.md", "`Reviewer execution`", "blocking"]);
}

for (const relative of ["docs/reviewers/agents-md-reviewer.md", "docs/reviewers/spec-reviewer.md"]) {
  requireMarkers(relative, ["authoritative scope", "changed-path-count", "exact applicable", "unverified-item-count", "blocking-ambiguity-count", "required zero-valued", "UNRELIABLE", "omit the exact changed-path list", "Do not execute or repeat tests, builds, linters, acceptance commands", "read-only Git/diff/search inspection", "status-only", "must not expose provisional findings", "one terminal report"]);
  forbidMarkers(relative, ["scope-match=", "count equality alone is insufficient"]);
  forbidMarkers(relative, ["coverage is 100%", "coverage is at least 95%", "coverage >= 95%", "confidence", "skipped-critical"]);
}
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["exact applicable rule IDs", "Assess every changed path diff-first", "does not require reading every implementation file in full", "Keep definite non-matches internal for a clean `PASS`"]);
requireMarkers("docs/reviewers/spec-reviewer.md", ["exact applicable spec IDs", "Assess implementation diff-first", "verification gap", "Keep non-applicable items internal for a clean `PASS`"]);
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["definite non-matches", "applicable population", "applicable-rule-count"]);
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["ancestor `AGENTS.md` chain", "unrelated sibling file is not applicable", "omits an applicable ancestor", "inherit non-conflicting rules", "same identifiable requirement", "all other parent rules remain inherited", "Proximity alone never", "blocking ambiguity"]);
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["project-root `.claude/rules/*.md`", "user-level `~/.claude/rules/` are excluded"]);
requireMarkers("adapters/claude/agents/agents-md-reviewer.md", ["project-root `.claude/rules/*.md`", "never user-level `~/.claude/rules/`"]);
for (const relative of [
  "docs/reviewers/agents-md-reviewer.md",
  "docs/reviewers/spec-reviewer.md",
  "docs/reviewers/spec-quality-reviewer.md",
  "docs/reviewers/decision-completeness-auditor.md",
]) {
  forbidMarkers(relative, ["coverage percentage", "coverage score", "confidence score", "confidence=<"]);
}
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Q3", "Q4", "Q5", "Q7a", "Q7b", "Q7c", "Q7d", "delivery-shape feasibility", "reviewed items", "blocking ambiguity", "Requirements Source Map", "Requirements Reconciliation", "missing-from-artifact", "unsupported-artifact", "superseded-remnant", "cross-artifact-conflict", "SOURCE GAP", "same invocation"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["bounded architecture-adequacy check inside Q5/Q7c/Q7d", "smallest sufficient responsibility/component set", "Never return `N/A` after dispatch"]);
forbidMarkers("docs/reviewers/spec-quality-reviewer.md", ["return N/A with \"not enough filled content\""]);
requireMarkers("adapters/claude/agents/spec-quality-reviewer.md", ["Requirements Reconciliation", "Q3-Q7", "architecture adequacy inside Q5/Q7c/Q7d"]);
for (const relative of ["adapters/claude/skills/spec-quality-check/SKILL.md", "adapters/codex/skills/spec-quality-check/SKILL.md"]) {
  requireMarkers(relative, ["architecture-shaped boundary signal", "Q5/Q7c/Q7d", "same"]);
}
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["## Architecture-shaped spec-quality smoke", "no second dispatch or output field", "conditional architecture check is skipped"]);
requireMarkers("docs/actions/spec-quality-check.md", ["1. The spec/plan minimum set", "3. Verification contains the smallest non-redundant proof obligations", "4. Outcomes describe", "5. Constraints are concrete"]);
requireMarkers("docs/actions/spec-quality-check.md", ["exactly one existing obligation `Primary flow`", "Non-user-visible work has no marker", "never creates another obligation"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["exactly one obligation in `spec.md` Verification must be marked `Primary flow`", "zero or several there is a fail", "Never request a separate smoke"]);
requireMarkers("docs/spec-driven.md", ["原则只读", "仍在 active", "正式重开", "已进入 `archive/` 的 feature 永久只读", "successor change"]);
forbidMarkers("docs/workflow.md", ["PR 描述可原样复制"]);
requireMarkers("docs/workflow.md", ["PR 描述使用同一业务摘要并链接该节", "不复制逐条命令证据"]);
forbidMarkers("template/docs/specs/changes/_template/plan.md", ["Coordinated repositories", "跨仓库", "repo="]);
for (const relative of ["template/docs/specs/changes/_template/spec-greenfield.md", "template/docs/specs/changes/_template/spec-brownfield.md", "template/docs/specs/changes/_template/tasks-light.md"]) {
  requireMarkers(relative, ["Primary flow", "只决定 preflight 顺序"]);
}
forbidMarkers("template/docs/specs/changes/_template/tasks.md", ["Primary flow"]);
forbidRegex("docs/examples/full-feature-artifact.md", /^- \[ \].*Primary flow/m, "duplicate full-lane Primary flow marker in tasks mapping");
for (const relative of ["README.md", "docs/quickstart.md", "docs/workflow.md", "docs/actions/feature-done.md", "docs/actions/feature-archive.md", "template/docs/specs/changes/_template/plan.md", "docs/examples/reviewer-mutation-smoke.md"]) {
  forbidMarkers(relative, ["multi-repository", "multi-repositor", "Coordinated repositories", "协调式跨仓库", "two explicitly named repositories", "every repository containing reviewed changes", "repo="]);
}
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["Decision Matrix", "Must-fix", "Warnings", "Cross-file Consistency", "Completeness"]);

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
  "docs/examples/full-feature-artifact.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/tasks.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) {
  requireRegex(relative, /^- Verdict:/m, "receipt Verdict field");
  requireReceiptChangeSchema(relative);
  requireRegex(relative, /^- Checks/m, "receipt Checks field");
  requireRegex(relative, /^- Review execution:.*state=/m, "reviewer execution state field");
  requireRegex(relative, /^- Current truth:/m, "receipt Current truth field");
  forbidMarkers(relative, ["coverage=", "confidence=", "Rule sources:", "drift ledger", "review-scope=", "population-hash"]);
}
requireRegex("template/docs/specs/changes/_template/tasks.md", /^- L2:.*baseline=\[.*only when non-empty/m, "compact full-lane L2 receipt");
requireRegex("template/docs/specs/changes/_template/tasks.md", /^- L3:.*baseline=\[.*only when non-empty/m, "compact full-lane L3 receipt");
for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "docs/examples/full-feature-artifact.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/tasks.md",
]) {
  requireRegex(relative, /^- L2:.*not-run\(L1 prerequisite\)/m, "full-lane L2 prerequisite-skip receipt");
  requireRegex(relative, /^- L3:.*not-run\(L1 prerequisite\)/m, "full-lane L3 prerequisite-skip receipt");
  requireRegex(relative, /^- L2:.*not-run\(review-package incomplete\).*invalidated\(review-input drift\)/m, "full-lane L2 package/drift receipt states");
  requireRegex(relative, /^- L3:.*not-run\(review-package incomplete\).*invalidated\(review-input drift\)/m, "full-lane L3 package/drift receipt states");
}
for (const relative of [
  "template/docs/specs/changes/_template/tasks-light.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) {
  requireRegex(relative, /^- L2:.*not-run\(review-package incomplete\).*invalidated\(review-input drift\)/m, "light-lane L2 package/drift receipt states");
  requireRegex(relative, /^- Review execution:.*L3=<state=N\/A\(light lane\)\|not-run\(completion preflight\)>/m, "light-lane L3 execution state");
}
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["不记录逐轮命令输出", "已被后续结果取代", "最终 checks 只进"]);
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["证据义务 → 最小 command / assertion"]);
for (const relative of ["template/docs/specs/changes/_template/tasks.md", "docs/examples/full-feature-artifact.md"]) {
  forbidMarkers(relative, ["### Acceptance", "spec §4 Verification 全部 pass"]);
}
forbidMarkers("template/docs/specs/changes/_template/tasks.md", ["applicable-rules=", "applicable-items=", "applicable-unverified="]);
for (const relative of [
  "template/docs/specs/changes/_template/spec-greenfield.md",
  "template/docs/specs/changes/_template/spec-brownfield.md",
]) {
  requireMarkers(relative, ["主要风险 → 最小 command / assertion"]);
  forbidMarkers(relative, ["单测:{{TODO}}", "集成:{{TODO}}", "手测:{{TODO}}"]);
}
forbidMarkers("template/.claude/rules/testing.md", ["{{UNIT_TEST_FRAMEWORK}}", "{{INTEGRATION_TEST_FRAMEWORK}}", "{{E2E_FRAMEWORK}}", "门槛 ≥ {{COVERAGE_THRESHOLD}}", "(交付前跑,不进 hook)"]);
forbidMarkers("docs/examples/full-feature-artifact.md", ["- 单测:", "- 集成:", "- 手测:", "- [ ] e2e:"]);
requireRegex("template/docs/specs/changes/_template/tasks-light.md", /^- L2:.*baseline.*only when non-empty.*N\/A\(low-risk light lane; no L2 trigger after convention-scope triage/m, "conditional light-lane L2 evidence shape");
for (const relative of [
  "template/docs/specs/changes/_template/tasks-light.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) {
  requireRegex(relative, /^- L2:.*not-run\(L1 prerequisite\)/m, "light-lane L2 prerequisite-skip receipt");
}
requireRegex("template/docs/specs/changes/_template/tasks-light.md", /^- L3:.*verification=\[/m, "light-lane L3 verification field");
requireMarkers("template/docs/specs/changes/_template/tasks-light.md", ["verification=[item#id: PASS|FAIL]"]);

requireMarkers("docs/actions/feature-init.md", ["do not create a pseudo-lane", "Use full lane for high-risk or contract-shaped work", "Use light lane only when all are true"]);
requireMarkers("docs/actions/feature-init.md", ["## Route Decision", "`DIRECT`", "`LIGHT`", "`FULL`", "`PREVIEW`", "`APPLY`", "return a read-only route preview", "that assessment never authorizes artifact creation", "Automatic skill invocation is not write authorization", "This is a risk class, not a closed keyword list", "Route: pending", "never create a duplicate", "`Feature`: `none`, `create=<path>`, or `reuse=<path>`", "`Next gates`"]);
requireMarkers("docs/actions/feature-init.md", ["Absent an explicit feature-routing assessment", "general discussion/review/diagnosis without that request does not invoke the action", "completion returns control to that request without another confirmation", "artifact-initialization-only request stops"]);
requireMarkers("docs/actions/feature-init.md", ["proof obligations", "do not derive generic edge, error, status-code, or unspecified-input cases", "one command or assertion may satisfy several related obligations", "interacting dimensions can change the result", "Do not create a test-layer, endpoint, status-code, or happy/boundary/error matrix for symmetry"]);
requireMarkers("docs/actions/feature-init.md", ["impact and necessity preflight", "present actor/consumer", "dirty-worktree overlap", "small, medium, large, or extra-large", "Speculative future capability", "one material question at a time across turns", "Do not materialize a speculative", "`Impact` section"]);
requireMarkers("docs/actions/spec-quality-check.md", ["smallest non-redundant proof obligations", "Generic derived edge/error cases and unspecified inputs are removed", "One evidence source may cover several related obligations", "artifact that requires an additional test layer or matrix", "distinct risk coverage", "fails Q3", "compact passing range", "More test layers, cases, or matrix cells never improve the verdict", "Implementation Scope Stop", "pre-3.11 active artifact", "legacy-unambiguous impact boundary", "ordinary contract prose has no duplicate plan row"]);
requireMarkers("docs/actions/spec-quality-check.md", ["Q7c", "Q7d", "traceable current consumer", "Delivery Shape Baseline", "scope-growth triggers", "currently necessary outcome"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["One command may prove several related obligations", "Do not require time estimates or split one task per test case", "Optional implementation ideas"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Every test layer or matrix required by the artifact", "fails Q3", "deleted or consolidated", "test counts", "smallest sufficient", "legacy-unambiguous impact boundary", "accepted spec content needs no duplicate"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Q7c current necessity", "Q7d impact completeness", "possible future need", "Use counterexamples"]);
requireMarkers("docs/spec-driven.md", ["Impact Preflight", "Delivery Shape Baseline", "Q7c", "Q7d", "Scope delta", "speculative-capability", "已经写了代码不构成收编理由"]);
requireMarkers("docs/workflow.md", ["Impact/Necessity Preflight", "Delivery Shape Baseline", "Scope Delta", "speculative-capability", "已经写出的代码不构成收编理由"]);
requireMarkers("docs/spec-driven.md", ["只把需要持久追踪的选择", "选择性当场写回", "普通实现细节不逐项记账", "Git 历史或当前用户确认的 pre-3.11", "需要持久 why/source", "N/A(no durable why/source decision)` 不属于反模式"]);
requireMarkers("docs/workflow.md", ["Prior decisions 选择性写回", "普通 spec 契约不复制", "没有此类决定时显式 N/A"]);
forbidMarkers("docs/spec-driven.md", ["否则只在 Prior decisions 写 why", "### 6.2 plan.md Prior decisions 留空", "任何讨论中已定的技术选型"]);
requireMarkers("docs/actions/project-personalize.md", ["A command being available does not make it mandatory for every feature", "Do not introduce a missing test layer, matrix, coverage gate, or release suite for completeness", "does not manufacture layer or matrix symmetry"]);
for (const relative of ["template/docs/specs/changes/_template/tasks.md", "template/docs/specs/changes/_template/tasks-light.md"]) {
  requireMarkers(relative, ["不要按预计时长或测试 case 机械拆分"]);
  forbidMarkers(relative, ["30min-2h", "30 分钟 - 2 小时"]);
}
requireMarkers("docs/actions/feature-done.md", ["merely for symmetry", "each layer proves a distinct risk"]);
requireMarkers("docs/actions/feature-init.md", ["scope-viability check", "Never report a nonblocking Scope Viability result", "clarification-required", "split-required", "bundled-risk-accepted", "pending-selection", "pending-handoff", "size alone never requires a split", "durable decomposition handoff", "untracked out-of-scope outcomes", "Do not create a repository backlog", "separate external write that requires the user's explicit authorization", "Recheck them at `spec-quality-check`"]);
requireMarkers("docs/actions/feature-init.md", ["### Implementation Scope Stop", "before", "production code", "tests, migrations, compatibility paths", "Safe read-only", "necessary-detail", "simpler implementation", "compact `Scope stop`", "Ask at most one", "full lane is not"]);
requireMarkers("docs/actions/feature-init.md", ["### Implementation Continuation Check", "contract-bearing slices", "context", "compaction", "continue silently", "Do not ask the user to reconfirm", "scope-growth triggers", "tier, directory, file count, test layer/case, or estimated duration", "feature, action, lane, gate"]);
requireMarkers("docs/actions/feature-init.md", ["constrains slice boundaries, not coding order inside a slice", "real internal", "dependency order"]);
requireMarkers("docs/actions/feature-init.md", ["add or retain a distinct test layer/case only", "cheaper existing evidence", "Prefer extending the nearest existing test", "focused checks", "final check population", "applicable project/release conventions", "Execute each unchanged final evidence source once", "test counts"]);
requireRegex("docs/actions/feature-init.md", /Remove\s+tests that only protect superseded behavior/i, "remove superseded-behavior tests");
forbidMarkers("docs/actions/feature-init.md", ["Scope Viability: single", "Scope Viability: N/A"]);
requireRegex("docs/actions/feature-init.md", /Run the impact and necessity preflight[\s\S]{0,700}Decide whether a new artifact[\s\S]{0,700}Run the scope-viability check/, "impact before artifact decision before scope viability");
requireMarkers("tests/fixtures/feature-init-scenarios/expected.json", [
  "no-artifact-accepted-spec-implementation",
  "no-artifact-multifile-refactor",
  "light-existing-contract-ui-handoff",
  "full-docs-only-cross-module-contract",
  "scope-viability-ask",
  "split-handoff-ask",
  "light-split-with-explicit-untracked-deferred",
  "light-split-with-durable-handoff",
  "impact-unknown-data-disposition-ask",
  "scope-necessity-speculative-admin-ask",
  "impact-large-coupled-cutover",
  "scope-split-provider-rollout-ask",
]);
requireMarkers("docs/examples/feature-init-scenario-matrix.md", ["Twenty-three scenarios", "unknown data disposition", "speculative capability", "large coupled impact", "Provider", "smallest model-smoke set", "Run the full matrix only when", "Run this only when skill discovery or lane routing changed"]);
requireMarkers("docs/examples/feature-init-scenario-matrix.md", ["explicit routing request triggers `feature-init`", "enclosing implementation continues in the same task without another confirmation", "artifact initialization was the whole request"]);
requireMarkers("docs/actions/feature-init.md", ["when the project uses such an optional declaration"]);
requireMarkers("docs/actions/feature-init.md", ["not declared in current truth", "cross-session or multi-person handoff", "Do not create `tasks.md` merely because code is user-visible"]);
requireMarkers("docs/actions/feature-init.md", ["normalizes an existing target-root symlink", "rejects symlinked destinations beneath the resolved root"]);
requireMarkers("docs/actions/feature-done.md", ["Projects without this optional declaration", "do not need an empty path list"]);
for (const relative of ["docs/actions/feature-init.md", "adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["materialize-feature-artifact.cjs", "no-clobber"]);
}
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["impact/necessity preflight", "scope-viability", "before materialization", "Add `Impact` only", "docs/architecture-design.md", "ordinary features skip it", "unconfirmed high-impact architecture", "ordinary full-lane work with directly traceable values is `N/A`"]);
}
requireMarkers("docs/actions/README.md", ["active runtime adapter", "CLAUDE_PLUGIN_ROOT", ".codex-plugin/plugin.json", "Do not scan another host's cache", "required asset"]);
forbidMarkers("docs/actions/README.md", ["~/.claude/plugins/cache", "~/.codex/plugins/cache", "most recently installed compatible package"]);
requireMarkers("adapters/claude/skills/feature-init/SKILL.md", ["`CLAUDE_PLUGIN_ROOT` is required", "scripts/materialize-feature-artifact.cjs"]);
requireRegex("adapters/claude/skills/feature-init/SKILL.md", /occupied directory.*leave it untouched.*rerun feature-init/i, "occupied-directory no-clobber rerun semantics");
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["scripts/materialize-project-baseline.cjs", "six target-mapped files", "Do not ask stack questions"]);
requireMarkers("docs/actions/project-init.md", ["baseline-compatible target", "complete target population including dotfiles", "all absent, all matching, or partial/custom/occupied", "only incidental material", "one focused routing question", "stop before staging", "application structure may still be undecided", "inside the first feature", "govern several later features"]);
requireMarkers("docs/actions/project-personalize.md", ["complete, partial, unrelated, or missing project-workflow baseline", "excluding version-control metadata from content classification", "A target with project evidence but no `AGENTS.md` remains a `project-personalize` case", "partial/custom/occupied baseline destination", "one focused routing question", "not an architecture-quality verdict"]);
requireMarkers("docs/actions/project-personalize.md", ["## Evidence-led Decision Conversation", "Observed", "Proposed", "Unresolved", "one material question per turn", "without restating settled evidence", "single consolidated preview", "creates no additional feature, spec, lane, gate"]);
requireMarkers("docs/actions/project-personalize.md", ["_multi_tier_examples", "Do not claim that an architecture is suitable", "ordinary full lane", "Architecture-design conversational fill is out of scope", "do not load the architecture guide"]);
requireMarkers("docs/actions/project-personalize.md", ["guidance-placement report", "path-local", "clear existing or intentionally planned subtree", "exactly `@AGENTS.md` plus a newline", "not an architecture-quality verdict"]);
requireMarkers("docs/actions/feature-init.md", ["no reserved `project-foundation` action, lane, or slug", "Keep minimal structure inside the first feature", "do not create a new artifact schema", "Multiple components alone do not establish multiple tiers", "Single-tier or tier-undecided"]);
requireMarkers("docs/actions/feature-init.md", ["resolve **Guidance Placement**", "creates/changes a tier or module boundary", "durable local exception", "root `AGENTS.md`", "tier `AGENTS.md`", "module `AGENTS.md`", "enforced mechanically", "Ordinary features"]);
requireMarkers("docs/architecture-design.md", ["not a workflow action, lane, gate, reviewer, artifact type, or reserved slug", "Ordinary features skip this guide", "smallest sufficient", "Do not infer call direction or sync/async relationships", "Multiple named components do not prove separate tiers or paths", "Do not load tier examples or choose a Sibling Alignment result", "create no additional architecture document or schema", "continue the question → user decision → artifact update loop across user turns", "when ownership changes design or operation", "do not recommend `spec-quality-check`"]);
requireMarkers("docs/actions/project-personalize-reference.md", ["## Evidence order", "Never use an example below as a default", "## Legacy default cleanup", "## Optional high-impact path declarations", "not part of the generated baseline or default personalization flow"]);
forbidMarkers("docs/actions/project-personalize-reference.md", ["默认 80", "default 80", "固定 GitHub", "默认 conventional", "default Playwright"]);
requireMarkers("adapters/claude/skills/project-personalize/SKILL.md", ["partial/missing baseline", "materialize-project-baseline.cjs"]);
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /missing baseline does not copy host-private rules, hooks, or tier examples/i, "missing-baseline host-private exclusion semantics");
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /`codebase-explorer` applies only[\s\S]{0,180}`tech-researcher` applies only/i, "role-applicability prose");
requireMarkers("adapters/codex/skills/project-personalize/SKILL.md", ["Include dotfiles", "all six matching plus only incidental material is N/A", "materialize-project-baseline.cjs", "Do not copy host-private rules/hooks/tier examples by default"]);
for (const relative of ["adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md"]) {
  requireMarkers(relative, ["excluding version-control metadata from content classification"]);
  requireMarkers(relative, ["Evidence-led Decision Conversation", "Observed / Proposed / Unresolved", "material question per turn", "without restating settled evidence"]);
}
for (const relative of ["docs/actions/project-personalize.md", "adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md"]) {
  requireMarkers(relative, ["commands", "source/test paths", "project-specific rules", "tier ownership"]);
}
requireMarkers("adapters/claude/skills/project-personalize/SKILL.md", ["--stage", "Consolidated Preview + Apply Gate", "symlink", "working agreement is aligned", "without claiming an architecture-quality verdict"]);
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /leaves the target unchanged/i, "rejected-apply unchanged-target semantics");
requireMarkers("adapters/codex/skills/project-personalize/SKILL.md", ["one consolidated diff", "target unchanged", "symlink", "working agreement is aligned", "without claiming an architecture-quality verdict"]);
for (const relative of ["adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md"]) {
  requireMarkers(relative, ["Do not run architecture-design conversational fill here", "accepted-decision evidence", "feature-init"]);
}

requireMarkers("template/AGENTS.md", [
  "deferred until repository evidence defines it",
  "host's `feature-init` action",
  "one independently deliverable outcome or needs decomposition",
  "DIRECT/no artifact",
  "LIGHT/tasks-only",
  "FULL/spec-plan-tasks",
  "explicit feature-routing question uses read-only PREVIEW",
  "general discussion/review/diagnosis without that question does not invoke",
  "authorized LIGHT/FULL APPLY creates an artifact",
  "DIRECT creates none and an enclosing implementation request continues",
  "exclude `docs/specs/changes/archive/` unless tracing history",
  "For every lane, stop before extending implementation",
  "Full lane is not",
  "ask at most one material question",
  "already-written code is never",
  "Keep tests few and sufficient",
  "cheaper evidence",
  "Counts and layer symmetry",
  "select the final check",
  "repository-wide or release suite only when",
  "execute each unchanged final evidence source once",
  "Create nested `AGENTS.md` only for a durable rule",
  "difference-only",
  "directory symmetry",
  "exactly `@AGENTS.md` plus one newline",
]);
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, [
    "may need tracked acceptance",
    "Route-preview requests are read-only",
    "explicitly asks whether work needs a project-workflow feature",
    "Do not invoke for general discussion",
    "DIRECT, LIGHT tasks-only, or FULL spec/plan/tasks",
    "`PREVIEW` never invokes the materializer",
    "invocation alone is not write authorization",
    "Reuse a compatible active feature",
    "canonical `Route`, `Execution`, concrete `Reason`, `Feature`",
    "on the normal path do not mention that check, its field name, or its omission",
    "Do not terminate an enclosing implementation/change request",
    "`DIRECT` creates nothing and continues an enclosing implementation request",
    "`LIGHT` proceeds to implementation after materialization and skips `spec-quality-check`",
  ]);
}
forbidMarkers("template/AGENTS.md", ["{{HOOK_INDEX}}", ".claude/hooks/", ".codex/hooks.json", "High-Blast-Radius Paths", "None declared yet"]);
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "--apply-staged", "complete target population including dotfiles", "byte-matching template contents", "stop before staging", "neutral workflow baseline is ready"]);
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["explicit invocation already authorizes"]);
forbidMarkers("adapters/claude/skills/project-init/SKILL.md", ["rm -f ./.claude/settings.json", "-exec cp -r"]);
requireMarkers("adapters/codex/skills/project-init/SKILL.md", ["materialize-project-baseline.cjs", "six target-mapped files", "--stage", "leaving the target unchanged", "complete target population including dotfiles", "byte-matching template contents", "stop before staging", "neutral workflow baseline is ready"]);
for (const relative of ["adapters/claude/skills/project-init/SKILL.md", "adapters/codex/skills/project-init/SKILL.md"]) {
  requireMarkers(relative, ["excluding version-control metadata from content classification", "partial/custom/occupied", "only incidental material", "one focused routing question", "Preserve incidental content without interpreting or merging it", "do not invoke two next paths", "inside the first feature", "governs several later features"]);
}
for (const relative of ["docs/actions/project-init.md", "docs/actions/project-personalize.md", "adapters/claude/skills/project-init/SKILL.md", "adapters/claude/skills/project-personalize/SKILL.md"]) {
  forbidMarkers(relative, ["scaffold/inactive", "inactive scaffold"]);
}
forbidMarkers("AGENTS.md", ["Path C"]);
forbidMarkers("docs/workflow.md", ["project-personalize Path C"]);
for (const relative of ["docs/quickstart.md", "docs/workflow.md", "docs/cross-tool-methodology.md", "docs/spec-driven.md", "template/docs/specs/changes/_template/tasks-light.md"]) {
  forbidMarkers(relative, ["全道"]);
}

requireMarkers("docs/actions/spec-revise.md", ["ADRs are conditional", "one consolidated proposed-diff approval", "without changing the worktree"]);
requireMarkers("docs/actions/spec-revise.md", ["rerun the `feature-init` impact/necessity and scope-viability checks", "child feature", "bundled-delivery risk", "scope-viability", "stable issue/PM reference", "External tracker edits do not revise this feature implicitly"]);
requireMarkers("docs/actions/spec-revise.md", ["Prior decisions source trace", "explicitly identify", "never rely on chat memory"]);
for (const relative of ["adapters/claude/skills/spec-revise/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md"]) {
  requireMarkers(relative, ["necessary-detail", "contract-correction", "separable-outcome", "speculative-capability", "bundled-risk", "already-written implementation", "Scope stop", "code, tests, migrations", "at most one decision question"]);
}
for (const relative of ["adapters/claude/skills/feature-done/SKILL.md", "adapters/codex/skills/feature-done/SKILL.md"]) {
  requireMarkers(relative, ["high-impact scope outside the accepted Delivery", "not-run(completion preflight)", "mechanically", "exact adopted one-line alias", "semantic-placement judgment remains in L2"]);
  forbidMarkers(relative, ["new test layers/matrices/fixtures/cases", "architecture-drift observation"]);
}
requireMarkers("template/docs/specs/changes/_template/plan.md", ["Delivery Shape Baseline", "当前 outcome / consumer", "Delivery risk signal", "Scope growth triggers", "| 决策 | 为什么 | 来源 |", "supersedes", "不要粘贴原始聊天记录", "只有符合 §3 范围的决定", "普通实现细节不需要逐项记账", "N/A(no durable why/source decision)", "不要为填表复制 spec"]);
requireMarkers("template/docs/specs/changes/_template/plan.md", ["按真实依赖顺序", "仅当 Delivery risk signal 为 large/extra-large", "合同切片", "Implementation Continuation Check", "material delta", "Implementation Scope Stop", "下一个 consumer", "最小 focused evidence", "large/extra-large 时补充"]);
requireMarkers("docs/examples/full-feature-artifact.md", ["Delivery risk signal:large", "## 5. 实施顺序", "退出:", "下一个 consumer:", "最小证据:"]);
for (const relative of [
  "docs/actions/feature-init.md",
  "docs/actions/spec-quality-check.md",
  "docs/reviewers/spec-quality-reviewer.md",
  "docs/spec-driven.md",
  "template/docs/specs/changes/_template/plan.md",
]) {
  forbidMarkers(relative, ["domain/backend", "API/BFF", "frontend → focused verification", "领域/后端"]);
}
requireMarkers("docs/actions/feature-init.md", ["Keep outcomes, scope, constraints, and exclusions in `spec.md`", "do not copy them into plan Prior decisions", "non-obvious", "not a raw transcript", "before `spec-quality-check`"]);
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["ordinary outcomes/scope/constraints/exclusions in `spec.md`", "non-obvious choices", "plan Prior decisions", "Do not preserve a raw transcript"]);
  requireMarkers(relative, ["Implementation Scope Stop", "every route", "Already-written code and tests", "smallest-sufficient-evidence", "distinct risk coverage"]);
  requireMarkers(relative, ["Implementation Continuation Check", "contract-bearing slice transitions/resume", "silently recheck accepted boundaries", "dependent work"]);
}
for (const relative of ["template/docs/specs/changes/_template/spec-greenfield.md", "template/docs/specs/changes/_template/spec-brownfield.md"]) {
  requireMarkers(relative, ["当前 consumer", "仅为未来可能性服务的能力不进入本 feature"]);
}
requireMarkers("template/docs/specs/changes/_template/tasks-light.md", ["预期影响 / 熔断"]);
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["Delivery Shape Baseline", "scope delta", "继续写生产代码、测试、migration 或兼容层前立即停下", "一次问一个问题", "不得因代码已经写出而自动收编", "测试数量和层级对称不构成质量"]);
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["plan §5", "Implementation Continuation Check", "不要求用户重复确认"]);
requireMarkers("template/docs/specs/changes/_template/tasks-light.md", ["继续写代码、测试、migration 或兼容层前停", "一次问一个问题", "不得因已写代码自动收编", "测试数量和层级对称不构成质量"]);
for (const relative of ["adapters/claude/skills/spec-quality-check/SKILL.md", "adapters/codex/skills/spec-quality-check/SKILL.md"]) {
  requireMarkers(relative, ["accepted outcome and impact boundary", "`Implementation Scope Stop`", "smallest-sufficient-evidence"]);
  requireMarkers(relative, ["`Implementation Continuation Check`", "smallest-sufficient-evidence rules", "into implementation"]);
  requireMarkers(relative, ["Q6 Guidance Placement", "root/tier/module/mechanical", "difference-only", "one-line alias"]);
}
requireMarkers("docs/actions/spec-quality-check.md", ["contract-bearing slices", "inspectable exits", "silent continuation checks", "sequence requirement is N/A", "Implementation Scope Stop and Implementation Continuation", "aligned work continues silently", "material mismatch stops dependent work"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["contract-bearing slices", "inspectable exits", "next consumers", "context/session resume", "inspectable point before", "endpoint review", "continuation-sequence requirement is N/A", "artifact is not rewritten"]);
requireMarkers("docs/actions/spec-quality-check.md", ["Multi-module work has sibling alignment", "exact enforcement/placement", "Nested guidance repeats no parent text", "one-line `@AGENTS.md` alias"]);
requireMarkers("docs/actions/spec-quality-check.md", ["Prior decisions section, which may explicitly be `N/A(no durable why/source decision)`", "reliably identified pre-3.11 active artifact", "repository history or explicit current-user confirmation", "cannot claim the fallback merely because the field is missing"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Q6 sibling/guidance alignment", "directory-symmetry files", "mechanically decidable"]);
requireMarkers("template/docs/specs/changes/_template/plan.md", ["Codify 不等于一定新建文件", "root/tier/module AGENTS.md 或机械门禁", "嵌套规则只写父级差量"]);
requireMarkers("docs/actions/spec-revise.md", ["Guidance Placement", "changed tier/module", "root/tier/module/mechanical"]);
requireMarkers("docs/actions/feature-done.md", ["explicit Guidance Placement commitment", "not-run(completion preflight)", "mechanically require", "byte-equivalent", "Difference-only content", "belong to L2", "Do not infer a", "Codify commitment"]);
requireMarkers("docs/actions/agents-md-revise.md", ["Guidance Placement audit", "keep/move/create/delete/mechanize", "no remaining consumer exists outside", "byte-equivalent to `@AGENTS.md\\n`"]);
requireMarkers("docs/workflow.md", ["不是层级越深更新越频繁", "低频、事件触发", "偶发、事件触发", "少见、事件触发", "每个 feature 或每个目录的常规产物"]);
forbidMarkers("docs/spec-driven.md", ["项目周期内**最低频更新**", "明显低于 tier / 模块级"]);
for (const relative of [
  "adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md",
  "adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md",
  "adapters/claude/skills/spec-revise/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md",
  "adapters/claude/skills/feature-done/SKILL.md", "adapters/codex/skills/feature-done/SKILL.md",
  "adapters/claude/skills/agents-md-revise/SKILL.md", "adapters/codex/skills/agents-md-revise/SKILL.md",
]) requireMarkers(relative, ["Guidance Placement"]);
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

forbidMarkers("template/docs/adr/README.md", ["/agents-md-revise` 周期性点名", "零引用 + 60 天以上"]);
for (const relative of ["docs/actions/agents-md-revise.md", "adapters/claude/skills/agents-md-revise/SKILL.md", "adapters/codex/skills/agents-md-revise/SKILL.md"]) {
  forbidMarkers(relative, ["current-truth freshness", "current-truth 新鲜度", "ADR orphan", "ADR 孤儿"]);
}
forbidMarkers("adapters/claude/skills/agents-md-revise/SKILL.md", ["every 2-4 weeks", "每 2-4 周", "每 2 周"]);

forbidMarkers("adapters/claude/skills/agents-md-revise/SKILL.md", ["Item 5a", "Item 5b", "proof bundle 5 项"]);
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["## Dispatch Boundary", "directly traceable", "unconfirmed high-impact"]);
for (const relative of [
  "adapters/claude/skills/feature-init/SKILL.md", "adapters/claude/skills/project-personalize/SKILL.md", "adapters/claude/skills/spec-revise/SKILL.md", "adapters/claude/skills/agents-md-revise/SKILL.md",
  "adapters/codex/skills/feature-init/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md", "adapters/codex/skills/spec-revise/SKILL.md", "adapters/codex/skills/agents-md-revise/SKILL.md",
]) requireRegex(relative, /decision-completeness[- ]auditor/, "decision-completeness auditor reference");

requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Known-bad mutation smoke", "feature-done", "release blocker", "Runtime scheduling smoke", "sequential fresh dispatches", "Spec-quality authorization smoke", "Pure check request", "Explicit conditional request", "`BORDERLINE` result"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Delivery-shape smoke", "independently", "size and breadth signals alone never change the verdict"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["repository history or", "explicit current-user confirmation identifies as pre-3.11"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["outside the accepted Delivery Shape Baseline", "legacy-unambiguous impact boundary", "justified only by possible future use", "Q7c", "Q7d", "Requirements-reconciliation smoke", "MISMATCH: missing-from-artifact", "MISMATCH: unsupported-artifact", "MISMATCH: superseded-remnant", "MISMATCH: cross-artifact-conflict", "SOURCE GAP", "no second dispatch"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Implementation Scope Stop smoke", "ordinary private helper", "stops before adding more production code", "full lane is not blanket permission", "Minimal-evidence smoke", "duplicate unit, API, e2e", "role × visibility matrix", "file/test counts"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Implementation Continuation Check smoke", "resume after context compaction", "continues silently", "contradicts the accepted failure-state contract", "backend/frontend/test", "independently acceptable, enableable, and revertible"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["real dependency order inside each named", "internal coding order as a tier/file/test/time bucket", "frozen plan has no continuation sequence", "treats the sequence as N/A"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Guidance-placement smoke", "do not propose a nested file merely for symmetry", "one tier", "Q6 blocks", "malformed alias", "no implicit guidance", "must not create or move guidance", "mechanize"]);
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["Personalization conversation smoke", "asks no question", "one material question", "does not restate settled command evidence", "routes to `feature-init`", "one consolidated preview"]);
requireMarkers("docs/workflow.md", ["已观察 / 建议调整 / 待确认", "一次只问一个", "不复述已确认内容", "不能安全 deferred", "consolidated preview"]);
forbidMarkers("docs/examples/reviewer-mutation-smoke.md", ["Architecture-drift observation smoke"]);
forbidRegex("docs/spec-driven.md", /超过 4 个责任域|30 个预期任务|3 个 migration|2 个外部契约/, "numeric scope thresholds");
for (const relative of [
  "docs/actions/feature-init.md",
  "docs/actions/spec-quality-check.md",
  "docs/actions/spec-revise.md",
  "docs/reviewers/spec-quality-reviewer.md",
  "docs/spec-driven.md",
  "docs/examples/reviewer-mutation-smoke.md",
]) {
  forbidMarkers(relative, ["plan.md §1.2", "plan §1.2"]);
}
requireMarkers("tests/fixtures/reviewer-smoke/expected.json", ["known-bad", "clean"]);
requireMarkers("docs/actions/feature-archive.md", ["receipt-schema migration candidate", "without `Verdict:`", "never infer READY", "current-task READY", "ordinary filesystem rename", "move the directory back", "rerun `feature-done`"]);
requireMarkers("adapters/claude/skills/feature-archive/SKILL.md", ["migration candidates", "dirty-worktree READY", "immutable reviewed commit SHA", "does not re-anchor it", "present implementation and successor changes", "ordinary filesystem rename", "move the directory back", "feature-done"]);
requireMarkers("adapters/codex/skills/feature-archive/SKILL.md", ["migration candidates", "dirty-worktree READY", "immutable reviewed commit SHA", "does not re-anchor it", "present implementation and successor changes", "ordinary filesystem rename", "move the directory back", "$feature-done"]);
for (const relative of [
  "docs/actions/feature-done.md",
  "template/docs/specs/changes/_template/tasks-light.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) forbidMarkers(relative, ["conventions covered by direct checks"]);
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
