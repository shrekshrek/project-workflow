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
  for (const marker of ["## 1. 模块影响范围", "## 5. 实施顺序"]) {
    if (!plan.includes(marker)) problems.push(`${label}: plan missing ${marker}`);
  }
  const prior = section(plan, "## 3. Prior decisions");
  const containsDecision = /(?:决策|决定|Decision)\s*[:：]/i.test(prior);
  const hasWhy = /(?:为什么|理由|Why)\s*[:：]\s*\S/i.test(prior);
  const hasSource = /(?:来源|Source)\s*[:：]\s*\S/i.test(prior);
  if (containsDecision && (!hasWhy || !hasSource)) {
    problems.push(`${label}: Prior decisions entry lacks why/source semantics`);
  }
  if (prior.includes("{{TODO")) problems.push(`${label}: Prior decisions contains unresolved TODO`);

  const implementationOrder = section(plan, "## 5. 实施顺序");
  if (!/^\d+\.\s+\S/m.test(implementationOrder) || implementationOrder.includes("{{TODO")) {
    problems.push(`${label}: implementation order is empty or unresolved`);
  }
  const taskContract = tasks.split("## Proof Bundle")[0];
  if (!/^- \[[ x]\]\s+\S/m.test(taskContract)) problems.push(`${label}: tasks lack actionable checklist items`);
  if (taskContract.includes("{{TODO")) problems.push(`${label}: tasks contain unresolved TODO`);
  if (options.requireComplete && /^- \[ \]/m.test(taskContract)) {
    problems.push(`${label}: completion fixture contains unfinished tasks`);
  }
  for (const field of ["Verdict:", "Change:", "Checks:", "Reviews:", "Current truth:"]) {
    if (!tasks.includes(`- ${field}`)) problems.push(`${label}: Proof Bundle missing ${field}`);
  }

  return problems;
}

module.exports = { validateFullFixtureAgainstCurrentPreflight };
