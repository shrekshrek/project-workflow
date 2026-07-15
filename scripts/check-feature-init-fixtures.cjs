#!/usr/bin/env node

// Deterministic side of the feature-init behavior scenario matrix
// (docs/examples/feature-init-scenario-matrix.md).
//
//   node scripts/check-feature-init-fixtures.cjs
//     Validate fixture bases and expected.json coherence (CI-safe, no model).
//
//   node scripts/check-feature-init-fixtures.cjs --grade <scenario> <run-dir>
//     Mechanically grade one executed run: <run-dir> is a materialized base
//     directory after a runtime adapter executed the scenario prompt.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const fixtureRoot = path.join(root, "tests/fixtures/feature-init-scenarios");
const expected = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "expected.json"), "utf8"));
const problems = [];
const materializer = path.join(root, "scripts/materialize-feature-artifact.cjs");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function snapshotTree(rootDir) {
  const snapshot = [];
  function walk(directory, relative = "") {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === ".git") continue;
      const rel = path.join(relative, entry.name);
      const fullPath = path.join(directory, entry.name);
      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        snapshot.push(["symlink", rel, fs.readlinkSync(fullPath)]);
      } else if (stat.isDirectory()) {
        snapshot.push(["directory", rel]);
        walk(fullPath, rel);
      } else if (stat.isFile()) {
        snapshot.push(["file", rel, fs.readFileSync(fullPath).toString("base64")]);
      }
    }
  }
  walk(rootDir);
  return snapshot;
}

function listChangeDirs(runDir) {
  const changes = path.join(runDir, "docs/specs/changes");
  if (!fs.existsSync(changes)) return [];
  return fs.readdirSync(changes, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{3}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function gradeScenario(name, config, runDir) {
  if (config.interactionOnly) {
    problems.push(`${name}: interaction-only scenario is graded from the transcript, not by this script`);
    return;
  }
  const baseDirs = listChangeDirs(path.join(fixtureRoot, config.base));
  const runDirs = listChangeDirs(runDir);
  const newDirs = runDirs.filter((dir) => !baseDirs.includes(dir));

  if (config.lane === "none") {
    if (newDirs.length !== 0) problems.push(`${name}: expected no new artifact, found ${JSON.stringify(newDirs)}`);
    const baseSnapshot = snapshotTree(path.join(fixtureRoot, config.base));
    const runSnapshot = snapshotTree(runDir);
    if (JSON.stringify(runSnapshot) !== JSON.stringify(baseSnapshot)) {
      problems.push(`${name}: no-artifact run changed the project tree`);
    }
  } else {
    const expectedName = path.basename(config.expectDir);
    if (!newDirs.includes(expectedName)) {
      problems.push(`${name}: expected new dir ${expectedName}, found ${JSON.stringify(newDirs)}`);
      return;
    }
    if (newDirs.length !== 1) problems.push(`${name}: expected exactly one new dir, found ${JSON.stringify(newDirs)}`);

    const featureDir = path.join(runDir, config.expectDir);
    const files = fs.readdirSync(featureDir).sort();
    if (config.lane === "full") {
      const expectedFiles = ["plan.md", "spec.md", "tasks.md"];
      if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
        problems.push(`${name}: full lane files must be exactly ${JSON.stringify(expectedFiles)}, found ${JSON.stringify(files)}`);
      }
    } else if (config.lane === "light") {
      const expectedFiles = ["tasks.md"];
      if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
        problems.push(`${name}: light lane files must be exactly ${JSON.stringify(expectedFiles)}, found ${JSON.stringify(files)}`);
      }
    }

    const specPath = path.join(featureDir, "spec.md");
    if (config.shape && fs.existsSync(specPath)) {
      const spec = read(specPath);
      const isBrownfield = ["## Motivation", "## Domain References", "## Delta"].every((heading) => spec.includes(heading));
      const isGreenfield = spec.includes("## 1. Outcomes");
      if (config.shape === "brownfield" && (!isBrownfield || isGreenfield)) {
        problems.push(`${name}: spec.md is not exclusively brownfield-shaped`);
      }
      if (config.shape === "greenfield" && (!isGreenfield || isBrownfield)) {
        problems.push(`${name}: spec.md is not exclusively greenfield-shaped`);
      }
    }

    const artifactText = files
      .map((file) => read(path.join(featureDir, file)))
      .join("\n");
    if (config.mustRetainTodoMarker && !artifactText.includes("{{TODO")) {
      problems.push(`${name}: no {{TODO ...}} markers retained — undiscussed details must stay deferred`);
    }
    for (const pattern of config.forbiddenPlantPatterns || []) {
      if (artifactText.includes(pattern)) {
        problems.push(`${name}: planted specific ${JSON.stringify(pattern)} without user-provided source`);
      }
    }
  }

  if (config.sentinel) {
    const before = read(path.join(fixtureRoot, config.base, config.sentinel));
    const afterPath = path.join(runDir, config.sentinel);
    if (!fs.existsSync(afterPath) || read(afterPath) !== before) {
      problems.push(`${name}: sentinel ${config.sentinel} was modified or removed`);
    }
  }
  for (const forbidPath of config.forbidPaths || []) {
    if (fs.existsSync(path.join(runDir, forbidPath))) {
      problems.push(`${name}: forbidden path ${forbidPath} was created (wrong target root)`);
    }
  }
}

function validateFixtures() {
  for (const [name, config] of Object.entries(expected)) {
    const baseDir = path.join(fixtureRoot, config.base);
    if (!fs.existsSync(path.join(baseDir, "AGENTS.md"))) problems.push(`${name}: base ${config.base} missing AGENTS.md`);
    if (!fs.existsSync(path.join(baseDir, "docs/specs"))) problems.push(`${name}: base ${config.base} missing docs/specs`);
    if (config.sentinel && !fs.existsSync(path.join(baseDir, config.sentinel))) {
      problems.push(`${name}: declared sentinel ${config.sentinel} absent in base`);
    }
    if (config.interactionOnly) {
      if (!config.expectedBehavior) problems.push(`${name}: interaction-only scenario needs expectedBehavior`);
      continue;
    }
    if (!["full", "light", "none"].includes(config.lane)) problems.push(`${name}: invalid lane ${config.lane}`);
    if (config.lane !== "none") {
      if (!/^docs\/specs\/changes\/\d{3}-[a-z0-9-]+$/.test(config.expectDir || "")) {
        problems.push(`${name}: expectDir must be docs/specs/changes/<NNN>-<slug>`);
      }
      const expectedNumber = Number(path.basename(config.expectDir).slice(0, 3));
      const usedNumbers = ["docs/specs/changes", "docs/specs/changes/archive"]
        .flatMap((rel) => {
          const dir = path.join(baseDir, rel);
          if (!fs.existsSync(dir)) return [];
          return fs.readdirSync(dir).filter((entry) => /^\d{3}-/.test(entry)).map((entry) => Number(entry.slice(0, 3)));
        });
      const next = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
      if (expectedNumber !== next) {
        problems.push(`${name}: expectDir number ${expectedNumber} disagrees with base numbering (next=${String(next).padStart(3, "0")}, active+archive shared sequence)`);
      }
    }
    if (config.lane === "full" && !["brownfield", "greenfield"].includes(config.shape)) {
      problems.push(`${name}: full lane needs shape brownfield|greenfield`);
    }
  }
}

function runMaterializer(runDir, args) {
  return spawnSync(process.execPath, [materializer, "--target", runDir, ...args], { encoding: "utf8" });
}

async function validateMaterializer() {
  if (!fs.existsSync(materializer)) {
    problems.push("missing scripts/materialize-feature-artifact.cjs");
    return;
  }

  const tempRoot = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "project-workflow-feature-materializer-"));
  try {
    const runDir = path.join(tempRoot, "target");
    fs.cpSync(path.join(fixtureRoot, "base-numbered"), runDir, { recursive: true });

    const lightArgs = ["--number", "004", "--slug", "materializer-smoke", "--lane", "light"];
    const first = runMaterializer(runDir, lightArgs);
    if (first.status !== 0) problems.push(`materializer light create failed: ${first.stderr.trim()}`);
    const lightDir = path.join(runDir, "docs/specs/changes/004-materializer-smoke");
    const lightTask = path.join(lightDir, "tasks.md");
    if (!fs.existsSync(lightTask)) problems.push("materializer light create missing tasks.md");
    if (fs.existsSync(lightTask) && read(lightTask) !== read(path.join(root, "template/docs/specs/changes/_template/tasks-light.md"))) {
      problems.push("materializer light create differs from the selected template");
    }
    if (fs.existsSync(path.join(lightDir, "spec.md")) || fs.existsSync(path.join(lightDir, "plan.md"))) {
      problems.push("materializer light create emitted full-lane files");
    }

    if (fs.existsSync(lightTask)) fs.appendFileSync(lightTask, "\nSENTINEL-NO-CLOBBER\n");
    const beforeRetry = fs.existsSync(lightTask) ? read(lightTask) : "";
    const retry = runMaterializer(runDir, lightArgs);
    if (retry.status === 0) problems.push("materializer accepted an existing feature directory");
    if (fs.existsSync(lightTask) && read(lightTask) !== beforeRetry) problems.push("materializer modified an existing feature directory on refusal");

    const reusedNumber = runMaterializer(runDir, ["--number", "002", "--slug", "different-slug", "--lane", "light"]);
    if (reusedNumber.status === 0) problems.push("materializer accepted an active/archive NNN collision");

    const full = runMaterializer(runDir, ["--number", "005", "--slug", "materializer-full", "--lane", "full", "--shape", "greenfield"]);
    if (full.status !== 0) problems.push(`materializer full create failed: ${full.stderr.trim()}`);
    const fullDir = path.join(runDir, "docs/specs/changes/005-materializer-full");
    for (const file of ["spec.md", "plan.md", "tasks.md"]) {
      if (!fs.existsSync(path.join(fullDir, file))) problems.push(`materializer full create missing ${file}`);
    }
    for (const [output, template] of [["spec.md", "spec-greenfield.md"], ["plan.md", "plan.md"], ["tasks.md", "tasks.md"]]) {
      const outputPath = path.join(fullDir, output);
      if (fs.existsSync(outputPath) && read(outputPath) !== read(path.join(root, "template/docs/specs/changes/_template", template))) {
        problems.push(`materializer full create ${output} differs from ${template}`);
      }
    }
    if (fs.existsSync(path.join(fullDir, "spec.md")) && !read(path.join(fullDir, "spec.md")).includes("## 1. Outcomes")) {
      problems.push("materializer full create selected the wrong spec shape");
    }

    const brownfield = runMaterializer(runDir, ["--number", "006", "--slug", "materializer-brownfield", "--lane", "full", "--shape", "brownfield"]);
    if (brownfield.status !== 0) problems.push(`materializer brownfield create failed: ${brownfield.stderr.trim()}`);
    const brownfieldDir = path.join(runDir, "docs/specs/changes/006-materializer-brownfield");
    for (const [output, template] of [["spec.md", "spec-brownfield.md"], ["plan.md", "plan.md"], ["tasks.md", "tasks.md"]]) {
      const outputPath = path.join(brownfieldDir, output);
      if (!fs.existsSync(outputPath)) {
        problems.push(`materializer brownfield create missing ${output}`);
      } else if (read(outputPath) !== read(path.join(root, "template/docs/specs/changes/_template", template))) {
        problems.push(`materializer brownfield create ${output} differs from ${template}`);
      }
    }

    const symlinkRoot = path.join(tempRoot, "symlink-root-real");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), symlinkRoot, { recursive: true });
    const symlinkAlias = path.join(tempRoot, "symlink-root-alias");
    fs.symlinkSync(symlinkRoot, symlinkAlias, "dir");
    const symlinkRootAttempt = runMaterializer(symlinkAlias, ["--number", "001", "--slug", "symlink-root", "--lane", "light"]);
    if (symlinkRootAttempt.status !== 0) problems.push(`materializer rejected an existing symlinked project root: ${symlinkRootAttempt.stderr.trim()}`);
    if (!fs.existsSync(path.join(symlinkRoot, "docs/specs/changes/001-symlink-root/tasks.md"))) problems.push("materializer did not normalize an existing symlinked project root");

    const ancestorOutside = path.join(tempRoot, "symlink-ancestor-outside");
    fs.mkdirSync(ancestorOutside);
    const ancestorProject = path.join(ancestorOutside, "project");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), ancestorProject, { recursive: true });
    const ancestorLink = path.join(tempRoot, "symlink-ancestor-link");
    fs.symlinkSync(ancestorOutside, ancestorLink, "dir");
    const ancestorAttempt = runMaterializer(path.join(ancestorLink, "project"), ["--number", "001", "--slug", "symlink-ancestor", "--lane", "light"]);
    if (ancestorAttempt.status !== 0) problems.push(`materializer rejected an existing project below a symlinked ancestor: ${ancestorAttempt.stderr.trim()}`);
    if (!fs.existsSync(path.join(ancestorProject, "docs/specs/changes/001-symlink-ancestor/tasks.md"))) problems.push("materializer did not normalize an existing project below a symlinked ancestor");

    const rollbackRun = path.join(tempRoot, "rollback-target");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), rollbackRun, { recursive: true });
    const { materializeFeature } = require(materializer);
    const originalCopyFileSync = fs.copyFileSync;
    let copyCount = 0;
    let rollbackThrew = false;
    try {
      fs.copyFileSync = (...args) => {
        copyCount += 1;
        if (copyCount === 2) throw new Error("injected copy failure");
        return originalCopyFileSync(...args);
      };
      materializeFeature({ target: rollbackRun, number: "001", slug: "rollback", lane: "full", shape: "greenfield" });
    } catch {
      rollbackThrew = true;
    } finally {
      fs.copyFileSync = originalCopyFileSync;
    }
    if (!rollbackThrew) problems.push("materializer rollback smoke did not trigger the injected copy failure");
    if (fs.existsSync(path.join(rollbackRun, "docs/specs/changes/001-rollback"))) {
      problems.push("materializer left a partial feature directory after copy failure");
    }

    const symlinkRun = path.join(tempRoot, "symlink-target");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), symlinkRun, { recursive: true });
    const externalChanges = path.join(tempRoot, "external-changes");
    fs.mkdirSync(externalChanges);
    fs.rmSync(path.join(symlinkRun, "docs/specs/changes"), { recursive: true, force: true });
    fs.symlinkSync(externalChanges, path.join(symlinkRun, "docs/specs/changes"), "dir");
    const symlinkAttempt = runMaterializer(symlinkRun, ["--number", "001", "--slug", "symlink-refusal", "--lane", "light"]);
    if (symlinkAttempt.status === 0) problems.push("materializer accepted a symlinked changes destination");
    if (fs.readdirSync(externalChanges).length !== 0) problems.push("materializer wrote through a symlinked changes destination");

  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function main() {
  const gradeIndex = process.argv.indexOf("--grade");
  if (gradeIndex !== -1) {
    const [scenario, runDir] = process.argv.slice(gradeIndex + 1);
    if (!expected[scenario]) {
      console.error(`Unknown scenario ${scenario}. Available: ${Object.keys(expected).join(", ")}`);
      process.exit(1);
    }
    if (!runDir || !fs.existsSync(runDir)) {
      console.error("Usage: check-feature-init-fixtures.cjs --grade <scenario> <run-dir>");
      process.exit(1);
    }
    gradeScenario(scenario, expected[scenario], path.resolve(runDir));
    if (problems.length) {
      console.error(`Scenario ${scenario} FAILED:`);
      for (const problem of problems) console.error(`- ${problem}`);
      process.exit(1);
    }
    console.log(`Scenario ${scenario} OK: lane/numbering/shape/no-clobber/TODO-retention/plant/sentinel assertions hold.`);
  } else {
    validateFixtures();
    await validateMaterializer();
    if (problems.length) {
      console.error("Feature-init fixture check failed:");
      for (const problem of problems) console.error(`- ${problem}`);
      process.exit(1);
    }
    console.log("Feature-init scenario fixtures OK: bases and expectations are coherent; materializer lane/shape/NNN/no-clobber/rollback/symlink checks passed (no model executed).");
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
