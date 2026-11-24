#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { referencedDestinations } = require("./lib/markdown-destinations.cjs");

const root = path.resolve(__dirname, "..");
const skillRoot = process.argv[2];
if (!skillRoot) {
  require("node:child_process").execFileSync(process.execPath, [path.join(root, "scripts/build-skills.cjs"), "--check"], { stdio: "inherit" });
  process.exit(0);
}
const rolesByAction = {
  "agents-md-revise": ["decision-completeness-auditor"],
  "feature-done": ["agents-md-reviewer", "spec-reviewer"],
  "feature-init": ["decision-completeness-auditor"],
  "project-personalize": ["codebase-explorer", "decision-completeness-auditor", "tech-researcher"],
  "spec-quality-check": ["spec-quality-reviewer"],
  "spec-revise": ["decision-completeness-auditor"],
};
const sectionsByAction = {
  "agents-md-revise": ["Workflow", "Invariants", "Validation"],
  "feature-archive": ["Workflow", "Invariants", "Validation"],
  "feature-done": ["Review Layers", "Delivery Receipt", "Verdict", "Invariants"],
  "feature-init": ["Conversation and discovery", "Record and authorization", "Document updates and context", "Implementation Scope Stop", "Verification", "Outputs and validation"],
  "project-init": ["Workflow", "Invariants"],
  "project-personalize": ["Workflow", "Invariants", "Validation"],
  "spec-quality-check": ["Requirements Reconciliation", "Checks", "Reviewer Execution", "Verdict", "Invariants"],
  "spec-reconcile": ["Workflow", "Verdict", "Invariants"],
  "spec-revise": ["Workflow", "Invariants", "Validation"],
};
const problems = [];
const owners = fs.readdirSync(skillRoot).filter(name => fs.existsSync(path.join(skillRoot, name, "resources")));
if (owners.length !== 1 || owners[0] !== "project-init") problems.push("Expected one shared resource directory in project-init");
const rules = fs.readdirSync(path.join(skillRoot, "project-init/resources/template/.claude/rules")).sort();
if (rules.join(",") !== "code-style.md,security.md,testing.md") {
  problems.push("Expected only the three optional Claude rule templates in the package");
}
const read = file => fs.readFileSync(path.join(root, file), "utf8");

// Keep section fragments when normalizing links to the repo root. Runtime entries point
// directly to the applicable sections so the agent need not recursively read linked actions.
function links(file, content) {
  const refs = referencedDestinations(content).map(ref => ref.replace(/^<|>$/g, ""));
  return new Set(refs.filter(ref => !/^[a-z]+:|^#/i.test(ref))
    .map(ref => path.posix.join(path.posix.dirname(file), ref)));
}

const reachable = new Set(Object.values(rolesByAction).flat());
for (const roleFile of fs.readdirSync(path.join(root, "docs/reviewers"))) {
  if (roleFile.endsWith(".md") && roleFile !== "README.md" && !reachable.has(path.basename(roleFile, ".md"))) {
    problems.push(`docs/reviewers/${roleFile}: no action routes to this reviewer`);
  }
}
for (const [name, sections] of Object.entries(sectionsByAction)) {
  const file = `${name}/SKILL.md`;
  const content = fs.readFileSync(path.join(skillRoot, file), "utf8");
  const direct = new Set([...links(file, content)].map(ref => path.posix.relative("project-init/resources", ref)));
  const canonical = `docs/actions/${name}.md`;
  const roles = (rolesByAction[name] || []).map(role => `docs/reviewers/${role}.md`);
  const docs = [canonical, ...roles];
  const required = [canonical, "docs/actions/README.md#shared-runtime-conventions"];
  if (roles.length) required.push("docs/reviewers/README.md#reviewer-execution-contract");
  for (const role of roles) {
    if (![...direct].some(ref => ref.split("#")[0] === role)) problems.push(`${file}: missing role ${role}`);
  }
  for (const owner of docs) {
    for (const target of links(owner, read(owner))) {
      const [doc, fragment] = target.split("#");
      if (!fragment || !doc.endsWith(".md") || doc === owner) continue;
      if (roles.includes(doc) && direct.has(doc)) continue;
      required.push(target);
    }
  }
  for (const target of new Set(required)) {
    if (!direct.has(target)) problems.push(`${file}: missing direct reference to ${target}`);
  }
  for (const section of sections) {
    if (!read(canonical).includes("\n## " + section)) problems.push(`${canonical}: missing ${section}`);
  }
  if (["feature-archive", "spec-reconcile"].includes(name) && !content.includes("scripts/relocate-markdown-links.cjs")) {
    problems.push(`${file}: missing archive link relocator`);
  }
  if (!/Read \[the action\]\([^)]+\) completely/.test(content)) problems.push(`${file}: missing full-action instruction`);
  if (name === "feature-done" && /bounded repair|repair-delta reconciliation/i.test(content)) {
    problems.push(`${file}: duplicates the canonical repair rules`);
  }
  if (!content.includes("Match the user's language") || content.trimEnd().split("\n").length >= 200) {
    problems.push(`${file}: check entry length and user-language instruction`);
  }
  if (/^## (Workflow|Verdict|Failure modes|Record and authorization|Delivery Receipt|Mechanical check table)/m.test(content)) {
    problems.push(`${file}: put the action contract in ${canonical}`);
  }
  if (/CLAUDE_PLUGIN_ROOT|\.codex-plugin\/plugin\.json|\/project-workflow:/.test(content)) {
    problems.push(`${file}: requires legacy plugin discovery or invocation`);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Workflow action, reviewer and direct section contracts OK.");
}
