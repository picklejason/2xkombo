import { InputKey } from "@/components/InputIcon";

export function convertToNotation(inputs: InputKey[]): string {
  const result: string[] = [];
  let i = 0;

  while (i < inputs.length) {
    const current = inputs[i];
    const next = inputs[i + 1];
    const prev = inputs[i - 1];

    if (current === "hold" && next) {
      // Skip hold, it will be handled by the next button
      i++;
      continue;
    }

    if (current === "air" && next) {
      // Handle air + hold combinations first
      if (next === "hold" && inputs[i + 2]) {
        const afterHold = inputs[i + 2];
        if (isDirectional(afterHold) && inputs[i + 3]) {
          // Air + hold + direction + button (e.g., air, hold, 6, S1)
          const dirNotation = getBasicNotation(afterHold);
          const btnNotation = getBasicNotation(inputs[i + 3]);
          if (afterHold === "5") {
            result.push(`j[${btnNotation}]`);
          } else {
            result.push(`j[${dirNotation}${btnNotation}]`);
          }
          i += 4; // Skip air, hold, direction, and button
        } else {
          // Air + hold + button directly (e.g., air, hold, S1)
          const btnNotation = getBasicNotation(afterHold);
          result.push(`j[${btnNotation}]`);
          i += 3; // Skip air, hold, and button
        }
        continue;
      }

      // Air + next button becomes j.BUTTON
      if (isDirectional(next) && inputs[i + 2]) {
        // Air + direction + button (e.g., air, 6, H)
        const dirNotation = getBasicNotation(next);
        const btnNotation = getBasicNotation(inputs[i + 2]);
        if (next === "5") {
          result.push(`j.${btnNotation}`);
        } else {
          result.push(`j.${dirNotation}${btnNotation}`);
        }
        i += 3; // Skip air, direction, and button
      } else {
        // Air + button directly
        const nextNotation = getBasicNotation(next);
        result.push(`j.${nextNotation}`);
        i += 2; // Skip air and button
      }
      continue;
    }

    if (current === "delay" && next) {
      // Delay + next button becomes dl.BUTTON
      if (isDirectional(next) && inputs[i + 2]) {
        // Delay + direction + button (e.g., delay, 6, H)
        const dirNotation = getBasicNotation(next);
        const btnNotation = getBasicNotation(inputs[i + 2]);
        if (next === "5") {
          result.push(`dl.${btnNotation}`);
        } else {
          result.push(`dl.${dirNotation}${btnNotation}`);
        }
        i += 3; // Skip delay, direction, and button
      } else {
        // Delay + button directly
        const nextNotation = getBasicNotation(next);
        result.push(`dl.${nextNotation}`);
        i += 2; // Skip delay and button
      }
      continue;
    }

    if (current === "whiff" && next) {
      // Whiff + next button becomes w.BUTTON
      if (isDirectional(next) && inputs[i + 2]) {
        // Whiff + direction + button (e.g., whiff, 6, H)
        const dirNotation = getBasicNotation(next);
        const btnNotation = getBasicNotation(inputs[i + 2]);
        if (next === "5") {
          result.push(`w.${btnNotation}`);
        } else {
          result.push(`w.${dirNotation}${btnNotation}`);
        }
        i += 3; // Skip whiff, direction, and button
      } else {
        // Whiff + button directly
        const nextNotation = getBasicNotation(next);
        result.push(`w.${nextNotation}`);
        i += 2; // Skip whiff and button
      }
      continue;
    }

    if (current === "~") {
      // Handle X~Y notation
      const nextElement = inputs[i + 1];
      const nextNext = inputs[i + 2];

      // Build the Y part
      let yPart = "";
      if (isDirectional(nextElement) && nextNext && !isDirectional(nextNext)) {
        if (nextElement === "5") {
          yPart = getBasicNotation(nextNext);
        } else {
          yPart = `${getBasicNotation(nextElement)}${getBasicNotation(nextNext)}`;
        }
        i += 3; // Skip ~, direction, button
      } else {
        yPart = getBasicNotation(nextElement);
        i += 2; // Skip ~ and next element
      }

      // Get the last added result as X part
      const xPart = result[result.length - 1];
      result[result.length - 1] = `${xPart}~${yPart}`;
      continue;
    }

    if (prev === "hold") {
      // Previous was hold, so wrap this button in brackets
      const notation = getBasicNotation(current);
      result.push(`[${notation}]`);
      i++;
      continue;
    }

    if (prev === "air" || prev === "delay" || prev === "whiff") {
      // Skip this since it was handled in air/delay/whiff logic
      i++;
      continue;
    }

    // Handle directional + hold + button combinations
    if (isDirectional(current) && next === "hold" && inputs[i + 2]) {
      const afterHold = inputs[i + 2];
      const dirNotation = getBasicNotation(current);
      const btnNotation = getBasicNotation(afterHold);

      // Special case for neutral (5)
      if (current === "5") {
        result.push(`[${btnNotation}]`);
      } else {
        result.push(`${dirNotation}[${btnNotation}]`);
      }
      i += 3; // Skip direction, hold, and button
      continue;
    }

    // Handle directional + button combinations
    if (isDirectional(current) && next && !isDirectional(next) &&
        next !== "+" && next !== "T" && next !== ">" && next !== "or" &&
        next !== "~" && next !== "hold" && next !== "air" && next !== "delay" && next !== "whiff") {

      const dirNotation = getBasicNotation(current);
      const btnNotation = getBasicNotation(next);

      // Special case for neutral (5)
      if (current === "5") {
        result.push(btnNotation);
      } else {
        result.push(`${dirNotation}${btnNotation}`);
      }
      i += 2; // Skip direction and button
      continue;
    }

    // Regular notation
    result.push(getBasicNotation(current));
    i++;
  }

  return result.join("").replace(/\s{2,}/g, ' ').trim();
}

export function parseNotation(notation: string): InputKey[] {
  const result: InputKey[] = [];
  const tokens = notation.trim().split(/\s+/);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    // Handle directional + jc combinations (e.g., "7 jc", "9 jc")
    if ((token === "7" || token === "9") && (nextToken && nextToken.toLowerCase() === "jc")) {
      result.push(`${token}jc` as InputKey);
      i++; // Skip the next token since we processed it
      continue;
    }

    if (token.includes('~')) {
      // Handle X~Y~Z... notation (multiple tildes)
      const parts = token.split('~');
      for (let j = 0; j < parts.length; j++) {
        if (j > 0) {
          result.push("~");
        }
        result.push(...parseToken(parts[j]));
      }
    } else if (token.includes('/')) {
      // Handle X/Y notation (or)
      const [x, y] = token.split('/');
      result.push(...parseToken(x));
      result.push("or");
      result.push(...parseToken(y));
    } else if (token.startsWith('j[') && token.endsWith(']')) {
      // Handle j[X] notation (air + hold)
      result.push("air");
      result.push("hold");
      result.push(...parseToken(token.slice(2, -1)));
    } else if (token.startsWith('j.') || token.startsWith('J.')) {
      // Handle j.X or J.X notation
      result.push("air");
      result.push(...parseToken(token.substring(2)));
    } else if (token.startsWith('j') || token.startsWith('J')) {
      // Handle jX notation (without dot)
      result.push("air");
      result.push(...parseToken(token.substring(1)));
    } else if (token.startsWith('dl.') || token.startsWith('DL.') || token.startsWith('d.') || token.startsWith('D.')) {
      // Handle dl.X, DL.X, d.X, or D.X notation
      result.push("delay");
      const prefixLength = token.startsWith('dl.') || token.startsWith('DL.') ? 3 : 2;
      result.push(...parseToken(token.substring(prefixLength)));
    } else if (token.startsWith('w.') || token.startsWith('W.')) {
      // Handle w.X or W.X notation
      result.push("whiff");
      result.push(...parseToken(token.substring(2)));
    } else if (token.startsWith('[') && token.endsWith(']')) {
      // Handle [X] notation
      result.push("hold");
      result.push(...parseToken(token.slice(1, -1)));
    } else if (token.includes('[') && token.endsWith(']')) {
      // Handle Y[X] notation (direction + hold)
      const bracketIndex = token.indexOf('[');
      const beforeBracket = token.substring(0, bracketIndex);
      const insideBracket = token.slice(bracketIndex + 1, -1);

      if (beforeBracket) {
        result.push(...parseToken(beforeBracket));
      }
      result.push("hold");
      result.push(...parseToken(insideBracket));
    } else if (token === '+' || token === '>' || token === 'OR' || token === 'or' || token === '/' || token === ',') {
      // Handle connectors
      result.push(reverseNotation(token));
    } else if (token.toLowerCase() === 'jc') {
      // Handle standalone "jc" - keep as "jc" for numpad display but treat as directional for icons
      result.push("jc");
    } else {
      // Handle complex tokens like 2H, 6H, 9, etc.
      result.push(...parseToken(token));
    }
  }

  return result;
}

function parseToken(token: string): InputKey[] {
  // Handle tokens ending with comma (e.g., "M,", "S2,")
  if (token.endsWith(',')) {
    const baseToken = token.slice(0, -1);
    return [...parseToken(baseToken), ","];
  }

  // Handle special cases first
  if (token === "66") {
    return ["D"]; // Dash button
  }
  if (token === "44") {
    return ["BD"]; // Backdash button
  }

  // Handle standalone 7 or 9 as jump cancels
  if (token === "7") {
    return ["7jc"];
  }
  if (token === "9") {
    return ["9jc"];
  }

  // Handle jump cancel patterns for combined tokens (e.g., "7jc", "9jc")
  if (token.toLowerCase().endsWith("jc")) {
    const direction = token.replace(/jc/i, "");
    if (direction === "7") {
      return ["7jc"];
    } else if (direction === "9") {
      return ["9jc"];
    }
    // Don't handle standalone "jc" here - it's handled in parseNotation
  }

  // Handle directional + button combinations
  if (token.length > 1) {
    const firstChar = token[0];
    const rest = token.substring(1);

    // Check if first character is a direction (1-9)
    if (/[1-9]/.test(firstChar)) {
      // Special case: 5X (neutral) should just be X
      if (firstChar === "5") {
        const button = reverseNotation(rest);
        return [button];
      }

      const direction = reverseNotation(firstChar);
      const button = reverseNotation(rest);
      return [direction, button];
    }
  }

  // Single token
  return [reverseNotation(token)];
}

function reverseNotation(notation: string): InputKey {
  const lowerNotation = notation.toLowerCase();
  const map: Record<string, InputKey> = {
    "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
    "7jc": "7jc", "9jc": "9jc",
    "l": "L", "m": "M", "h": "H", "s1": "S1", "s2": "S2",
    "+": "+", "66": "D", "44": "BD", ">": ">", "tag": "tag", "or": "or", "/": "or", "~": "~",
    "dl": "delay", "d": "delay", ",": ","
  };
  return map[lowerNotation] || notation as InputKey;
}

function isDirectional(k: InputKey): boolean {
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "7jc", "9jc", "jc"].includes(k);
}

function getBasicNotation(k: InputKey): string {
  switch(k){
    case "1": return "1";
    case "2": return "2";
    case "3": return "3";
    case "4": return "4";
    case "5": return "5";
    case "6": return "6";
    case "7": return "7";
    case "8": return "8";
    case "9": return "9";
    case "7jc": return "7jc";
    case "9jc": return "9jc";
    case "jc": return "jc";
    case "L": return "L";
    case "M": return "M";
    case "H": return "H";
    case "S1": return "S1";
    case "S2": return "S2";
    case "+": return " + ";
    case "D": return "66";
    case "BD": return "44";
    case ">": return " > ";
    case "tag": return "TAG";
    case "or": return "/";
    case "air": return "j.";
    case "delay": return "d.";
    case "whiff": return "w.";
    case "hold": return "[HOLD]";
    case "~": return "~";
    default: return k.toUpperCase(); // Everything else uppercase by default
  }
}
