import { InputKey } from "@/components/InputIcon";
import {
  CHARACTER_COMPRESS_MAP,
  CHARACTER_DECOMPRESS_MAP,
  INPUT_COMPRESS_MAP,
  INPUT_DECOMPRESS_MAP,
  DIFFICULTY_COMPRESS_MAP,
  DIFFICULTY_DECOMPRESS_MAP,
  TAG_COMPRESS_MAP,
  TAG_DECOMPRESS_MAP
} from "./compressionMaps";

export interface ComboShareData {
  inputs?: InputKey[];
  name?: string;
  difficulty?: string;
  damage?: number;
  tags?: string;
  characterId?: string;
}

/**
 * Simple, maintainable URL compression using JSON + LZ-style compression
 * This approach is much easier to maintain while still achieving good compression
 */
export function encodeShareUrl(data: ComboShareData): string {
  // Clean the data (remove undefined/null/empty values)
  const cleanData: Partial<ComboShareData> = {};
  
  if (data.inputs?.length) cleanData.inputs = data.inputs;
  if (data.name?.trim()) cleanData.name = data.name.trim();
  if (data.difficulty?.trim()) cleanData.difficulty = data.difficulty.trim();
  if (data.damage && data.damage > 0) cleanData.damage = data.damage;
  if (data.tags?.trim()) cleanData.tags = data.tags.trim();
  if (data.characterId?.trim()) cleanData.characterId = data.characterId.trim();

  // Convert to JSON and compress using simple string replacements
  const jsonString = JSON.stringify(cleanData);
  const compressed = compressString(jsonString);
  
  // Encode with URL-safe base64
  const encoded = btoa(compressed).replace(/[+/=]/g, char => {
    switch (char) {
      case '+': return '-';
      case '/': return '_';
      case '=': return '';
      default: return char;
    }
  });

  return encoded;
}

export function decodeShareUrl(encoded: string): ComboShareData | null {
  try {
    // Reverse URL-safe base64
    const base64 = encoded.replace(/[-_]/g, char => char === '-' ? '+' : '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const compressed = atob(padded);
    
    // Decompress and parse JSON
    const jsonString = decompressString(compressed);
    const data = JSON.parse(jsonString);
    
    return data as ComboShareData;
  } catch (error) {
    console.error("Failed to decode share URL:", error);
    return null;
  }
}

export function generateShareUrl(data: ComboShareData): string {
  const encoded = encodeShareUrl(data);
  const shareUrl = new URL(window.location.origin);
  shareUrl.searchParams.set('s', encoded);
  return shareUrl.toString();
}

/**
 * Aggressive compression using single source of truth mappings
 * Auto-scales when new inputs/characters are added to compressionMaps.ts
 */
function compressString(str: string): string {
  const data = JSON.parse(str);
  const parts: string[] = [];
  
  // Part 1: Character ID (using auto-generated mapping)
  parts.push(CHARACTER_COMPRESS_MAP[data.characterId] || 'z');
  
  // Part 2: Inputs (using auto-generated mapping)
  if (data.inputs?.length) {
    const compressedInputs = data.inputs.map((input: string) => 
      INPUT_COMPRESS_MAP[input as InputKey] || 'X'
    ).join('');
    parts.push(compressedInputs);
  } else {
    parts.push('');
  }
  
  // Part 3: Difficulty (using auto-generated mapping)
  parts.push(DIFFICULTY_COMPRESS_MAP[data.difficulty] || '');
  
  // Part 4: Damage (base36)
  parts.push(data.damage ? data.damage.toString(36) : '');
  
  // Part 5: Tags (using auto-generated mapping)
  if (data.tags) {
    const compressedTags = data.tags.split(',').map((tag: string) => {
      const trimmed = tag.trim();
      return TAG_COMPRESS_MAP[trimmed] || trimmed;
    }).join(',');
    parts.push(encodeURIComponent(compressedTags));
  } else {
    parts.push('');
  }
  
  // Part 6: Name (encoded)
  parts.push(data.name ? encodeURIComponent(data.name) : '');
  
  return parts.join('|');
}

/**
 * Decompress using single source of truth mappings
 * Auto-scales when new inputs/characters are added to compressionMaps.ts
 */
function decompressString(str: string): string {
  const parts = str.split('|');
  if (parts.length !== 6) throw new Error('Invalid format');
  
  const [charCode, inputsStr, diffCode, damageStr, tagsStr, nameStr] = parts;
  const result: ComboShareData = {};
  
  // Reverse character mapping (using auto-generated mapping)
  if (charCode && charCode !== 'z') {
    result.characterId = CHARACTER_DECOMPRESS_MAP[charCode];
  }
  
  // Reverse inputs (using auto-generated mapping)
  if (inputsStr) {
    result.inputs = inputsStr.split('').map(char => 
      INPUT_DECOMPRESS_MAP[char] || char
    ) as InputKey[];
  }
  
  // Reverse difficulty (using auto-generated mapping)
  if (diffCode) {
    result.difficulty = DIFFICULTY_DECOMPRESS_MAP[diffCode];
  }
  
  // Reverse damage
  if (damageStr) {
    result.damage = parseInt(damageStr, 36);
  }
  
  // Reverse tags (using auto-generated mapping)
  if (tagsStr) {
    const decodedTags = decodeURIComponent(tagsStr);
    const expandedTags = decodedTags.split(',').map(tag => {
      const trimmed = tag.trim();
      return TAG_DECOMPRESS_MAP[trimmed] || trimmed;
    }).join(', ');
    result.tags = expandedTags;
  }
  
  // Reverse name
  if (nameStr) {
    result.name = decodeURIComponent(nameStr);
  }
  
  return JSON.stringify(result);
}