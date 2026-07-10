#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function isPluginOnly(relative) {
  const normalized = relative.split(path.sep).join("/");
  const parts = normalized.split("/");
  return parts.includes("_multi_tier_examples")
    || parts.includes("_template")
    || parts.includes("_examples")
    || normalized === "docs/adr/0000-template.md"
    || normalized === ".claude/settings.json"
    || normalized.startsWith(".claude/hooks/")
    || normalized.startsWith(".codex/");
}

function walk(root, current = root) {
  return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in baseline source: ${full}`);
    if (entry.isDirectory()) return walk(root, full);
    return entry.isFile() ? [path.relative(root, full)] : [];
  });
}

function existingStat(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function assertNoSymlinkComponents(absolute) {
  const parsed = path.parse(absolute);
  const parts = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const stat = existingStat(current);
    if (!stat) break;
    if (stat.isSymbolicLink()) throw new Error(`Refusing symlink target component: ${current}`);
    if (index < parts.length - 1 && !stat.isDirectory()) {
      throw new Error(`Refusing non-directory target component: ${current}`);
    }
  }
}

function targetContext(targetRoot, options = {}) {
  const absolute = path.resolve(targetRoot);
  if (options.rejectAncestorSymlinks) assertNoSymlinkComponents(absolute);
  const before = existingStat(absolute);
  if (before?.isSymbolicLink()) throw new Error(`Refusing symlink target root: ${absolute}`);
  if (!before) {
    if (options.allowMissing) return absolute;
    if (options.create === false) throw new Error(`Target directory does not exist: ${absolute}`);
    fs.mkdirSync(absolute, { recursive: true });
  }
  const root = fs.realpathSync(absolute);
  if (!fs.statSync(root).isDirectory()) throw new Error(`Target is not a directory: ${targetRoot}`);
  return root;
}

function destinationState(root, relative) {
  const normalized = path.normalize(relative);
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`Refusing path outside target: ${relative}`);
  }

  const parts = normalized.split(path.sep).filter(Boolean);
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const stat = existingStat(current);
    if (!stat) return { exists: false, target: path.join(root, normalized) };
    if (stat.isSymbolicLink()) throw new Error(`Refusing symlink destination: ${current}`);
    if (index < parts.length - 1 && !stat.isDirectory()) {
      throw new Error(`Refusing non-directory destination parent: ${current}`);
    }
  }
  return { exists: true, target: path.join(root, normalized) };
}

function copyTreeNoClobber(sourceRoot, targetRoot, options = {}) {
  const candidates = walk(sourceRoot).filter((relative) => !options.excludePluginOnly || !isPluginOnly(relative));
  const target = targetContext(targetRoot, {
    create: options.createTarget !== false,
    rejectAncestorSymlinks: options.rejectTargetAncestorSymlinks === true,
  });
  const against = options.againstRoot ? targetContext(options.againstRoot, {
    create: false,
    allowMissing: true,
    rejectAncestorSymlinks: true,
  }) : null;
  const copied = [];
  const skippedExisting = [];
  const planned = [];

  for (const relative of candidates) {
    const finalState = against ? destinationState(against, relative) : destinationState(target, relative);
    if (finalState.exists) {
      skippedExisting.push(relative);
      continue;
    }
    const state = destinationState(target, relative);
    if (state.exists) {
      skippedExisting.push(relative);
      continue;
    }
    planned.push({ relative, destination: state.target });
  }

  if (options.failOnExisting && skippedExisting.length > 0) {
    throw new Error(`Refusing partial apply; target paths now exist: ${skippedExisting.join(", ")}`);
  }

  const createdDirectories = new Set();
  try {
    for (const { relative, destination } of planned) {
      const missingDirectories = [];
      let directory = path.dirname(destination);
      while (directory !== target && !existingStat(directory)) {
        missingDirectories.push(directory);
        directory = path.dirname(directory);
      }
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      for (const item of missingDirectories) createdDirectories.add(item);
      fs.copyFileSync(path.join(sourceRoot, relative), destination, fs.constants.COPYFILE_EXCL);
      copied.push(relative);
    }
  } catch (error) {
    if (options.rollbackOnError) {
      for (const relative of [...copied].reverse()) {
        const destination = path.join(target, relative);
        try { fs.unlinkSync(destination); } catch (rollbackError) {
          if (rollbackError.code !== "ENOENT") error.rollbackError = rollbackError.message;
        }
      }
      for (const directory of [...createdDirectories].sort((a, b) => b.length - a.length)) {
        try { fs.rmdirSync(directory); } catch (rollbackError) {
          if (!['ENOENT', 'ENOTEMPTY'].includes(rollbackError.code)) error.rollbackError = rollbackError.message;
        }
      }
    }
    throw error;
  }
  return { copied, skippedExisting };
}

function materialize(templateRoot, targetRoot, options = {}) {
  return copyTreeNoClobber(templateRoot, targetRoot, {
    ...options,
    excludePluginOnly: true,
    rejectTargetAncestorSymlinks: !options.againstRoot,
  });
}

function applyStaged(stagingRoot, targetRoot) {
  return copyTreeNoClobber(stagingRoot, targetRoot, {
    failOnExisting: true,
    rejectTargetAncestorSymlinks: true,
    rollbackOnError: true,
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const templateRoot = path.resolve(__dirname, "..", "template");
  let result;

  if (args[0] === "--stage" && args.length === 4 && args[2] === "--target") {
    const stagingRoot = path.resolve(args[1]);
    const targetRoot = path.resolve(args[3]);
    if (!fs.existsSync(templateRoot)) {
      console.error(`Template root not found: ${templateRoot}`);
      process.exit(1);
    }
    result = materialize(templateRoot, stagingRoot, { againstRoot: targetRoot });
  } else if (args[0] === "--apply-staged" && args.length === 3) {
    result = applyStaged(path.resolve(args[1]), path.resolve(args[2]));
  } else if (args.length === 1) {
    if (!fs.existsSync(templateRoot)) {
      console.error(`Template root not found: ${templateRoot}`);
      process.exit(1);
    }
    result = materialize(templateRoot, path.resolve(args[0]));
  } else {
    console.error("Usage: materialize-project-baseline.cjs <target-directory> | --stage <staging-directory> --target <target-directory> | --apply-staged <staging-directory> <target-directory>");
    process.exit(2);
  }
  console.log(JSON.stringify(result));
}

module.exports = { applyStaged, copyTreeNoClobber, destinationState, isPluginOnly, materialize };
