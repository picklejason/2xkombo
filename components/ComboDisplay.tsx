"use client";
import { InputKey } from "./InputIcon";
import InputIcon from "./InputIcon";
import { convertToNotation } from "@/lib/notation";

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
  // Function to get size for each input, making directional inputs smaller
  const getInputSize = (k: InputKey) => {
    const isDirectional = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "7jc", "9jc", "jc"].includes(k);
    return isDirectional ? 50 : size;
  };
  return (
    <div id={id} className={`flex items-center flex-wrap gap-y-4 ${className}`}>
      {inputs.length === 0 && (
        <span className="text-foreground/70 text-lg font-bold uppercase tracking-wide">
          CLICK BUTTONS TO BUILD YOUR COMBO...
        </span>
      )}
      {notation === "icons" ? (
        inputs.map((k, i) => {
          // Check if this input should show hold overlay (previous input was "hold")
          const isHeld = i > 0 && inputs[i - 1] === "hold";
          // Skip rendering the "hold" input itself since it's now shown as overlay
          if (k === "hold") return null;

          return (
            <InputIcon key={i} k={k} showBackground={showBackground} size={getInputSize(k)} isHeld={isHeld} />
          );
        })
      ) : (
        convertToNotation(inputs).split(/(\s+)/).map((part, i) => {
          if (!part.trim()) {
            return <span key={i}>{part}</span>;
          }

          return (
            <span
              key={i}
              className="px-1 text-lg font-bold tracking-wide"
              style={{ textTransform: (part.startsWith('j.') || part.startsWith('j[') || part.startsWith('w.') || part.startsWith('d.') || part.includes('jc')) ? 'none' : 'uppercase' }}
            >
              {part}
            </span>
          );
        })
      )}
    </div>
  );
}
