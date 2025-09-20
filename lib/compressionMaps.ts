import { InputKey } from "@/components/InputIcon";
import { characters } from "./characters";

/**
 * Single source of truth for all compression mappings
 * When you add new inputs or characters, just add them to these arrays
 * and the compression will automatically handle them
 */

// All possible inputs in order of frequency (most common first for better compression)
export const ALL_INPUTS: InputKey[] = [
  // Most common directional inputs
  "6", "2", "4", "8", "1", "3", "7", "9", "5",
  // Most common attack buttons
  "H", "M", "L", "S1", "S2", "T",
  // Common connectors
  "+", ">", "~",
  // Movement
  "D", "BD",
  // Modifiers (less common)
  "air", "delay", "whiff", "hold", "tag", "or",
  // Jump cancels (least common)
  "7jc", "9jc", "jc"
];

// Difficulty levels in order
export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

// Common tags in order of frequency
export const COMMON_TAGS = [
  "BnB", "Midscreen", "Corner", "Combo", "Punish", 
  "Anti-air", "Setup", "Mixup", "Overhead", "Low"
] as const;

/**
 * Auto-generated compression maps
 * These are created automatically from the arrays above
 */

// Character compression (using existing character data)
export const CHARACTER_COMPRESS_MAP = Object.fromEntries(
  characters.map((char, index) => [char.id, index.toString(36)])
);

export const CHARACTER_DECOMPRESS_MAP = Object.fromEntries(
  characters.map((char, index) => [index.toString(36), char.id])
);

// Input compression (using single characters/numbers efficiently)
export const INPUT_COMPRESS_MAP: Record<InputKey, string> = (() => {
  const map: Record<string, string> = {};
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
  ALL_INPUTS.forEach((input, index) => {
    if (index < chars.length) {
      map[input] = chars[index];
    } else {
      // Fallback for overflow (shouldn't happen with current input count)
      map[input] = `z${index}`;
    }
  });
  
  return map as Record<InputKey, string>;
})();

export const INPUT_DECOMPRESS_MAP = Object.fromEntries(
  Object.entries(INPUT_COMPRESS_MAP).map(([key, value]) => [value, key])
);

// Difficulty compression
export const DIFFICULTY_COMPRESS_MAP = Object.fromEntries(
  DIFFICULTIES.map((diff, index) => [diff, index.toString(36)])
);

export const DIFFICULTY_DECOMPRESS_MAP = Object.fromEntries(
  DIFFICULTIES.map((diff, index) => [index.toString(36), diff])
);

// Tag compression
export const TAG_COMPRESS_MAP = Object.fromEntries(
  COMMON_TAGS.map((tag, index) => [tag, index.toString(36)])
);

export const TAG_DECOMPRESS_MAP = Object.fromEntries(
  COMMON_TAGS.map((tag, index) => [index.toString(36), tag])
);

/**
 * Helper functions to validate mappings
 */
export function validateMappings() {
  const issues: string[] = [];
  
  // Check for input mapping collisions
  const inputValues = Object.values(INPUT_COMPRESS_MAP);
  const uniqueInputValues = new Set(inputValues);
  if (inputValues.length !== uniqueInputValues.size) {
    issues.push("Input mapping collision detected");
  }
  
  // Check if all inputs are covered
  const unmappedInputs = ALL_INPUTS.filter(input => !INPUT_COMPRESS_MAP[input]);
  if (unmappedInputs.length > 0) {
    issues.push(`Unmapped inputs: ${unmappedInputs.join(", ")}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Export validation result for development
if (process.env.NODE_ENV === 'development') {
  const validation = validateMappings();
  if (!validation.isValid) {
    console.warn("❌ Compression mapping issues:", validation.issues);
  } else {
    console.log("✅ All compression mappings valid");
  }
}
