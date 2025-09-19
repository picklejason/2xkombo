"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputIcon, { InputKey } from "./InputIcon";
import ComboDisplay from "./ComboDisplay";
import { createClient } from "@/utils/supabase/client";
import { characters } from "@/lib/characters";
import { useAuth } from "@/lib/AuthContext";

const directionalInputs: InputKey[] = ["7","8","9","4","5","6","1","2","3"];
const row1Inputs: InputKey[] = ["L","M","H","tag","air"];
const row2Inputs: InputKey[] = ["S1","S2","D","BD","delay"];
const row3Inputs: InputKey[] = ["+",">","~","or","whiff"];

type Combo = {
  id: string;
  name: string;
  inputs: InputKey[];
  difficulty: string;
  damage: string;
  tags: string[];
  character_id: string;
  completed?: boolean;
};

type Props = {
  characterId?: string;
  editingCombo?: Combo | null;
  onSave?: () => void;
};

export default function ComboBuilder({ characterId, editingCombo, onSave }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [inputs, setInputs] = useState<InputKey[]>([]);
  const [notation, setNotation] = useState<"icons"|"numpad">("icons");
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ name: "", difficulty: "", damage: "", tags: "", characterId: characterId || "" });
  const [toast, setToast] = useState<{message: string; visible: boolean}>({message: "", visible: false});
  const [importText, setImportText] = useState("");
  const [cameFromCharacterPage, setCameFromCharacterPage] = useState<string | null>(null);
  const supabase = createClient();

  const handleBack = () => {
    if (cameFromCharacterPage) {
      const selectedCharacter = characters.find(char => char.id === cameFromCharacterPage);
      if (selectedCharacter) {
        router.push(`/c/${selectedCharacter.slug}`);
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Load editing combo data or shared parameters
  useEffect(() => {
    if (editingCombo) {
      setInputs(editingCombo.inputs || []);
      setMeta({
        name: editingCombo.name || "",
        difficulty: editingCombo.difficulty || "",
        damage: editingCombo.damage || "",
        tags: (editingCombo.tags || []).join(", "),
        characterId: editingCombo.character_id || characterId || ""
      });
    } else {
      // Load from URL parameters for sharing (client-side only)
      const urlParams = new URLSearchParams(window.location.search);
      
      // Also detect if we came from a character page
      const characterParam = urlParams.get('character');
      setCameFromCharacterPage(characterParam);

      // Check for new compressed format first
      const compressedData = urlParams.get('c');
      if (compressedData) {
        try {
          const jsonString = decodeURIComponent(escape(atob(compressedData)));
          const comboData = JSON.parse(jsonString);

          if (comboData.inputs) {
            setInputs(comboData.inputs);
          }

          setMeta(prev => ({
            ...prev,
            name: comboData.name || prev.name,
            difficulty: comboData.difficulty || prev.difficulty,
            damage: comboData.damage || prev.damage,
            tags: comboData.tags || prev.tags,
            characterId: comboData.characterId || prev.characterId
          }));
        } catch (error) {
          console.error('Failed to parse shared combo data:', error);
          showToast("Invalid share link format!");
        }
      } else {
        // Fallback to old format for backward compatibility
        const sharedInputs = urlParams.get('inputs');
        if (sharedInputs) {
          try {
            const parsedInputs = JSON.parse(sharedInputs);
            setInputs(parsedInputs);
          } catch (error) {
            console.error('Failed to parse shared inputs:', error);
          }
        }

        const sharedName = urlParams.get('name');
        const sharedDifficulty = urlParams.get('difficulty');
        const sharedTags = urlParams.get('tags');

        const sharedDamage = urlParams.get('damage');

        if (sharedName || sharedDifficulty || sharedDamage || sharedTags) {
          setMeta(prev => ({
            ...prev,
            name: sharedName || prev.name,
            difficulty: sharedDifficulty || prev.difficulty,
            damage: sharedDamage || prev.damage,
            tags: sharedTags || prev.tags
          }));
        }
      }
    }
  }, [editingCombo, characterId]);

  function add(k: InputKey) { setInputs((a)=>[...a,k]); }
  function undo() { setInputs((a)=>a.slice(0,-1)); }
  function reset() { setInputs([]); }

  function showToast(message: string) {
    setToast({message, visible: true});
    setTimeout(() => setToast({message: "", visible: false}), 3000);
  }

  function copyNotation() {
    const numpadText = convertToNotation(inputs);
    navigator.clipboard.writeText(numpadText);
    showToast(`Copied: ${numpadText}`);
  }

  function shareCombo() {
    const comboData = {
      inputs: inputs.length > 0 ? inputs : undefined,
      name: meta.name || undefined,
      difficulty: meta.difficulty || undefined,
      damage: meta.damage || undefined,
      tags: meta.tags || undefined,
      characterId: meta.characterId || undefined
    };

    // Remove undefined values to minimize payload
    const cleanData = Object.fromEntries(
      Object.entries(comboData).filter(([, value]) => value !== undefined)
    );

    // Compress the data using base64 encoding
    const jsonString = JSON.stringify(cleanData);
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));

    const shareUrl = new URL(window.location.origin);
    shareUrl.searchParams.set('c', encodedData);

    navigator.clipboard.writeText(shareUrl.toString());
    showToast("Share link copied to clipboard!");
  }

  function importNotation() {
    try {
      const parsed = parseNotation(importText);
      setInputs(parsed);
      setImportText("");
      showToast("Combo imported successfully!");
    } catch {
      showToast("Invalid notation format!");
    }
  }

  async function saveAsImage() {
    try {
      const comboElement = document.getElementById('combo-display');
      if (!comboElement) {
        alert("Combo display not found");
        return;
      }

      // Dynamic import for html-to-image
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(comboElement, {
        backgroundColor: '#111111',
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'combo.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Save as image failed:', error);
      showToast("Failed to save image. Please try again.");
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (!user) {
        showToast("Please log in to save combos");
        setSaving(false);
        return;
      }
      if (!meta.characterId) {
        showToast("Please select a champion");
        setSaving(false);
        return;
      }
      if (inputs.length === 0) {
        showToast("Please add some inputs to the combo");
        setSaving(false);
        return;
      }

      console.log("Saving combo with user:", user.id);

      const comboData = {
        character_id: meta.characterId,
        user_id: user.id,
        inputs,
        name: meta.name || null,
        difficulty: meta.difficulty || null,
        damage: meta.damage || null,
        tags: meta.tags ? meta.tags.split(/[,\s]+/).filter(Boolean) : [],
      };

      console.log("Combo data:", comboData);

      if (editingCombo) {
        // Update existing combo
        const updateData = { ...comboData };
        delete (updateData as { user_id?: string }).user_id; // Don't change ownership

        const { error } = await supabase
          .from("combos")
          .update(updateData)
          .eq("id", editingCombo.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        showToast("Combo updated!");
      } else {
        // Create new combo
        const { error } = await supabase
          .from("combos")
          .insert(comboData);

        if (error) {
          console.error("Insert combo error:", error);
          throw error;
        }

        console.log("Combo created successfully");
        showToast("Combo saved!");

        // Navigate to character page after saving
        const selectedCharacter = characters.find(char => char.id === meta.characterId);
        if (selectedCharacter) {
          setTimeout(() => {
            router.push(`/c/${selectedCharacter.slug}`);
          }, 1000); // Wait 1 second to show the toast
        }
      }

      reset();
      if (onSave) onSave();
    } catch (e: unknown) {
      console.error("Save failed:", e);
      showToast(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {cameFromCharacterPage && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="brutal-btn brutal-btn--secondary px-4 py-2 text-sm"
              aria-label="Go back to character page"
            >
              ← BACK
            </button>
          </div>
        </div>
      )}

      <div className="panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="neon-title text-xl md:text-2xl lg:text-3xl font-black tracking-wider text-center md:text-left">
            {editingCombo ? "EDIT COMBO" : "COMBO BUILDER"}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <span className="text-lg font-bold text-foreground uppercase tracking-wider text-center sm:text-left">NOTATION</span>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                className={`brutal-btn ${notation==="icons" ? "brutal-btn--primary" : "brutal-btn--secondary"} px-4 py-2 text-sm flex-1 sm:flex-none`}
                onClick={()=>setNotation("icons")}
              >
                ICON
              </button>
              <button
                className={`brutal-btn ${notation==="numpad" ? "brutal-btn--primary" : "brutal-btn--secondary"} px-4 py-2 text-sm flex-1 sm:flex-none`}
                onClick={()=>setNotation("numpad")}
              >
                NUMPAD
              </button>
            </div>
          </div>
        </div>

        <ComboDisplay
          inputs={inputs}
          notation={notation}
          className="combo-display-area min-h-[150px] bg-background border-4 border-brutal-border box-shadow-brutal p-4 mb-4"
          id="combo-display"
          showBackground={false}
          size={56}
        />
      </div>

      <div className="panel p-2 lg:p-4 combo-builder-container">
        <div className="flex flex-col gap-6 input-grid">
          {/* Input Buttons Section - Mobile Optimized Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 min-h-full">
            {/* Input Controls */}
            <div className="flex flex-col md:flex-row lg:flex-row gap-4 w-full lg:w-auto items-center justify-center">
              {/* Directional Inputs - Side by side on desktop, stacked on mobile */}
              <div className="flex justify-center items-center">
                <div className="grid grid-cols-3 gap-2 input-row justify-items-center">
                  {directionalInputs.map((k)=> (
                    <button
                      key={k}
                      className="input-button p-1 lg:p-2 hover:transform hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
                      style={{ width: '80px', height: '80px' }}
                      onClick={()=>add(k)}
                    >
                      <InputIcon k={k} size={64} />
                    </button>
                  ))}
                </div>
              </div>

              {/* All Other Buttons - Responsive Layout */}
              <div className="flex justify-center items-center">
                <div className="grid grid-cols-5 gap-2 justify-items-center">
                  {/* Row 1: L M H Tag AIR */}
                  {row1Inputs.map((k)=> (
                    <button
                      key={k}
                      className="input-button p-1 lg:p-2 hover:transform hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
                      style={{ width: '80px', height: '80px' }}
                      onClick={()=>add(k)}
                    >
                      <InputIcon k={k} size={64} />
                    </button>
                  ))}

                  {/* Row 2: S1 S2 Dash Backdash DELAY */}
                  {row2Inputs.map((k)=> (
                    <button
                      key={k}
                      className="input-button p-1 lg:p-2 hover:transform hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
                      style={{ width: '80px', height: '80px' }}
                      onClick={()=>add(k)}
                    >
                      <InputIcon k={k} size={64} />
                    </button>
                  ))}

                  {/* Row 3: + Then ~ OR WHIFF */}
                  {row3Inputs.map((k)=> (
                    <button
                      key={k}
                      className="input-button p-1 lg:p-2 hover:transform hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
                      style={{ width: '80px', height: '80px' }}
                      onClick={()=>add(k)}
                    >
                      <InputIcon k={k} size={64} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Form Fields and Action Buttons - Flex to fill space */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* Form Fields Column - Flex to fill remaining space */}
              <div className="space-y-2 flex-1">
                <input
                  value={meta.name}
                  onChange={(e)=>setMeta({...meta, name:e.target.value})}
                  className="w-full bg-background border-4 border-brutal-border p-3 text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  placeholder="NAME"
                />
                <select
                  value={meta.difficulty}
                  onChange={(e)=>setMeta({...meta, difficulty:e.target.value})}
                  className="w-full bg-background border-4 border-brutal-border p-3 text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                >
                  <option value="">DIFFICULTY</option>
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                </select>
                <input
                  value={meta.damage}
                  onChange={(e)=>setMeta({...meta, damage:e.target.value})}
                  className="w-full bg-background border-4 border-brutal-border p-3 text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  placeholder="DAMAGE"
                />
                {user && (
                  <select
                    value={meta.characterId}
                    onChange={(e)=>setMeta({...meta, characterId:e.target.value})}
                    className="w-full bg-background border-4 border-brutal-border p-3 text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="">SELECT CHAMPION</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>{char.name.toUpperCase()}</option>
                    ))}
                  </select>
                )}
                <input
                  value={meta.tags}
                  onChange={(e)=>setMeta({...meta, tags:e.target.value})}
                  className="w-full bg-background border-4 border-brutal-border p-3 text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  placeholder="TAGS"
                />
              </div>

              {/* Action Buttons Column - Fixed size */}
              <div className="action-buttons grid grid-cols-2 gap-2 w-full lg:w-48 lg:flex-shrink-0">
                {/* Row 1: Undo/Reset */}
                <button className="brutal-btn brutal-btn--secondary py-4 text-sm text-center" onClick={undo}>UNDO</button>
                <button className="brutal-btn brutal-btn--danger py-4 text-sm text-center" onClick={reset}>RESET</button>

                {/* Row 2: Copy/Save Image */}
                <button className="brutal-btn brutal-btn--secondary py-3 text-xs text-center" onClick={copyNotation}>COPY NOTATION</button>
                <button className="brutal-btn brutal-btn--primary py-3 text-xs text-center" onClick={saveAsImage}>SAVE IMAGE</button>

                {/* Row 3: Share */}
                <button
                  className="brutal-btn brutal-btn--secondary py-4 text-sm text-center col-span-2"
                  onClick={shareCombo}
                  disabled={inputs.length === 0}
                  title={inputs.length === 0 ? "Add some inputs to share" : "Share this combo"}
                >
                  SHARE COMBO
                </button>

                {/* Row 4: Save Combo */}
                <button
                  disabled={saving}
                  onClick={save}
                  className={`brutal-btn ${!user || !meta.characterId || inputs.length === 0 ? 'brutal-btn--secondary' : 'brutal-btn--primary'} py-4 text-sm col-span-2 text-center`}
                  title={!user ? "Sign in with Discord to save combos" : !meta.characterId ? "Click to see champion message" : inputs.length === 0 ? "Click to see inputs message" : ""}
                >
                  {saving ? "SAVING..." : !user ? "SAVE COMBO" : editingCombo ? "UPDATE COMBO" : "SAVE COMBO"}
                </button>
              </div>
            </div>
          </div>

          {/* Import Section - Full width to match other elements */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <input
              value={importText}
              onChange={(e)=>setImportText(e.target.value)}
              className="flex-1 bg-background border-4 border-brutal-border p-3 text-lg font-bold tracking-wide focus:outline-none focus:border-neon-cyan"
              placeholder="ENTER NUMPAD NOTATION TO IMPORT..."
              style={{ textTransform: 'none' }}
            />
            <button
              onClick={importNotation}
              className="brutal-btn brutal-btn--secondary px-6 py-3 text-sm md:flex-shrink-0"
              disabled={!importText.trim()}
            >
              IMPORT
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 border-4 border-brutal-border box-shadow-brutal z-50">
            <span className="text-sm font-bold uppercase tracking-wide">{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function parseNotation(notation: string): InputKey[] {
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
      // Handle X~Y notation
      const [x, y] = token.split('~');
      result.push(...parseToken(x));
      result.push("~");
      result.push(...parseToken(y));
    } else if (token.includes('/')) {
      // Handle X/Y notation (or)
      const [x, y] = token.split('/');
      result.push(...parseToken(x));
      result.push("or");
      result.push(...parseToken(y));
    } else if (token.startsWith('j.') || token.startsWith('J.')) {
      // Handle j.X or J.X notation
      result.push("air");
      result.push(...parseToken(token.substring(2)));
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
    } else if (token === '+' || token === '>' || token === 'OR' || token === 'or' || token === '/') {
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
    "dl": "delay", "d": "delay"
  };
  return map[lowerNotation] || notation as InputKey;
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


