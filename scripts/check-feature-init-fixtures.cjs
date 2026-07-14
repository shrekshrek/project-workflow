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
const { spawn, spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const fixtureRoot = path.join(root, "tests/fixtures/feature-init-scenarios");
const expected = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "expected.json"), "utf8"));
const problems = [];
const materializer = path.join(root, "scripts/materialize-feature-artifact.cjs");

function read(file) {
  return fs.readFileSync(file, "utf8");
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
      for (const required of ["plan.md", "spec.md", "tasks.md"]) {
        if (!files.includes(required)) problems.push(`${name}: full lane missing ${required}`);
      }
    } else if (config.lane === "light") {
      if (!files.includes("tasks.md")) problems.push(`${name}: light lane missing tasks.md`);
      if (files.includes("spec.md") || files.includes("plan.md")) {
        problems.push(`${name}: light lane must not create spec.md/plan.md, found ${JSON.stringify(files)}`);
      }
    }

    const specPath = path.join(featureDir, "spec.md");
    if (config.shape && fs.existsSync(specPath)) {
      const spec = read(specPath);
      const isBrownfield = spec.includes("## Delta") || spec.includes("## Motivation");
      const isGreenfield = spec.includes("## 1. Outcomes");
      if (config.shape === "brownfield" && !isBrownfield) problems.push(`${name}: spec.md is not brownfield-shaped`);
      if (config.shape === "greenfield" && !isGreenfield) problems.push(`${name}: spec.md is not greenfield-shaped`);
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
    if (config.runtimeSetup?.requireCachedPluginFallback) {
      const unset = config.runtimeSetup.unsetEnvironment || [];
      for (const variable of ["PROJECT_WORKFLOW_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT", "CODEX_PLUGIN_ROOT"]) {
        if (!unset.includes(variable)) problems.push(`${name}: cache fallback scenario must unset ${variable}`);
      }
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

function runMaterializerAsync(runDir, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [materializer, "--target", runDir, ...args]);
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("exit", (status) => resolve({ status, stderr }));
  });
}

function writeFakePlugin(rootDir, asset, mtime) {
  fs.mkdirSync(path.join(rootDir, "template"), { recursive: true });
  const assetPath = path.join(rootDir, asset);
  fs.mkdirSync(path.dirname(assetPath), { recursive: true });
  fs.writeFileSync(assetPath, "fixture");
  fs.utimesSync(assetPath, mtime, mtime);
}

function resolveCachedPluginRoot(home, asset) {
  const shell = `
CANDIDATE="$(find "$HOME/.claude/plugins/cache" "$HOME/.codex/plugins/cache" -type f -path "*/project-workflow*/$1" -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | grep "/$1$" | head -1)"
ROOT="\${CANDIDATE%/$1}"
[ -n "$CANDIDATE" ] && [ -d "$ROOT/template" ] && [ -f "$CANDIDATE" ] || exit 1
printf '%s' "$ROOT"
`;
  return spawnSync("/bin/bash", ["-c", shell, "resolver", asset], {
    encoding: "utf8",
    env: { ...process.env, HOME: home },
  });
}

async function validateMaterializer() {
  if (!fs.existsSync(materializer)) {
    problems.push("missing scripts/materialize-feature-artifact.cjs");
    return;
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "project-workflow-feature-materializer-"));
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

    const symlinkRun = path.join(tempRoot, "symlink-target");
    fs.cpSync(path.join(fixtureRoot, "base-empty"), symlinkRun, { recursive: true });
    const externalChanges = path.join(tempRoot, "external-changes");
    fs.mkdirSync(externalChanges);
    fs.rmSync(path.join(symlinkRun, "docs/specs/changes"), { recursive: true, force: true });
    fs.symlinkSync(externalChanges, path.join(symlinkRun, "docs/specs/changes"), "dir");
    const symlinkAttempt = runMaterializer(symlinkRun, ["--number", "001", "--slug", "symlink-refusal", "--lane", "light"]);
    if (symlinkAttempt.status === 0) problems.push("materializer accepted a symlinked changes destination");
    if (fs.readdirSync(externalChanges).length !== 0) problems.push("materializer wrote through a symlinked changes destination");

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const raceRun = path.join(tempRoot, `race-${attempt}`);
      fs.cpSync(path.join(fixtureRoot, "base-numbered"), raceRun, { recursive: true });
      const results = await Promise.all([
        runMaterializerAsync(raceRun, ["--number", "004", "--slug", "race-a", "--lane", "light"]),
        runMaterializerAsync(raceRun, ["--number", "004", "--slug", "race-b", "--lane", "light"]),
      ]);
      const successes = results.filter((result) => result.status === 0).length;
      if (successes !== 1) {
        problems.push(`materializer NNN reservation race expected exactly one success, got ${successes}`);
        break;
      }
      const leftovers = fs.readdirSync(path.join(raceRun, "docs/specs/changes")).filter((name) => name.startsWith(".project-workflow-nnn-"));
      if (leftovers.length) problems.push(`materializer left reservation files: ${leftovers.join(", ")}`);
    }

    const staleRun = path.join(tempRoot, "stale-reservation");
    fs.cpSync(path.join(fixtureRoot, "base-numbered"), staleRun, { recursive: true });
    const staleReservation = path.join(staleRun, "docs/specs/changes/.project-workflow-nnn-004.lock");
    fs.writeFileSync(staleReservation, JSON.stringify({ pid: 999999, createdAt: "2020-01-01T00:00:00Z" }));
    const staleAttempt = runMaterializer(staleRun, ["--number", "004", "--slug", "stale-reservation", "--lane", "light"]);
    if (staleAttempt.status === 0 || !staleAttempt.stderr.includes("retry with 005")) {
      problems.push(`materializer stale reservation did not advance the retry number: ${staleAttempt.stderr.trim()}`);
    }
    const afterStale = runMaterializer(staleRun, ["--number", "005", "--slug", "after-stale-reservation", "--lane", "light"]);
    if (afterStale.status !== 0) problems.push(`materializer could not continue after a stale reservation: ${afterStale.stderr.trim()}`);

    const fakeHome = path.join(tempRoot, "fake-home");
    const oldRoot = path.join(fakeHome, ".claude/plugins/cache/project-workflow/project-workflow/3.9.0");
    const newRoot = path.join(fakeHome, ".claude/plugins/cache/project-workflow/project-workflow/3.10.0");
    const incompatibleRoot = path.join(fakeHome, ".codex/plugins/cache/project-workflow/project-workflow/99.0.0");
    const featureAsset = "scripts/materialize-feature-artifact.cjs";
    const baselineAsset = "scripts/materialize-project-baseline.cjs";
    for (const asset of [featureAsset, baselineAsset]) {
      writeFakePlugin(oldRoot, asset, new Date("2026-01-01T00:00:00Z"));
      writeFakePlugin(newRoot, asset, new Date("2026-02-01T00:00:00Z"));
    }
    fs.mkdirSync(path.join(incompatibleRoot, "template"), { recursive: true });
    for (const asset of [featureAsset, baselineAsset]) {
      const resolved = resolveCachedPluginRoot(fakeHome, asset);
      if (resolved.status !== 0 || resolved.stdout !== newRoot) {
        problems.push(`cache fallback for ${asset} did not select the newest compatible package: ${resolved.stderr.trim() || resolved.stdout}`);
      }
    }

    const resolverShapes = [
      ["skills/feature-init/SKILL.md", featureAsset],
      ["skills/project-init/SKILL.md", baselineAsset],
    ];
    for (const [skill, asset] of resolverShapes) {
      const expectedPipeline = `-type f -path '*/project-workflow*/${asset}' -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | grep '/${asset}$' | head -1`;
      if (!read(path.join(root, skill)).includes(expectedPipeline)) {
        problems.push(`${skill}: cached resolver differs from the behavior-tested pipeline for ${asset}`);
      }
    }
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
    console.log("Feature-init scenario fixtures OK: bases and expectations are coherent; materializer lane/shape/NNN/no-clobber/concurrency and cache-fallback checks passed (no model executed).");
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
