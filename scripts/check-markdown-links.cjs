#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const requested = process.argv.slice(2);
// Rendered templates may intentionally link from their post-copy destination, so validate
// source/runtime docs by default and cover template structure with dedicated contract tests.
const roots = (requested.length > 0
  ? requested
  : [
    "README.md",
    "AGENTS.md",
    "agents",
    "skills",
    "docs",
    "plugins/project-workflow/docs",
    "plugins/project-workflow/skills",
  ]
).map((value) => path.resolve(repoRoot, value));

function walkMarkdown(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith(".md") ? [target] : [];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => (
    walkMarkdown(path.join(target, entry.name))
  ));
}

function maskInlineCode(line) {
  let masked = "";
  let cursor = 0;
  const backticks = /`+/g;
  let index = 0;

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

    masked += line.slice(cursor, opening.index);
    masked += `\u0000PW_INLINE_CODE_${index}\u0000`;
    index += 1;
    cursor = closingPattern.lastIndex;
  }

  return masked + line.slice(cursor);
}

function markdownProse(content) {
  let fence = null;
  return content.match(/[^\n]*\n|[^\n]+$/g)?.map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
    if (fence) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*(?:\r?\n)?$/)?.[1];
      if (closing?.[0] === fence.character && closing.length >= fence.length) fence = null;
      return "";
    }
    if (marker) {
      fence = { character: marker[0], length: marker.length };
      return "";
    }
    return maskInlineCode(line);
  }).join("") ?? content;
}

function inlineDestinations(content) {
  const destinations = [];
  const linkStart = /!?\[[^\]\n]*\]\(/g;
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

    if (tokenEnd > tokenStart) destinations.push(content.slice(tokenStart, tokenEnd));
    linkStart.lastIndex = tokenEnd > tokenStart ? tokenEnd : linkStart.lastIndex;
  }

  return destinations;
}

function splitSuffix(value) {
  const indexes = [value.indexOf("?"), value.indexOf("#")].filter((index) => index >= 0);
  const splitAt = indexes.length > 0 ? Math.min(...indexes) : value.length;
  return value.slice(0, splitAt);
}

function isExternalOrAnchor(value) {
  return value.startsWith("#")
    || value.startsWith("/")
    || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

const files = roots.flatMap(walkMarkdown);
const missing = [];
let checked = 0;

for (const file of files) {
  const prose = markdownProse(fs.readFileSync(file, "utf8"));
  const references = [...prose.matchAll(/^\s*\[[^\]]+\]:\s+(<[^>]+>|\S+)/gm)].map((match) => match[1]);

  for (const token of [...inlineDestinations(prose), ...references]) {
    const angled = token.startsWith("<") && token.endsWith(">");
    let destination = angled ? token.slice(1, -1) : token;
    if (!destination || isExternalOrAnchor(destination)) continue;
    destination = splitSuffix(destination);
    if (!destination) continue;
    try {
      destination = decodeURIComponent(destination);
    } catch {
      missing.push(`${path.relative(repoRoot, file)} -> malformed URI ${token}`);
      continue;
    }

    checked += 1;
    const resolved = path.resolve(path.dirname(file), destination);
    if (!fs.existsSync(resolved)) {
      missing.push(`${path.relative(repoRoot, file)} -> ${token}`);
    }
  }
}

if (missing.length > 0) {
  console.error("Missing local Markdown targets:");
  for (const item of [...new Set(missing)]) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Markdown links OK: ${checked} local destinations across ${files.length} files.`);
