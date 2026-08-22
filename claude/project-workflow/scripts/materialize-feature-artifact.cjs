#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { destinationState } = require("./materialize-project-baseline.cjs");

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error("Usage: materialize-feature-artifact.cjs --target <root> --number <NNN> --slug <slug> --lane <full|light> [--shape <greenfield|brownfield>]");
    }
    values[key.slice(2)] = value;
  }
  return values;
}

function existingNumbers(changesRoot) {
  return [changesRoot, path.join(changesRoot, "archive")].flatMap((directory) => {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\d{3}-/.test(entry.name))
      .map((entry) => Number(entry.name.slice(0, 3)));
  });
}

function sourceMap(lane, shape) {
  if (lane === "light") {
    if (shape) throw new Error("Light lane must omit --shape");
    return [["tasks-light.md", "tasks.md"]];
  }
  if (lane !== "full" || !["greenfield", "brownfield"].includes(shape)) {
    throw new Error("Full lane requires --shape greenfield|brownfield; light lane must omit --shape");
  }
  return [
    [`spec-${shape}.md`, "spec.md"],
    ["plan.md", "plan.md"],
    ["tasks.md", "tasks.md"],
  ];
}

function materializeFeature({ target, number, slug, lane, shape }) {
  if (!target || !number || !slug || !lane) throw new Error("Missing required argument");
  if (!/^\d{3}$/.test(number)) throw new Error(`Invalid feature number: ${number}`);
  if (slug.length < 2 || slug.length > 40 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(slug)) {
    throw new Error(`Invalid feature slug: ${slug}`);
  }

  const requestedTarget = path.resolve(target);
  const requestedStat = fs.lstatSync(requestedTarget);
  if (!requestedStat.isDirectory() && !requestedStat.isSymbolicLink()) {
    throw new Error(`Target root must resolve to a directory: ${requestedTarget}`);
  }
  const targetRoot = fs.realpathSync(requestedTarget);
  if (!fs.statSync(targetRoot).isDirectory()) throw new Error(`Target root must resolve to a directory: ${requestedTarget}`);
  const agentsState = destinationState(targetRoot, "AGENTS.md");
  if (!agentsState.exists || !fs.statSync(agentsState.target).isFile()) throw new Error(`Target root missing AGENTS.md: ${targetRoot}`);
  const specsState = destinationState(targetRoot, "docs/specs");
  if (!specsState.exists || !fs.statSync(specsState.target).isDirectory()) throw new Error(`Target root missing docs/specs: ${targetRoot}`);

  const changesRelative = "docs/specs/changes";
  const changesState = destinationState(targetRoot, changesRelative);
  if (!changesState.exists) fs.mkdirSync(changesState.target);
  if (!fs.statSync(changesState.target).isDirectory()) throw new Error(`Changes path is not a directory: ${changesState.target}`);

  const used = existingNumbers(changesState.target);
  const maxUsed = used.length ? Math.max(...used) : 0;
  if (Number(number) <= maxUsed) {
    throw new Error(`Feature number ${number} is not greater than existing maximum ${String(maxUsed).padStart(3, "0")}; rerun feature-init to recompute the next number`);
  }

  const featureRelative = path.join(changesRelative, `${number}-${slug}`);
  const featureState = destinationState(targetRoot, featureRelative);
  if (featureState.exists) throw new Error(`Refusing to overwrite existing feature directory: ${featureState.target}`);

  const templateRoot = path.resolve(__dirname, "..", "template", "docs", "specs", "changes", "_template");
  const mappings = sourceMap(lane, shape);
  const copied = [];
  fs.mkdirSync(featureState.target); // Atomic no-clobber gate for the final path.
  try {
    for (const [sourceName, targetName] of mappings) {
      const source = path.join(templateRoot, sourceName);
      const destination = path.join(featureState.target, targetName);
      fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
      copied.push(targetName);
    }
  } catch (error) {
    for (const targetName of copied.reverse()) {
      try { fs.unlinkSync(path.join(featureState.target, targetName)); } catch {}
    }
    try { fs.rmdirSync(featureState.target); } catch {}
    throw error;
  }

  return { directory: featureState.target, files: copied.sort(), lane, shape: lane === "full" ? shape : null };
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(materializeFeature(parseArgs(process.argv.slice(2)))));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { materializeFeature };
