"use client";
import Image from "next/image";

// Size constants for combo display optimization
const COMBO_DISPLAY_SIZES = {
  air: { width: 30, height: 40 },
  or: { width: 24, height: 40 },
  "~": { width: 16, height: 40 },
  delay: { width: 44, height: 40 },
  whiff: { width: 44, height: 40 },
  "+": { width: 32, height: 40 },
  ">": { width: 36, height: 40 },
} as const;

// Text labels for special inputs
const INPUT_LABELS = {
  air: "AIR",
  hold: "HOLD",
  or: "OR",
  delay: "DELAY",
  whiff: "WHIFF",
  "~": "~",
} as const;

export type InputKey =
  | "1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"
  | "7jc"|"9jc"|"jc"
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
  "jc": "/assets/9.svg",
  L: "/assets/L.svg",
  M: "/assets/M.svg",
  H: "/assets/H.svg",
  S1: "/assets/S1.svg",
  S2: "/assets/S2.svg",
  D: "/assets/dash.svg",
  BD: "/assets/back_dash.svg",
  "+": "/assets/plus.svg",
  ">": "/assets/then.svg",
  tag: "/assets/tag.svg",
};

// Helper function to get optimized size for combo display and buttons
function getDisplaySize(key: InputKey, defaultSize: number, showBackground: boolean) {
  if (showBackground || !(key in COMBO_DISPLAY_SIZES)) {
    return { width: defaultSize, height: defaultSize };
  }
  return COMBO_DISPLAY_SIZES[key as keyof typeof COMBO_DISPLAY_SIZES];
}

// Helper function to check if input should be text-based
function isTextBasedInput(key: InputKey): boolean {
  return key in INPUT_LABELS || (!keyToAsset[key] && key !== "tag");
}

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

  if (isTextBasedInput(k)) {
    // Text-based buttons
    const text = (k in INPUT_LABELS) ? INPUT_LABELS[k as keyof typeof INPUT_LABELS] : k.toUpperCase();
    const { width, height } = getDisplaySize(k, size, showBackground);

    return (
      <span
        className={`inline-flex items-center justify-center transition ${showBackground ? 'bg-gray-800 rounded-full' : ''}`}
        style={{ width, height }}
      >
        <span className="text-sm font-bold text-white">{text}</span>
      </span>
    );
  }

  // Icon-based inputs
  const { width, height } = getDisplaySize(k, size, showBackground);

  // Make the ">" image slightly smaller while keeping container the same size
  const imageWidth = k === ">" && showBackground ? width * 0.75 : width;
  const imageHeight = k === ">" && showBackground ? height * 0.75 : height;

  return (
    <span
      className={`inline-flex items-center justify-center transition ${showBackground ? color.bg : ''}`}
      style={{ width, height }}
    >
      {src ? (
        <Image src={src} alt={k} width={imageWidth} height={imageHeight} className="object-contain" />
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
  const backgroundButtons = ["+", ">", "~"];

  if (iconsWithBackgrounds.includes(k) || noBackgroundButtons.includes(k)) {
    return { bg: "bg-transparent" };
  }

  if (backgroundButtons.includes(k)) {
    return { bg: "bg-gray-800 rounded-full" };
  }

  // Default no background
  return { bg: "bg-transparent" };
}


