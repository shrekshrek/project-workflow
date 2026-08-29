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
const { validateAcceptedFixture } = require("./lib/fixture-contracts.cjs");

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

  if (!config.expectDir) {
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
    const expectedFiles = [...(config.expectedFiles || ["spec.md"])].sort();
    if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
      problems.push(`${name}: expected only purposeful files ${JSON.stringify(expectedFiles)}, found ${JSON.stringify(files)}`);
    }

    const outsideRecord = (entry) => entry[1] !== config.expectDir && !entry[1].startsWith(`${config.expectDir}${path.sep}`);
    if (JSON.stringify(snapshotTree(runDir).filter(outsideRecord)) !==
        JSON.stringify(snapshotTree(path.join(fixtureRoot, config.base)))) {
      problems.push(`${name}: record preparation changed paths outside the selected record`);
    }

    const artifactText = files
      .map((file) => read(path.join(featureDir, file)))
      .join("\n");
    for (const pattern of config.forbiddenPlantPatterns || []) {
      if (artifactText.includes(pattern)) {
        problems.push(`${name}: planted specific ${JSON.stringify(pattern)} without user-provided source`);
      }
    }
    for (const pattern of config.requiredArtifactPatterns || []) {
      if (!artifactText.includes(pattern)) {
        problems.push(`${name}: artifact missing required trace ${JSON.stringify(pattern)}`);
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
  const approvedFeature = path.join(
    fixtureRoot,
    "base-numbered/docs/specs/changes/001-approved-feature",
  );
  problems.push(...validateAcceptedFixture(approvedFeature, {
    label: "feature-init accepted reuse base",
    requireComplete: false,
  }));

 for (const scenario of [
   "scope-viability-implicit-ask",
   "scope-viability-coupled-migration",
   "scope-viability-cross-module-vertical",
    "impact-unknown-data-disposition-ask",
    "scope-necessity-speculative-admin-ask",
    "impact-coupled-cutover",
    "scope-split-provider-rollout-ask",
    "direction-concern-ask",
    "project-evidence-conflict-before-spec-ask",
    "operating-envelope-before-implementation-ask",
 ]) {
    if (!expected[scenario]) problems.push(`missing required scope/impact scenario ${scenario}`);
 }

  const checkedNumberingBases = new Set();
  for (const [name, config] of Object.entries(expected)) {
    const baseDir = path.join(fixtureRoot, config.base);
    if (!fs.existsSync(path.join(baseDir, "AGENTS.md"))) problems.push(`${name}: base ${config.base} missing AGENTS.md`);
    if (!fs.existsSync(path.join(baseDir, "docs/specs"))) problems.push(`${name}: base ${config.base} missing docs/specs`);
    if (!checkedNumberingBases.has(config.base)) {
      const numberOwners = new Map();
      for (const rel of ["docs/specs/changes", "docs/specs/changes/archive"]) {
        const dir = path.join(baseDir, rel);
        if (!fs.existsSync(dir)) continue;
        for (const entry of fs.readdirSync(dir).filter((candidate) => /^\d{3}-/.test(candidate))) {
          const number = entry.slice(0, 3);
          const owner = path.join(rel, entry);
          if (numberOwners.has(number)) {
            problems.push(`${config.base}: duplicate feature number ${number} in ${numberOwners.get(number)} and ${owner}`);
          } else {
            numberOwners.set(number, owner);
          }
        }
      }
      checkedNumberingBases.add(config.base);
    }
    if (config.sentinel && !fs.existsSync(path.join(baseDir, config.sentinel))) {
      problems.push(`${name}: declared sentinel ${config.sentinel} absent in base`);
    }
    if (config.expectedBehavior !== undefined && (typeof config.expectedBehavior !== "string" || !config.expectedBehavior.trim())) {
      problems.push(`${name}: expectedBehavior must be a non-empty string when provided`);
    }
    if (typeof config.prompt !== "string" || !config.prompt.trim()) {
      problems.push(`${name}: prompt must be a non-empty string`);
    }
    if (config.followUpPrompts !== undefined) {
      if (!config.interactionOnly || !Array.isArray(config.followUpPrompts)
        || config.followUpPrompts.length === 0
        || config.followUpPrompts.some((prompt) => typeof prompt !== "string" || !prompt.trim())) {
        problems.push(`${name}: followUpPrompts requires an interaction-only scenario and non-empty user turns`);
      }
    }
    if (config.interactionOnly) {
      if (!config.expectedBehavior) problems.push(`${name}: interaction-only scenario needs expectedBehavior`);
      continue;
    }
    if (config.expectDir) {
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
    if (config.expectedFiles && (!Array.isArray(config.expectedFiles)
      || !config.expectedFiles.includes("spec.md")
      || config.expectedFiles.some((file) => !["spec.md", "plan.md", "tasks.md"].includes(file)))) {
      problems.push(`${name}: expectedFiles must describe the intended record and any requested attachments`);
    }
    const required = config.requiredArtifactPatterns;
    if (required && (!Array.isArray(required) || required.length === 0 || required.some((pattern) => typeof pattern !== "string" || !pattern))) {
      problems.push(`${name}: requiredArtifactPatterns must be a non-empty string array`);
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

    const args = ["--number", "004", "--slug", "materializer-smoke"];
    const beforeInvalid = JSON.stringify(snapshotTree(runDir));
    for (const invalid of [
      [...args, "--lane", "full"], [...args, "--shape", "greenfield"],
      [...args, "--number", "005"], [...args, "--slug"],
    ]) {
      const result = runMaterializer(runDir, invalid);
      if (result.status === 0) problems.push("materializer accepted an unsupported/duplicate/incomplete option");
      if (JSON.stringify(snapshotTree(runDir)) !== beforeInvalid) problems.push("invalid options mutated the project");
    }
    const first = runMaterializer(runDir, args);
    if (first.status !== 0) problems.push(`materializer create failed: ${first.stderr.trim()}`);
    const featureDir = path.join(runDir, "docs/specs/changes/004-materializer-smoke");
    const specPath = path.join(featureDir, "spec.md");
    if (!fs.existsSync(specPath)) problems.push("materializer missing spec.md");
    else {
      if (JSON.stringify(fs.readdirSync(featureDir)) !== JSON.stringify(["spec.md"])) problems.push("materializer precreated optional files");
      if (read(specPath) !== read(path.join(root, "template/docs/specs/changes/_template/spec.md"))) problems.push("materializer differs from its template");
      fs.appendFileSync(specPath, "\nSENTINEL-NO-CLOBBER\n");
    }
    const beforeRetry = JSON.stringify(snapshotTree(runDir));
    const retry = runMaterializer(runDir, args);
    if (retry.status === 0) problems.push("materializer accepted an existing directory");
    if (JSON.stringify(snapshotTree(runDir)) !== beforeRetry) problems.push("materializer changed the tree on refusal");
    for (const number of ["002", "003"]) {
      const collision = runMaterializer(runDir, ["--number", number, "--slug", "different-slug"]);
      if (collision.status === 0) problems.push("materializer accepted an active/archive NNN collision");
      if (JSON.stringify(snapshotTree(runDir)) !== beforeRetry) problems.push("number collision mutated the tree");
    }
    const next = runMaterializer(runDir, ["--number", "005", "--slug", "next-record"]);
    if (next.status !== 0) problems.push(`next record failed: ${next.stderr.trim()}`);

    const symlinkRoot = path.join(tempRoot, "symlink-root-real");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), symlinkRoot, { recursive: true });
    const symlinkAlias = path.join(tempRoot, "symlink-root-alias");
    fs.symlinkSync(symlinkRoot, symlinkAlias, "dir");
    const symlinkRootAttempt = runMaterializer(symlinkAlias, ["--number", "001", "--slug", "symlink-root"]);
    if (symlinkRootAttempt.status !== 0) problems.push(`materializer rejected an existing symlinked project root: ${symlinkRootAttempt.stderr.trim()}`);
    if (!fs.existsSync(path.join(symlinkRoot, "docs/specs/changes/001-symlink-root/spec.md"))) problems.push("materializer did not normalize an existing symlinked project root");

    const ancestorOutside = path.join(tempRoot, "symlink-ancestor-outside");
    fs.mkdirSync(ancestorOutside);
    const ancestorProject = path.join(ancestorOutside, "project");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), ancestorProject, { recursive: true });
    const ancestorLink = path.join(tempRoot, "symlink-ancestor-link");
    fs.symlinkSync(ancestorOutside, ancestorLink, "dir");
    const ancestorAttempt = runMaterializer(path.join(ancestorLink, "project"), ["--number", "001", "--slug", "symlink-ancestor"]);
    if (ancestorAttempt.status !== 0) problems.push(`materializer rejected an existing project below a symlinked ancestor: ${ancestorAttempt.stderr.trim()}`);
    if (!fs.existsSync(path.join(ancestorProject, "docs/specs/changes/001-symlink-ancestor/spec.md"))) problems.push("materializer did not normalize an existing project below a symlinked ancestor");

    const rollbackRun = path.join(tempRoot, "rollback-target");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), rollbackRun, { recursive: true });
    const { materializeFeature } = require(materializer);
    const originalCopyFileSync = fs.copyFileSync;
    let copyCount = 0;
    let rollbackThrew = false;
    try {
      fs.copyFileSync = (...args) => {
        copyCount += 1;
        if (copyCount === 1) throw new Error("injected copy failure");
        return originalCopyFileSync(...args);
      };
      materializeFeature({ target: rollbackRun, number: "001", slug: "rollback" });
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
    const symlinkAttempt = runMaterializer(symlinkRun, ["--number", "001", "--slug", "symlink-refusal"]);
    if (symlinkAttempt.status === 0) problems.push("materializer accepted a symlinked changes destination");
    if (fs.readdirSync(externalChanges).length !== 0) problems.push("materializer wrote through a symlinked changes destination");

  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function validateGrading() {
  // Synthetic file-grader checks, never evidence that an AI followed the conversation.
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "project-workflow-grade-"));
  const scenario = "tracked-existing-contract-ui-handoff";
  const config = expected[scenario];
  const expectGrade = (name, shouldPass, reason) => {
    const result = spawnSync(process.execPath, [__filename, "--grade", name, target], { encoding: "utf8" });
    if ((result.status === 0) !== shouldPass) problems.push(`grader regression: ${reason}\n${result.stdout}${result.stderr}`);
  };
  try {
    fs.cpSync(path.join(fixtureRoot, config.base), target, { recursive: true });
    expectGrade("no-artifact-typo", true, "unchanged action output");
    fs.writeFileSync(path.join(target, "unexpected.txt"), "unauthorized output");
    expectGrade("no-artifact-typo", false, "no-record action must preserve the tree");
    fs.unlinkSync(path.join(target, "unexpected.txt"));
    const record = path.join(target, config.expectDir);
    fs.mkdirSync(record);
    fs.copyFileSync(path.join(root, "template/docs/specs/changes/_template/spec.md"), path.join(record, "spec.md"));
    expectGrade(scenario, true, "single-file output (not semantic readiness)");
    fs.writeFileSync(path.join(record, "tasks.md"), "unrequested file");
    expectGrade(scenario, false, "no precreated optional file");
    fs.unlinkSync(path.join(record, "tasks.md"));
    fs.appendFileSync(path.join(target, "AGENTS.md"), "\nUnauthorized rule\n");
    expectGrade(scenario, false, "record creation cannot rewrite project rules");
    expectGrade("conversation-batched-recording", false, "files alone cannot grade a conversation");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
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
    console.log(`Scenario ${scenario} OK: record/numbering/no-clobber/plant/trace/sentinel assertions hold.`);
  } else {
    validateFixtures();
    await validateMaterializer();
    validateGrading();
    if (problems.length) {
      console.error("Feature-init fixture check failed:");
      for (const problem of problems) console.error(`- ${problem}`);
      process.exit(1);
    }
    console.log("Feature-init scenario fixtures OK: accepted records with optional attachments, file-grader refusal cases, and single-spec materializer/NNN/no-clobber/rollback/symlink checks passed (no model executed).");
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
