"use client";

export type InputKey =
  | "1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"
  | "7jc"|"9jc"
  | "L"
  | "M"
  | "H"
  | "S1"
  | "S2"
  | "T"
  | "D"
  | "BD"
  | "+"
  | ">"
  | "hold"
  | "tag"
  | "air"
  | "delay"
  | "whiff"
  | "or"
  | "~";

const keyToAsset: Record<string, string> = {
  1: "/assets/1.svg",
  2: "/assets/2.svg",
  3: "/assets/3.svg",
  4: "/assets/4.svg",
  5: "/assets/5.svg",
  6: "/assets/6.svg",
  7: "/assets/7.svg",
  8: "/assets/8.svg",
  9: "/assets/9.svg",
  "7jc": "/assets/7.svg",
  "9jc": "/assets/9.svg",
  L: "/assets/L.svg",
  M: "/assets/M.svg",
  H: "/assets/H.svg",
  S1: "/assets/S1.svg",
  S2: "/assets/S2.svg",
  T: "/assets/then.svg",
  D: "/assets/dash.svg",
  BD: "/assets/back_dash.svg",
  "+": "/assets/plus.svg",
  ">": "/assets/then.svg",
  tag: "/assets/tag.svg",
};

export default function InputIcon({ k, size = 44, showBackground = true }: { k: InputKey; size?: number; showBackground?: boolean }) {
  const src = keyToAsset[k];
  const color = chipColor(k);

  // Handle special cases
  if (k === "5") {
    // Neutral (5) - invisible placeholder
    return (
      <span
        style={{
          width: size,
          height: size
        }}
      >
      </span>
    );
  }

  if (k === "air" || k === "hold" || k === "or" || k === "delay" || k === "whiff" || (!keyToAsset[k] && k !== "tag")) {
    // Text-based buttons - AIR, HOLD, OR, DELAY, WHIFF, or custom text (but not tag)
    const text = k === "air" ? "AIR" : k === "hold" ? "HOLD" : k === "or" ? "OR" : k === "delay" ? "DELAY" : k === "whiff" ? "WHIFF" : k.toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center transition ${showBackground ? 'bg-gray-800 rounded-full' : ''}`}
        style={{
          width: size,
          height: size
        }}
      >
        <span className="text-sm font-bold text-white">{text}</span>
      </span>
    );
  }

  // Handle special sizes for transition buttons only in combo display
  let buttonWidth = size;
  let buttonHeight = size;

  if (!showBackground) {
    // Only apply special sizes in combo display
    if (k === "+") {
      buttonWidth = 30;
      buttonHeight = 40;
    } else if (k === "T" || k === ">") {
      buttonWidth = 30;
      buttonHeight = 45;
    } else if (k === "~") {
      buttonWidth = 28;
      buttonHeight = 45;
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center transition ${showBackground ? color.bg : ''}`}
      style={{
        width: buttonWidth,
        height: buttonHeight
      }}
    >
      {src ? (
        <img src={src} alt={k} className="w-full h-full object-contain" />
      ) : (
        <span className="text-sm font-bold">{k}</span>
      )}
    </span>
  );
}

function chipColor(k: string): { bg: string } {
  // Icons with their own colored backgrounds don't need additional styling
  const iconsWithBackgrounds = ["L", "M", "H", "S1", "S2", "tag"];

  // Buttons that should not have backgrounds
  const noBackgroundButtons = ["1", "2", "3", "4", "6", "7", "8", "9", "7jc", "9jc", "D", "BD"];

  // Buttons that need backgrounds
  const backgroundButtons = ["+", ">", "T", "~"];

  if (iconsWithBackgrounds.includes(k) || noBackgroundButtons.includes(k)) {
    return { bg: "bg-transparent" };
  }

  if (backgroundButtons.includes(k)) {
    return { bg: "bg-gray-800 rounded-full" };
  }

  // Default no background
  return { bg: "bg-transparent" };
}


