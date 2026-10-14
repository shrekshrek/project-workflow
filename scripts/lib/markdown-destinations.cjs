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

function referencedDestinations(content) {
  const prose = markdownProse(content);
  const normalize = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const definitions = new Map();
  const body = prose.replace(/^ {0,3}\[([^\]]+)\]:\s*(<[^>]+>|\S+).*$/gm, (_, label, target) => {
    definitions.set(normalize(label), target);
    return "";
  });
  const destinations = inlineDestinations(body);
  for (const match of body.matchAll(/!?\[([^\]\n]+)\](?:\[([^\]\n]*)\])?(?!\()/g)) {
    const target = definitions.get(normalize(match[2] || match[1]));
    if (target) destinations.push(target);
  }
  return destinations;
}

module.exports = { markdownProse, inlineDestinations, referencedDestinations };
