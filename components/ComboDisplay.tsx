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
