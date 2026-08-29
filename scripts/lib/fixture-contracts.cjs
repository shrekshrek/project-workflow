// Fixture sanity only. This is not a semantic readiness gate for user documents.
const fs = require("node:fs");
const path = require("node:path");

function validateAcceptedFixture(featureDir, options = {}) {
  const label = options.label || path.basename(featureDir);
  const problems = [];
  const read = (name) => {
    const file = path.join(featureDir, name);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  };
  const spec = read("spec.md");
  if (!spec.trim()) return [`${label}: missing accepted spec fixture`];
  if (!/状态\s*[:：].*(?:已确认|已实现)/.test(spec)) problems.push(`${label}: fixture is not accepted/delivered`);
  const plan = read("plan.md");
  const tasks = read("tasks.md");
  const content = [spec, plan, tasks].join("\n");
  const withoutReceipts = content.replace(/^## (?:Previous )?Proof Bundle[^\n]*\n[\s\S]*?(?=^## |$(?![\s\S]))/gm, "");
  if (/\{\{TODO/.test(withoutReceipts)) problems.push(`${label}: fixture has unresolved TODO`);
  if (options.requireComplete && /^- \[ \]/m.test(withoutReceipts)) {
    problems.push(`${label}: completion fixture contains unfinished tasks`);
  }
  // Check source-bearing decisions only when fixtures actually contain such an entry.
  for (const entry of content.split("\n").filter((line) => /(?:决定|决策|Decision)\s*[:：]/i.test(line))) {
    if (!/(?:为什么|理由|Why)\s*[:：]\s*\S/i.test(entry) || !/(?:来源|Source)\s*[:：]\s*\S/i.test(entry)) {
      problems.push(`${label}: decision entry lacks why/source semantics`);
    }
  }
  if ((content.match(/^## Proof Bundle\s*$/gm) || []).length > 1) {
    problems.push(`${label}: competing canonical receipts`);
  }
  return problems;
}

module.exports = { validateAcceptedFixture };
