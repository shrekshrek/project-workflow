#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const [fromArg, toArg] = process.argv.slice(2);
if (!fromArg || !toArg) {
  console.error("Usage: node relocate-markdown-links.cjs <old-directory> <new-directory>");
  process.exit(2);
}

const fromRoot = path.resolve(fromArg);
const toRoot = path.resolve(toArg);
if (!fs.existsSync(toRoot) || !fs.statSync(toRoot).isDirectory()) {
  console.error(`Archive link relocation failed: target directory does not exist: ${toRoot}`);
  process.exit(1);
}

function walkMarkdown(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function isWithin(child, parent) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function splitSuffix(value) {
  const indexes = [value.indexOf("?"), value.indexOf("#")].filter((index) => index >= 0);
  const splitAt = indexes.length > 0 ? Math.min(...indexes) : value.length;
  return [value.slice(0, splitAt), value.slice(splitAt)];
}

function isExternalOrAnchor(value) {
  return value.startsWith("#")
    || value.startsWith("/")
    || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function relocateDestination(token, oldFile, newFile, missing) {
  const angled = token.startsWith("<") && token.endsWith(">");
  const raw = angled ? token.slice(1, -1) : token;
  if (!raw || isExternalOrAnchor(raw)) return token;

  const [relativeTarget, suffix] = splitSuffix(raw);
  if (!relativeTarget) return token;

  const oldAbsolute = path.resolve(path.dirname(oldFile), relativeTarget);
  const finalAbsolute = isWithin(oldAbsolute, fromRoot)
    ? path.join(toRoot, path.relative(fromRoot, oldAbsolute))
    : oldAbsolute;

  if (!fs.existsSync(finalAbsolute)) {
    missing.push(`${path.relative(process.cwd(), newFile)} -> ${raw}`);
  }

  let relocated = path.relative(path.dirname(newFile), finalAbsolute).split(path.sep).join("/");
  if (!relocated) relocated = ".";
  if (relativeTarget.endsWith("/") && !relocated.endsWith("/")) relocated += "/";
  const result = `${relocated}${suffix}`;
  return angled ? `<${result}>` : result;
}

function replaceInlineDestinations(content, relocate) {
  const linkStart = /!?\[[^\]\n]*\]\(/g;
  const replacements = [];
  let match;

  while ((match = linkStart.exec(content)) !== null) {
    const tokenStart = linkStart.lastIndex;
    let cursor = tokenStart;
    let tokenEnd = -1;

    if (content[cursor] === "<") {
      cursor += 1;
      while (cursor < content.length) {
        if (content[cursor] === "\\") cursor += 2;
        else if (content[cursor] === ">") {
          tokenEnd = cursor + 1;
          break;
        } else cursor += 1;
      }
    } else {
      let parentheses = 0;
      while (cursor < content.length) {
        const character = content[cursor];
        if (character === "\\") {
          cursor += 2;
          continue;
        }
        if (character === "(") parentheses += 1;
        else if (character === ")") {
          if (parentheses === 0) {
            tokenEnd = cursor;
            break;
          }
          parentheses -= 1;
        } else if (/\s/.test(character) && parentheses === 0) {
          tokenEnd = cursor;
          break;
        }
        cursor += 1;
      }
    }

    if (tokenEnd <= tokenStart) continue;
    const token = content.slice(tokenStart, tokenEnd);
    replacements.push([tokenStart, tokenEnd, relocate(token)]);
    linkStart.lastIndex = tokenEnd;
  }

  return replacements.reverse().reduce((updated, [start, end, replacement]) => (
    `${updated.slice(0, start)}${replacement}${updated.slice(end)}`
  ), content);
}

function transformOutsideInlineCode(line, transform) {
  let output = "";
  let cursor = 0;
  const backticks = /`+/g;

  while (cursor < line.length) {
    backticks.lastIndex = cursor;
    const opening = backticks.exec(line);
    if (!opening) break;

    const marker = opening[0];
    const closingPattern = /`+/g;
    closingPattern.lastIndex = backticks.lastIndex;
    let closing = closingPattern.exec(line);
    while (closing && closing[0].length !== marker.length) closing = closingPattern.exec(line);
    if (!closing) break;

    output += transform(line.slice(cursor, opening.index));
    output += line.slice(opening.index, closingPattern.lastIndex);
    cursor = closingPattern.lastIndex;
  }

  return output + transform(line.slice(cursor));
}

function transformMarkdown(content, transform) {
  let fence = null;
  return content.match(/[^\n]*\n|[^\n]+$/g)?.map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
    if (fence) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*(?:\r?\n)?$/)?.[1];
      if (closing?.[0] === fence.character && closing.length >= fence.length) fence = null;
      return line;
    }
    if (marker) {
      fence = { character: marker[0], length: marker.length };
      return line;
    }
    return transformOutsideInlineCode(line, transform);
  }).join("") ?? content;
}

const plannedWrites = [];
const missing = [];
let linksSeen = 0;
let linksChanged = 0;

for (const newFile of walkMarkdown(toRoot)) {
  const relativeFile = path.relative(toRoot, newFile);
  const oldFile = path.join(fromRoot, relativeFile);
  const original = fs.readFileSync(newFile, "utf8");

  const relocate = (token) => {
      linksSeen += 1;
      const relocated = relocateDestination(token, oldFile, newFile, missing);
      if (relocated !== token) linksChanged += 1;
      return relocated;
  };

  const updated = transformMarkdown(original, (prose) => {
    const referencesRelocated = prose.replace(/^(\s*\[[^\]]+\]:\s+)(<[^>]+>|\S+)(.*)$/gm,
      (match, prefix, token, suffix) => `${prefix}${relocate(token)}${suffix}`);
    return replaceInlineDestinations(referencesRelocated, relocate);
  });

  if (updated !== original) plannedWrites.push([newFile, updated]);
}

if (missing.length > 0) {
  console.error("Archive link relocation failed; missing local targets:");
  for (const item of [...new Set(missing)]) console.error(`- ${item}`);
  process.exit(1);
}

for (const [file, content] of plannedWrites) fs.writeFileSync(file, content);

console.log(`Archive links OK: ${linksSeen} Markdown destinations processed, ${linksChanged} relocated.`);
