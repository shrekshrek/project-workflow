#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { referencedDestinations } = require("./lib/markdown-destinations.cjs");

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
const resourceOwner = "project-init";
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

function localReferences(file, content) {
  const targets = referencedDestinations(content);
  return targets.map(target => target.replace(/^<|>$/g, ""))
    .filter(target => !/^(?:[a-z]+:|#|\/)/i.test(target))
    .map(target => path.posix.join(path.posix.dirname(file), target));
}

function renderEntry(name, version) {
  const file = `docs/actions/${name}.md`;
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const metadata = source.match(/^---\nname: ([\w-]+)\ndescription: ("[^\n]+")\n---\n/);
  if (!metadata || metadata[1] !== name) throw new Error("Invalid skill metadata: " + file);

  const resourcePath = path.posix.relative(name, resourceOwner + "/resources");
  const shared = "docs/actions/README.md#shared-runtime-conventions";
  const refs = new Set(localReferences(file, source));
  const reviewers = new Set([...refs].map(ref => ref.split("#")[0])
    .filter(ref => ref.startsWith("docs/reviewers/") && !ref.endsWith("/README.md")));
  if (reviewers.size) refs.add("docs/reviewers/README.md#reviewer-execution-contract");
  for (const reviewer of reviewers) {
    for (const target of localReferences(reviewer, fs.readFileSync(path.join(root, reviewer), "utf8"))) {
      if (target.includes("#") && target.split("#")[0] !== reviewer) refs.add(target);
    }
  }
  refs.delete(file);
  refs.delete(shared);
  const lines = [
    "---", "name: " + name, "description: " + metadata[2], "metadata:", `  version: "${version}"`, "---",
    "", "# " + name, "",
    `Match the user's language and preserve file language. Read [the action](${resourcePath}/${file}) completely and follow [the shared conventions](${resourcePath}/${shared}).`,
  ];
  if (refs.size) {
    lines.push("", "Use these references when the action or assigned reviewer calls for them:", "");
    for (const ref of refs) lines.push(`- [${ref}](${resourcePath}/${ref})`);
  }
  return lines.join("\n") + "\n";
}

function build(output) {
  fs.mkdirSync(output, { recursive: true });
  if (fs.readdirSync(output).length) throw new Error("Output directory must be empty");
  const actionDir = path.join(root, "docs/actions");
  const declared = fs.readdirSync(actionDir).filter(file => file.endsWith(".md") &&
    fs.readFileSync(path.join(actionDir, file), "utf8").startsWith("---\n")).sort();
  if (declared.join() !== actions.map(name => name + ".md").join()) {
    throw new Error("Action metadata differs from the public skill set");
  }
  const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error("Invalid VERSION");

  // Package only version-controlled runtime assets, including the baseline .gitignore.
  const files = execFileSync("git", ["ls-files", "-z", "--", ...resources, ":(exclude)template/.claude/rules/_examples/**"], { cwd: root, encoding: "utf8" })
    .split("\0").filter(Boolean);
  for (const resource of resources) {
    if (!files.some(file => file === resource || file.startsWith(resource + "/"))) {
      throw new Error("Missing runtime asset: " + resource);
    }
  }
  const ownerDir = path.join(output, "skills", resourceOwner);
  const resourceDir = path.join(ownerDir, "resources");
  fs.mkdirSync(ownerDir, { recursive: true });
  fs.copyFileSync(path.join(root, "LICENSE"), path.join(ownerDir, "LICENSE"));
  for (const file of files) {
    const target = path.join(resourceDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }
  for (const name of actions) {
    const skill = path.join(output, "skills", name);
    const entry = renderEntry(name, version);
    fs.mkdirSync(skill, { recursive: true });
    fs.writeFileSync(path.join(skill, "SKILL.md"), entry);
    for (const link of entry.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      if (!fs.existsSync(path.join(skill, link[1]))) throw new Error(name + ": missing " + link[1]);
    }
  }
  const docs = path.join(resourceDir, "docs");
  execFileSync(process.execPath, [path.join(root, "scripts/check-markdown-links.cjs"), docs], { stdio: "inherit" });
  execFileSync(process.execPath, [path.join(root, "scripts/check-skill-contracts.cjs"), path.join(output, "skills")], { stdio: "inherit" });
  console.log("Built " + actions.length + " skills with shared resources, version " + version);
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
