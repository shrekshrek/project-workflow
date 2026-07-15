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
    "adapters/claude/agents",
    "adapters/claude/skills",
    "adapters/codex/skills",
    "docs",
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

function splitTarget(value) {
  const query = value.indexOf("?");
  const hash = value.indexOf("#");
  const indexes = [query, hash].filter((index) => index >= 0);
  const splitAt = indexes.length > 0 ? Math.min(...indexes) : value.length;
  const fragmentEnd = hash >= 0 && query > hash ? query : value.length;
  return {
    path: value.slice(0, splitAt),
    fragment: hash >= 0 ? value.slice(hash + 1, fragmentEnd) : null,
  };
}

function isExternal(value) {
  return value.startsWith("/")
    || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function headingSlug(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, "")
    .replace(/\s/g, "-");
}

const anchorCache = new Map();
function markdownAnchors(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const anchors = new Set();
  const counts = new Map();
  let fence = null;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
    if (fence) {
      if (marker?.[0] === fence.character && marker.length >= fence.length) fence = null;
      continue;
    }
    if (marker) {
      fence = { character: marker[0], length: marker.length };
      continue;
    }
    for (const match of line.matchAll(/<a\s+(?:name|id)=["']([^"']+)["'][^>]*>/gi)) anchors.add(match[1]);
    const heading = line.match(/^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/)?.[1];
    if (!heading) continue;
    const base = headingSlug(heading);
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    anchors.add(seen === 0 ? base : `${base}-${seen}`);
  }
  anchorCache.set(file, anchors);
  return anchors;
}

const files = roots.flatMap(walkMarkdown);
const missing = [];
let checked = 0;
let checkedFragments = 0;

for (const file of files) {
  const prose = markdownProse(fs.readFileSync(file, "utf8"));
  const references = [...prose.matchAll(/^\s*\[[^\]]+\]:\s+(<[^>]+>|\S+)/gm)].map((match) => match[1]);

  for (const token of [...inlineDestinations(prose), ...references]) {
    const angled = token.startsWith("<") && token.endsWith(">");
    let destination = angled ? token.slice(1, -1) : token;
    if (!destination || isExternal(destination)) continue;
    const target = splitTarget(destination);
    try {
      target.path = decodeURIComponent(target.path);
      if (target.fragment !== null) target.fragment = decodeURIComponent(target.fragment);
    } catch {
      missing.push(`${path.relative(repoRoot, file)} -> malformed URI ${token}`);
      continue;
    }

    checked += 1;
    const resolved = target.path ? path.resolve(path.dirname(file), target.path) : file;
    if (!fs.existsSync(resolved)) {
      missing.push(`${path.relative(repoRoot, file)} -> ${token}`);
      continue;
    }
    if (target.fragment && resolved.endsWith(".md")) {
      checkedFragments += 1;
      if (!markdownAnchors(resolved).has(target.fragment)) {
        missing.push(`${path.relative(repoRoot, file)} -> ${token} (missing fragment)`);
      }
    }
  }
}

if (missing.length > 0) {
  console.error("Missing local Markdown targets:");
  for (const item of [...new Set(missing)]) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Markdown links OK: ${checked} local destinations (${checkedFragments} fragments) across ${files.length} files.`);
