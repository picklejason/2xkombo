"use client";
import { InputKey } from "./InputIcon";
import InputIcon from "./InputIcon";

type Props = {
  inputs: InputKey[];
  notation: "icons" | "numpad";
  className?: string;
  id?: string;
  showBackground?: boolean;
  size?: number;
};

export default function ComboDisplay({
  inputs,
  notation,
  className = "",
  id,
  showBackground = false,
  size = 56
}: Props) {
  return (
    <div id={id} className={`flex items-center flex-wrap ${className}`}>
      {inputs.length === 0 && (
        <span className="text-foreground/70 text-lg font-bold uppercase tracking-wide">
          CLICK BUTTONS TO BUILD YOUR COMBO...
        </span>
      )}
      {notation === "icons" ? (
        inputs.map((k, i) => (
          <InputIcon key={i} k={k} showBackground={showBackground} size={size} />
        ))
      ) : (
        convertToNotation(inputs).split(/(\s+)/).map((part, i) => {
          if (!part.trim()) {
            return <span key={i}>{part}</span>;
          }

          return (
            <span
              key={i}
              className="px-1 text-lg font-bold tracking-wide"
              style={{ textTransform: (part.startsWith('j.') || part.startsWith('w.') || part.startsWith('d.') || part.includes('jc')) ? 'none' : 'uppercase' }}
            >
              {part}
            </span>
          );
        })
      )}
    </div>
  );
}

function convertToNotation(inputs: InputKey[]): string {
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