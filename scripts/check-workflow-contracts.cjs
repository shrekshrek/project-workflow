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
  requireMarkers(relative, ["agents-md-reviewer", "spec-reviewer", "## Proof Bundle", "After required L1 passes", "Reviewers are read-only", "reviewed Git identity"]);
}
requireMarkers("docs/actions/feature-done.md", ["Light-lane verification", "transient validation evidence", "receipt-only edits", "Resolved durable behavior with no existing area document is `update pending`", "area unresolved", "exact on-disk `## Proof Bundle`", "Persist only fields with a downstream consumer"]);
requireMarkers("docs/actions/feature-done.md", ["explicit Verification checks", "standard mechanical", "changed project scope", "repository-wide or release suites", "Do not treat every command listed"]);
requireMarkers("docs/actions/feature-done.md", ["reuse a passing check", "relevant inputs", "changed-scope classification", "provably unchanged", "uncertainty requires a rerun", "failed or affected checks", "dependency closure", "full changed-scope L1 population", "workspace or build cache sequentially", "same-task reuse", "must not be presented as newly executed", "Before the first full L2/L3 dispatch", "non-receipt spec/plan/tasks edits", "never repairs implementation or non-receipt artifacts"]);
for (const relative of ["template/docs/specs/changes/_template/tasks.md", "template/docs/specs/changes/_template/tasks-light.md", "docs/examples/full-feature-artifact.md"]) {
  requireMarkers(relative, ["mode=run|same-task reuse", "reused evidence reference"]);
}
requireMarkers("docs/examples/reviewer-mutation-smoke.md", ["## L1 reuse smoke", "same-task reuse", "original evidence reference", "workspace or build cache run sequentially", "relevant-input boundary uncertain"]);
forbidMarkers("docs/actions/feature-done.md", ["reproducible diff identity", "content fingerprint"]);
requireMarkers("docs/actions/feature-done.md", ["independently executable required L1 checks", "do not dispatch new reviewers", "still-valid same-task reviewer results", "not-run(L1 prerequisite)", "current-truth check", "receipt", "After L1 passes, missing execution evidence", "../reviewers/README.md#reviewer-execution-contract"]);
requireMarkers("docs/actions/feature-done.md", ["exact changed-file/applicable-item validation", "never infer coverage from `findings=none`", "A PASS never persists applicable IDs or populations", "manual file populations", "population hashes", "dependency closure"]);
requireMarkers("docs/actions/feature-done.md", ["same-task optimization", "original full-population evidence", "A later task", "base commit SHA", "before writing those endpoint-owned outputs", "reviewed=<commit SHA>; dirty=no", "reviewed=worktree; dirty=yes", "Other pairings are invalid", "target-branch merge base", "ambiguous base blocks", "Derive changed paths from Git", "For light lane, run it only when", "declared receipt/status write is the only permitted endpoint-output difference"]);
forbidMarkers("docs/actions/feature-done.md", ["cached L2/L3 results"]);
requireMarkers("docs/actions/feature-done.md", ["L2 convention-source paths", "L3 spec/artifact paths", "each reviewer independently enumerates", "dispatch L2 and L3 in parallel", "sequential fresh dispatch", "not a fallback condition", "aggregates only after both applicable results"]);
requireMarkers("docs/actions/feature-archive.md", ["receipt-schema migration candidate", "review-scope", "eligible only as a current-task result", "does not re-anchor it", "not proof that the reviewed worktree was unchanged", "delivery evidence and current truth as separate freshness questions", "later movement of the current branch or PR head does not by itself invalidate", "validate every pending current-truth fact against present implementation evidence"]);

requireMarkers("docs/actions/spec-quality-check.md", ["Reviewer Execution", "../reviewers/README.md#reviewer-execution-contract", "fallback reason", "`BLOCKED`", "mechanical prerequisites failed", "stop before subjective review", "explicitly authorizes implementation", "`READY` consumes that authorization", "pure check/review request remains read-only", "`BORDERLINE` never consumes", "Q7a", "Q7b", "Size alone never changes the verdict", "do not ask twice"]);
for (const relative of ["adapters/claude/skills/spec-quality-check/SKILL.md", "adapters/codex/skills/spec-quality-check/SKILL.md"]) {
  requireMarkers(relative, ["On `READY`", "continue implementation", "Pure checks remain read-only", "`BORDERLINE` requires explicit acceptance", "any status transition"]);
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
requireMarkers("docs/reviewers/README.md", ["Reviewer execution contract", "dispatch capability", "fresh subagent invocation", "never an agent instance", "fresh-subagent", "result-reuse", "observed reason", "host security approvals still apply", "fail closed", "dependency closure", "same task", "original full-population evidence"]);
requireRegex("docs/reviewers/README.md", /Codex plugin skills[\s\S]{0,160}must use[\s\S]{0,160}subagent/i, "mandatory Codex reviewer index wording");
for (const action of ["feature-init", "project-personalize", "spec-revise", "agents-md-revise"]) {
  requireMarkers(`docs/actions/${action}.md`, ["## Reviewer Execution", "../reviewers/README.md", "`Reviewer execution`", "blocking"]);
}

for (const relative of ["docs/reviewers/agents-md-reviewer.md", "docs/reviewers/spec-reviewer.md"]) {
  requireMarkers(relative, ["exact changed", "applicable but unverified", "UNRELIABLE"]);
  forbidMarkers(relative, ["coverage is 100%", "coverage is at least 95%", "coverage >= 95%", "confidence", "skipped-critical"]);
}
requireMarkers("docs/reviewers/agents-md-reviewer.md", ["definite non-matches", "applicable population"]);
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
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["Q3", "Q4", "Q5", "Q7a", "Q7b", "delivery-shape feasibility", "reviewed items", "blocking ambiguity"]);
requireMarkers("docs/actions/spec-quality-check.md", ["1. The spec/plan minimum set", "3. Verification contains the smallest non-redundant proof obligations", "4. Outcomes describe", "5. Constraints are concrete"]);
requireMarkers("docs/reviewers/decision-completeness-auditor.md", ["Decision Matrix", "Must-fix", "Warnings", "Cross-file Consistency", "Completeness"]);

for (const relative of [
  "template/docs/specs/changes/_template/tasks.md",
  "template/docs/specs/changes/_template/tasks-light.md",
  "docs/examples/full-feature-artifact.md",
  "tests/fixtures/reviewer-smoke/base/docs/specs/changes/001-normalize-key/tasks.md",
  "tests/fixtures/reviewer-smoke/light-base/docs/specs/changes/002-normalize-key-light/tasks.md",
]) {
  requireRegex(relative, /^- Verdict:/m, "receipt Verdict field");
  requireRegex(relative, /^- Change:.*git=\[base=<commit SHA>; reviewed=<commit SHA>; dirty=no\].*git=\[base=<commit SHA>; reviewed=worktree; dirty=yes\].*endpoint-outputs=/m, "valid stable/dirty Git review identities and endpoint outputs");
  requireRegex(relative, /^- Checks/m, "receipt Checks field");
  requireRegex(relative, /^- Review execution:/m, "reviewer execution evidence field");
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
}
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["不记录逐轮命令输出", "已被后续结果取代", "最终 checks 只进"]);
requireMarkers("template/docs/specs/changes/_template/tasks.md", ["证据义务 → 最小 command / assertion"]);
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
requireMarkers("docs/actions/feature-init.md", ["proof obligations", "do not derive generic edge, error, status-code, or unspecified-input cases", "one command or assertion may satisfy several related obligations", "interacting dimensions can change the result", "Do not create a test-layer, endpoint, status-code, or happy/boundary/error matrix for symmetry"]);
requireMarkers("docs/actions/spec-quality-check.md", ["smallest non-redundant proof obligations", "Generic derived edge/error cases and unspecified inputs are removed", "One evidence source may cover several related obligations", "compact passing range", "More test layers, cases, or matrix cells never improve the verdict"]);
requireMarkers("docs/reviewers/spec-quality-reviewer.md", ["One command may prove several related obligations", "Do not require time estimates or split one task per test case", "nonblocking simplification advisories"]);
requireMarkers("docs/actions/project-personalize.md", ["A command being available does not make it mandatory for every feature", "Do not introduce a missing test layer, matrix, coverage gate, or release suite for completeness", "does not manufacture layer or matrix symmetry"]);
for (const relative of ["template/docs/specs/changes/_template/tasks.md", "template/docs/specs/changes/_template/tasks-light.md"]) {
  requireMarkers(relative, ["不要按预计时长或测试 case 机械拆分"]);
  forbidMarkers(relative, ["30min-2h", "30 分钟 - 2 小时"]);
}
requireMarkers("docs/actions/feature-done.md", ["merely for symmetry", "each layer proves a distinct risk"]);
requireMarkers("docs/actions/feature-init.md", ["scope-viability check", "Never report a nonblocking Scope Viability result", "clarification-required", "split-required", "bundled-risk-accepted", "pending-selection", "pending-handoff", "size alone never requires a split", "durable decomposition handoff", "untracked out-of-scope outcomes", "Do not create a repository backlog", "separate external write that requires the user's explicit authorization", "Recheck it at `spec-quality-check`"]);
forbidMarkers("docs/actions/feature-init.md", ["Scope Viability: single", "Scope Viability: N/A"]);
requireRegex("docs/actions/feature-init.md", /Decide whether a new artifact[\s\S]{0,500}Run the scope-viability check/, "no-artifact decision before scope viability");
requireMarkers("tests/fixtures/feature-init-scenarios/expected.json", [
  "no-artifact-accepted-spec-implementation",
  "no-artifact-multifile-refactor",
  "light-existing-contract-ui-handoff",
  "full-docs-only-cross-module-contract",
  "scope-viability-ask",
  "split-handoff-ask",
  "light-split-with-explicit-untracked-deferred",
  "light-split-with-durable-handoff",
]);
requireMarkers("docs/examples/feature-init-scenario-matrix.md", ["Nineteen scenarios", "smallest model-smoke set", "Run the full matrix only when", "Run this only when skill discovery or lane routing changed"]);
requireMarkers("docs/actions/feature-init.md", ["when the project uses such an optional declaration"]);
requireMarkers("docs/actions/feature-init.md", ["not declared in current truth", "cross-session or multi-person handoff", "Do not create `tasks.md` merely because code is user-visible"]);
requireMarkers("docs/actions/feature-init.md", ["normalizes an existing target-root symlink", "rejects symlinked destinations beneath the resolved root"]);
requireMarkers("docs/actions/feature-done.md", ["Projects without this optional declaration", "do not need an empty path list"]);
for (const relative of ["docs/actions/feature-init.md", "adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["materialize-feature-artifact.cjs", "no-clobber"]);
}
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, ["scope-viability, deferred-outcome, and progressive-read boundaries", "docs/architecture-design.md", "ordinary features skip it", "unconfirmed high-impact architecture", "ordinary full-lane work with directly traceable values is `N/A`"]);
}
requireMarkers("docs/actions/README.md", ["active runtime adapter", "CLAUDE_PLUGIN_ROOT", ".codex-plugin/plugin.json", "Do not scan another host's cache", "required asset"]);
forbidMarkers("docs/actions/README.md", ["~/.claude/plugins/cache", "~/.codex/plugins/cache", "most recently installed compatible package"]);
requireMarkers("adapters/claude/skills/feature-init/SKILL.md", ["`CLAUDE_PLUGIN_ROOT` is required", "scripts/materialize-feature-artifact.cjs"]);
requireRegex("adapters/claude/skills/feature-init/SKILL.md", /occupied directory.*leave it untouched.*rerun feature-init/i, "occupied-directory no-clobber rerun semantics");
requireMarkers("adapters/claude/skills/project-init/SKILL.md", ["scripts/materialize-project-baseline.cjs", "six target-mapped files", "Do not ask stack questions"]);
requireMarkers("docs/actions/project-init.md", ["baseline-compatible target", "complete target population including dotfiles", "all absent, all matching, or partial/custom/occupied", "only incidental material", "one focused routing question", "stop before staging", "application structure may still be undecided", "inside the first feature", "govern several later features"]);
requireMarkers("docs/actions/project-personalize.md", ["complete, partial, unrelated, or missing project-workflow baseline", "excluding version-control metadata from content classification", "A target with project evidence but no `AGENTS.md` remains a `project-personalize` case", "partial/custom/occupied baseline destination", "one focused routing question", "not an architecture-quality verdict"]);
requireMarkers("docs/actions/project-personalize.md", ["_multi_tier_examples", "Do not claim that an architecture is suitable", "ordinary full lane", "Architecture-design conversational fill is out of scope", "do not load the architecture guide"]);
requireMarkers("docs/actions/feature-init.md", ["no reserved `project-foundation` action, lane, or slug", "Keep minimal structure inside the first feature", "do not create a new artifact schema", "Multiple components alone do not establish multiple tiers", "Single-tier or tier-undecided work skips tier files and examples"]);
requireMarkers("docs/architecture-design.md", ["not a workflow action, lane, gate, reviewer, artifact type, or reserved slug", "Ordinary features skip this guide", "smallest sufficient", "Do not infer call direction or sync/async relationships", "Multiple named components do not prove separate tiers or paths", "Do not load tier examples or choose a Sibling Alignment result", "create no additional architecture document or schema", "continue the question → user decision → artifact update loop across user turns", "when ownership changes design or operation", "do not recommend `spec-quality-check`"]);
requireMarkers("docs/actions/project-personalize-reference.md", ["## Evidence order", "Never use an example below as a default", "## Legacy default cleanup", "## Optional high-impact path declarations", "not part of the generated baseline or default personalization flow"]);
forbidMarkers("docs/actions/project-personalize-reference.md", ["默认 80", "default 80", "固定 GitHub", "默认 conventional", "default Playwright"]);
requireMarkers("adapters/claude/skills/project-personalize/SKILL.md", ["partial/missing baseline", "materialize-project-baseline.cjs"]);
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /missing baseline does not copy host-private rules, hooks, or tier examples/i, "missing-baseline host-private exclusion semantics");
requireRegex("adapters/claude/skills/project-personalize/SKILL.md", /`codebase-explorer` applies only[\s\S]{0,180}`tech-researcher` applies only/i, "role-applicability prose");
requireMarkers("adapters/codex/skills/project-personalize/SKILL.md", ["Include dotfiles", "all six matching plus only incidental material is N/A", "materialize-project-baseline.cjs", "Do not copy host-private rules/hooks/tier examples by default"]);
for (const relative of ["adapters/claude/skills/project-personalize/SKILL.md", "adapters/codex/skills/project-personalize/SKILL.md"]) {
  requireMarkers(relative, ["excluding version-control metadata from content classification"]);
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
  "no-artifact/direct work",
  "light tracked change",
  "full spec/plan/tasks",
  "exclude `docs/specs/changes/archive/` unless tracing history",
]);
for (const relative of ["adapters/claude/skills/feature-init/SKILL.md", "adapters/codex/skills/feature-init/SKILL.md"]) {
  requireMarkers(relative, [
    "may need tracked acceptance",
    "Do not invoke for local reversible work with no durable artifact consumer",
    "direct/no-artifact, light tasks-only, or full spec/plan/tasks",
    "on the normal path do not mention that check, its field name, or its omission",
    "Light lane proceeds directly to implementation and skips `spec-quality-check`",
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
requireMarkers("docs/actions/spec-revise.md", ["rerun the `feature-init` scope-viability check", "child feature", "bundled-delivery risk", "scope viability changed", "stable issue/PM reference", "External tracker edits do not revise this feature implicitly"]);
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
