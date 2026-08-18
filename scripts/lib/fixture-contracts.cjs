const fs = require("node:fs");
const path = require("node:path");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function section(content, heading, nextHeading = /^## /m) {
  const start = content.indexOf(heading);
  if (start === -1) return "";
  const rest = content.slice(start + heading.length);
  const next = rest.search(nextHeading);
  return next === -1 ? rest : rest.slice(0, next);
}

function validateFullFixtureAgainstCurrentPreflight(featureDir, options = {}) {
  const label = options.label || path.basename(featureDir);
  const problems = [];
  const files = Object.fromEntries(["spec.md", "plan.md", "tasks.md"].map((name) => {
    const file = path.join(featureDir, name);
    if (!fs.existsSync(file)) problems.push(`${label}: missing ${name}`);
    return [name, fs.existsSync(file) ? read(file) : ""];
  }));
  if (problems.length) return problems;

  const spec = files["spec.md"];
  const plan = files["plan.md"];
  const tasks = files["tasks.md"];

  if (!/状态:.*(?:已确认|已实现)/.test(spec)) problems.push(`${label}: full spec is not accepted/delivered`);
  for (const heading of ["## 1. Outcomes", "## 2.", "## 3. Constraints", "## 4. Verification"]) {
    if (!spec.includes(heading)) problems.push(`${label}: spec missing ${heading}`);
  }
  if (!/(?:\*\*做\*\*|^- Do:)/m.test(spec) || !/(?:\*\*不做\*\*|^- Do not:)/m.test(spec)) {
    problems.push(`${label}: spec scope lacks explicit include/exclude lists`);
  }
  const verification = section(spec, "## 4. Verification");
  if (!/^-\s+\S/m.test(verification) || verification.includes("{{TODO")) {
    problems.push(`${label}: spec Verification is empty or unresolved`);
  }
  const primaryFlowCount = (verification.match(/Primary flow/g) || []).length;
  if (options.userVisible === true && primaryFlowCount !== 1) {
    problems.push(`${label}: user-visible spec needs exactly one Primary flow`);
  }
  if (options.userVisible === false && primaryFlowCount !== 0) {
    problems.push(`${label}: non-user-visible spec must not declare Primary flow`);
  }

  for (const marker of ["## 1. 模块影响范围", "### 1.2 Delivery Shape Baseline", "## 3. Prior decisions", "## 5. 实施顺序"]) {
    if (!plan.includes(marker)) problems.push(`${label}: plan missing ${marker}`);
  }
  for (const field of [
    "当前 outcome / consumer:",
    "Delivery risk signal:",
    "预期责任区域:",
    "Contract / data / authorization / migration / release signals:",
    "明确排除:",
    "Scope growth triggers:",
  ]) {
    const line = plan.split(/\r?\n/).find((candidate) => candidate.includes(field));
    if (!line || line.includes("{{TODO") || !line.slice(line.indexOf(field) + field.length).trim()) {
      problems.push(`${label}: Delivery Shape Baseline missing value for ${field}`);
    }
  }
  const prior = section(plan, "## 3. Prior decisions");
  const hasSemanticHeader = /\|\s*(?:决策|Decision)\s*\|\s*(?:为什么|Why)\s*\|\s*(?:来源|Source)\s*\|/i.test(prior);
  const hasExplicitNA = prior.includes("N/A(no durable why/source decision)");
  if (!hasSemanticHeader && !hasExplicitNA) {
    problems.push(`${label}: Prior decisions lacks decision/why/source semantic columns or explicit N/A`);
  }
  if (prior.includes("{{TODO")) problems.push(`${label}: Prior decisions contains unresolved TODO`);

  const planSlices = [...plan.matchAll(/^\d+\.\s+`(S\d+)`/gm)].map((match) => match[1]);
  const taskSlices = [...tasks.matchAll(/^###\s+`(S\d+)`/gm)].map((match) => match[1]);
  if (!planSlices.length || JSON.stringify(planSlices) !== JSON.stringify(taskSlices)) {
    problems.push(`${label}: plan/tasks slice IDs are missing or mismatched`);
  }
  const taskContract = tasks.split("## Proof Bundle")[0];
  if (!/Focused L1:/.test(taskContract)) problems.push(`${label}: tasks lack focused L1 evidence`);
  if (taskContract.includes("{{TODO")) problems.push(`${label}: tasks contain unresolved TODO`);
  if (options.requireComplete && /^- \[ \]/m.test(taskContract)) {
    problems.push(`${label}: completion fixture contains unfinished tasks`);
  }
  for (const field of ["Verdict:", "Change:", "Checks:", "Review execution:", "L2:", "L3:", "Current truth:"]) {
    if (!tasks.includes(`- ${field}`)) problems.push(`${label}: Proof Bundle missing ${field}`);
  }

  return problems;
}

module.exports = { validateFullFixtureAgainstCurrentPreflight };
