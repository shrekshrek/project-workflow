#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const fixtureRoot = path.join(root, "tests/fixtures/reviewer-smoke");
const expected = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "expected.json"), "utf8"));
const problems = [];

function aggregateVerdict({ l1Passed, l2Blocking, l3Blocking, lightVerificationPassed, receiptReliable }) {
  if (!receiptReliable) return "BLOCKED";
  if (!l1Passed) return "NEEDS WORK";
  if (l2Blocking || l3Blocking || lightVerificationPassed === false) return "NEEDS WORK";
  return "READY";
}

function materialize(name, config) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `project-workflow-${name}-`));
  fs.cpSync(path.join(fixtureRoot, config.base), target, { recursive: true });
  fs.cpSync(path.join(fixtureRoot, "cases", config.case), target, { recursive: true });
  return target;
}

for (const [name, config] of Object.entries(expected)) {
  const target = materialize(name, config);
  try {
    const test = spawnSync(process.execPath, ["--test"], { cwd: target, encoding: "utf8" });
    if (test.status !== 0) problems.push(`${name}: L1 fixture tests must pass\n${test.stdout}${test.stderr}`);

    const source = fs.readFileSync(path.join(target, "src/normalize-key.js"), "utf8");
    const tests = fs.readdirSync(path.join(target, "test"));
    const concepts = [];
    let lightVerificationPassed = null;
    if (name.startsWith("light-")) {
      const verification = spawnSync(process.execPath, ["-e", "const {normalizeKey}=require('./src/normalize-key'); if (normalizeKey('') !== '') process.exit(1)"], { cwd: target, encoding: "utf8" });
      const expectedStatus = config.endpointVerdict === "READY" ? 0 : 1;
      if (verification.status !== expectedStatus) problems.push(`${name}: light verification expected exit ${expectedStatus}, got ${verification.status}`);
      lightVerificationPassed = verification.status === 0;
      if (!lightVerificationPassed) concepts.push("light-lane verification");
    }
    if (config.endpointVerdict === "READY") {
      if (source.includes("throw new Error")) problems.push("clean: source retains planted throw");
      if (!tests.includes("normalize-key.test.js")) problems.push("clean: matching test filename missing");
      if (name === "clean" && !fs.readFileSync(path.join(target, "test/normalize-key.test.js"), "utf8").includes('normalizeKey("")')) {
        problems.push("clean: empty-input verification missing");
      }
    } else {
      if (!source.includes('if (input === "") throw')) problems.push(`${name}: planted behavior deviation missing`);
      if (name === "known-bad" && (!tests.includes("key-utils.test.js") || tests.includes("normalize-key.test.js"))) {
        problems.push("known-bad: planted test-filename violation missing");
      } else if (name === "known-bad") {
        concepts.push("matching test filename");
      }
      if (name === "known-bad" && fs.readFileSync(path.join(target, "test/key-utils.test.js"), "utf8").includes('normalizeKey("")')) {
        problems.push("known-bad: empty-input verification should be absent");
      } else if (name === "known-bad") {
        concepts.push("empty input verification");
      }
      if (name === "known-bad" && source.includes('if (input === "") throw')) concepts.push("empty string behavior");
    }

    const missingConcepts = config.requiredFindingConcepts.filter((concept) => !concepts.includes(concept));
    const unexpectedConcepts = concepts.filter((concept) => !config.requiredFindingConcepts.includes(concept));
    if (missingConcepts.length || unexpectedConcepts.length) {
      problems.push(`${name}: finding concepts differ; missing=${JSON.stringify(missingConcepts)} unexpected=${JSON.stringify(unexpectedConcepts)}`);
    }

    const verdict = aggregateVerdict({
      l1Passed: test.status === 0,
      l2Blocking: concepts.includes("matching test filename"),
      l3Blocking: concepts.includes("empty string behavior") || concepts.includes("empty input verification"),
      lightVerificationPassed,
      receiptReliable: true,
    });
    if (verdict !== config.endpointVerdict) problems.push(`${name}: deterministic aggregate expected ${config.endpointVerdict}, got ${verdict}`);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

if (problems.length) {
  console.error("Reviewer fixture check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Endpoint fixture inputs OK: full/light mutations, required finding concepts, and deterministic verdict truth table are coherent (model reviewers not executed)." );
