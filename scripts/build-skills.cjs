#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const actions = [
  "agents-md-revise",
  "feature-archive",
  "feature-done",
  "feature-init",
  "project-init",
  "project-personalize",
  "spec-quality-check",
  "spec-reconcile",
  "spec-revise"
];
const resources = [
  "docs/actions",
  "docs/reviewers",
  "docs/architecture-design.md",
  "docs/spec-driven.md",
  "docs/examples/feature-record.md",
  "template",
  "scripts/relocate-markdown-links.cjs",
  "scripts/materialize-project-baseline.cjs",
  "scripts/materialize-feature-artifact.cjs"
];

function build(output) {
  fs.mkdirSync(output, { recursive: true });
  if (fs.readdirSync(output).length) throw new Error("Output directory must be empty");
  const entries = fs.readdirSync(path.join(root, "entries")).sort();
  if (entries.join() !== actions.map(name => name + ".md").join()) {
    throw new Error("The skill entry set differs from the public action set");
  }
  const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error("Invalid VERSION");

  // Package only version-controlled runtime assets, including the baseline .gitignore.
  const files = execFileSync("git", ["ls-files", "-z", "--", ...resources], { cwd: root, encoding: "utf8" })
    .split("\0").filter(Boolean);
  for (const resource of resources) {
    if (!files.some(file => file === resource || file.startsWith(resource + "/"))) {
      throw new Error("Missing runtime asset: " + resource);
    }
  }
  for (const name of actions) {
    const skill = path.join(output, "skills", name);
    const source = fs.readFileSync(path.join(root, "entries", name + ".md"), "utf8");
    if (!source.startsWith("---\nname: " + name + "\ndescription: ") || !source.includes("../docs/actions/" + name + ".md")) {
      throw new Error("Invalid skill entry: " + name);
    }
    const entry = source.replace("\n---\n", '\nmetadata:\n  version: "' + version + '"\n---\n')
      .replaceAll("../docs/", "resources/docs/").replaceAll("../template/", "resources/template/");
    fs.mkdirSync(skill, { recursive: true });
    fs.writeFileSync(path.join(skill, "SKILL.md"), entry);
    fs.copyFileSync(path.join(root, "LICENSE"), path.join(skill, "LICENSE"));
    for (const file of files) {
      const target = path.join(skill, "resources", file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(root, file), target);
    }
    for (const link of entry.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      if (!fs.existsSync(path.join(skill, link[1]))) throw new Error(name + ": missing " + link[1]);
    }
  }
  const docs = path.join(output, "skills", actions[0], "resources", "docs");
  execFileSync(process.execPath, [path.join(root, "scripts/check-markdown-links.cjs"), docs], { stdio: "inherit" });
  console.log("Built " + actions.length + " self-contained skills, version " + version);
}

const args = process.argv.slice(2);
if (args.length === 2 && args[0] === "--out") {
  build(path.resolve(args[1]));
} else if (args.length === 1 && args[0] === "--check") {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "skills-check-"));
  try {
    build(temp);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
} else {
  throw new Error("Usage: node scripts/build-skills.cjs --check | --out <empty-directory>");
}
