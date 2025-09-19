"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import InputIcon from "./InputIcon";
import { createBrowserClient } from "@/lib/supabaseClient";
import { characters } from "@/lib/characters";
import { useAuth } from "@/lib/AuthContext";
import { InputKey } from "./InputIcon";

type Combo = {
  id: string;
  name: string;
  inputs: InputKey[];
  difficulty: string;
  tags: string[];
  character_id: string;
  completed?: boolean;
};

export default function MyCombos({ characterId, onEdit }: { characterId?: string; onEdit?: (combo: Combo) => void }) {
  const { user, loading: authLoading } = useAuth();
  const supabase = createBrowserClient();
  const [items, setItems] = useState<Combo[]>([]);
  const [filteredItems, setFilteredItems] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, right: number} | null>(null);
  const dropdownButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const [toast, setToast] = useState<{message: string; visible: boolean}>({message: "", visible: false});
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [completedFilter, setCompletedFilter] = useState<'all' | 'learned' | 'not-learned'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const load = useCallback(async () => {
    if (authLoading) {
      return; // Don't do anything while auth is loading
    }

    if (!user) {
      // Clear combos when user is not authenticated
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("Loading combos for user:", user.id);

    let query = supabase
      .from("combos")
      .select("id, name, inputs, difficulty, tags, character_id, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (characterId) {
      query = query.eq("character_id", characterId);
      console.log("Filtering by character:", characterId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading combos:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      setLoading(false);
      return;
    }

    console.log("Loaded combos:", data);
    setItems((data as Combo[]) || []);
    setLoading(false);
  }, [user, authLoading, supabase, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter and sort items whenever filters or sort options change
  useEffect(() => {
    let filtered = [...items];

    // Apply tag/name filter
    if (tagFilter.trim()) {
      const filterTerm = tagFilter.toLowerCase().trim();
      filtered = filtered.filter(combo =>
        combo.tags.some(tag => tag.toLowerCase().includes(filterTerm)) ||
        combo.name?.toLowerCase().includes(filterTerm)
      );
    }

    // Apply completed filter
    if (completedFilter !== 'all') {
      filtered = filtered.filter(combo => {
        if (completedFilter === 'learned') return combo.completed;
        if (completedFilter === 'not-learned') return !combo.completed;
        return true;
      });
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(combo =>
        combo.difficulty.toLowerCase() === difficultyFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          const aDiff = difficultyOrder[a.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 0;
          const bDiff = difficultyOrder[b.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 0;
          comparison = aDiff - bDiff;
          break;
        case 'created':
        default:
          // For created, we need to maintain the original order from the database
          // Since items are already ordered by created_at desc, we can use array indices
          const aIndex = items.findIndex(item => item.id === a.id);
          const bIndex = items.findIndex(item => item.id === b.id);
          comparison = aIndex - bIndex;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(filtered);
  }, [items, sortBy, sortOrder, tagFilter, completedFilter, difficultyFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdown) {
        const target = event.target as Element;
        
        // Check if the click is on a dropdown button
        const isDropdownButton = Object.values(dropdownButtonRefs.current).some(ref => 
          ref && ref.contains(target)
        );
        
        // Check if the click is inside the dropdown menu (portal)
        const dropdownElement = document.querySelector('[data-portal-dropdown]');
        const isInsideDropdown = dropdownElement && dropdownElement.contains(target);
        
        if (!isDropdownButton && !isInsideDropdown) {
          setOpenDropdown(null);
          setDropdownPosition(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  function showToast(message: string) {
    setToast({message, visible: true});
    setTimeout(() => setToast({message: "", visible: false}), 3000);
  }

  const handleDropdownToggle = (comboId: string) => {
    if (openDropdown === comboId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
      return;
    }

    const buttonRef = dropdownButtonRefs.current[comboId];
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 4,
        right: window.innerWidth - rect.right - scrollX
      });
    }
    
    setOpenDropdown(comboId);
  };

  function shareCombo(combo: Combo) {
    const comboData = {
      inputs: combo.inputs.length > 0 ? combo.inputs : undefined,
      name: combo.name || undefined,
      difficulty: combo.difficulty || undefined,
      tags: combo.tags?.length > 0 ? combo.tags.join(", ") : undefined,
      characterId: combo.character_id || undefined
    };

    // Remove undefined values to minimize payload
    const cleanData = Object.fromEntries(
      Object.entries(comboData).filter(([_, value]) => value !== undefined)
    );

    // Compress the data using base64 encoding
    const jsonString = JSON.stringify(cleanData);
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));

    const shareUrl = new URL(window.location.origin);
    shareUrl.searchParams.set('c', encodedData);

    navigator.clipboard.writeText(shareUrl.toString());
    showToast("Share link copied to clipboard!");
    setOpenDropdown(null);
  }

  async function remove(id: string) {
    await supabase.from("combos").delete().eq("id", id);
    setItems((a)=>a.filter((x)=>x.id!==id));
    setOpenDropdown(null);
  }

  async function toggleCompleted(id: string, currentCompleted: boolean) {
    const newCompleted = !currentCompleted;

    const { error } = await supabase
      .from("combos")
      .update({ completed: newCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error updating completed status:", error);
      showToast("Error updating completed status");
      return;
    }

    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: newCompleted } : item
      )
    );

    showToast(newCompleted ? "Marked as learned!" : "Marked as not learned");
    setOpenDropdown(null);
  }

  function edit(combo: Combo) {
    if (onEdit) {
      onEdit(combo);
    } else {
      alert("Edit functionality coming soon!");
    }
    setOpenDropdown(null);
  }

  function copyNotation(combo: Combo) {
    const notation = convertToNotation(combo.inputs);
    navigator.clipboard.writeText(notation);
    showToast(`Copied: ${notation}`);
    setOpenDropdown(null);
  }

  return (
    <div className="space-y-3">
      {authLoading && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide text-center">
          LOADING...
        </div>
      )}

      {!authLoading && !user && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide text-center">
          Please log in to view your saved combos.
        </div>
      )}

      {!authLoading && user && loading && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide text-center">
          LOADING...
        </div>
      )}

      {!authLoading && user && !loading && items.length > 0 && (
        <div className="space-y-4">
          {/* Search, Filter and Sort Controls */}
          <div className="panel p-4">
            <div className="flex flex-col gap-4">
              {/* Top row: Search, Filter, Sort */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by tags or name..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold uppercase tracking-wide text-foreground/70">FILTER:</span>
                  <select
                    value={completedFilter}
                    onChange={(e) => setCompletedFilter(e.target.value as 'all' | 'learned' | 'not-learned')}
                    className="px-3 py-2 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="all">ALL STATUS</option>
                    <option value="learned">LEARNED</option>
                    <option value="not-learned">NOT LEARNED</option>
                  </select>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                    className="px-3 py-2 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="all">ALL DIFFICULTY</option>
                    <option value="easy">EASY</option>
                    <option value="medium">MEDIUM</option>
                    <option value="hard">HARD</option>
                  </select>
                </div>

                {/* Sort Controls */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold uppercase tracking-wide text-foreground/70">SORT:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'difficulty' | 'created')}
                    className="px-3 py-2 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="created">NEWEST</option>
                    <option value="name">NAME</option>
                    <option value="difficulty">DIFFICULTY</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border-[#333333] border-4 text-foreground text-sm font-bold"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Results count and clear filters */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                  {filteredItems.length} of {items.length} combos
                </div>
                {(tagFilter || completedFilter !== 'all' || difficultyFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setTagFilter('');
                      setCompletedFilter('all');
                      setDifficultyFilter('all');
                    }}
                    className="text-xs font-bold uppercase tracking-wide text-neon-cyan hover:text-white"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!authLoading && user && !loading && items.length === 0 && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide">NO SAVED COMBOS.</div>
      )}

      {!authLoading && user && !loading && items.length > 0 && filteredItems.length === 0 && tagFilter.trim() && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide">NO COMBOS MATCH YOUR SEARCH.</div>
      )}

      {filteredItems.map((c) => {
        const character = characters.find(char => char.id === c.character_id);
        return (
          <div key={c.id} className={`panel p-4 ${c.completed ? 'opacity-75 bg-green-900/20' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {c.name && (
                  <div className={`text-lg font-bold uppercase tracking-wide mb-2 ${c.completed ? 'text-black' : 'text-neon-cyan'}`}>
                    {c.name}
                    {c.completed && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 font-bold uppercase tracking-wide">LEARNED</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {c.inputs.map((k,i)=> <InputIcon key={i} k={k as InputKey} showBackground={false} size={56} />)}
                </div>
                <div className={`text-sm font-bold flex items-center gap-4 ${c.completed ? 'text-black' : 'text-foreground'}`}>
                  {c.difficulty && (
                    <span className="uppercase tracking-wide">DIFFICULTY: {c.difficulty.toUpperCase()}</span>
                  )}
                  {c.tags && c.tags.length > 0 && (
                    <span className="uppercase tracking-wide">TAGS: {c.tags.join(", ").toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="relative ml-4 dropdown-container">
                <button
                  ref={(el) => { dropdownButtonRefs.current[c.id] = el; }}
                  className="brutal-btn brutal-btn--secondary px-3 py-2 text-sm"
                  onClick={() => handleDropdownToggle(c.id)}
                  aria-label="More options"
                >
                  ⋯
                </button>
              </div>
          </div>
        </div>
      );
      })}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 border-4 border-brutal-border box-shadow-brutal z-50">
          <span className="text-sm font-bold uppercase tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Portal Dropdown */}
      {openDropdown && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed bg-surface border-4 border-brutal-border box-shadow-brutal z-[10000] w-[140px]"
          data-portal-dropdown
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right
          }}
        >
          {(() => {
            const combo = filteredItems.find(c => c.id === openDropdown);
            if (!combo) return null;
            
            return (
              <>
                <button
                  className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wide hover:bg-background text-foreground"
                  onClick={() => shareCombo(combo)}
                >
                  SHARE
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wide hover:bg-background text-foreground"
                  onClick={() => copyNotation(combo)}
                >
                  COPY NOTATION
                </button>
                <button
                  className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wide hover:bg-background ${combo.completed ? 'text-orange-400' : 'text-green-400'}`}
                  onClick={() => toggleCompleted(combo.id, combo.completed || false)}
                >
                  {combo.completed ? 'MARK AS NOT LEARNED' : 'MARK AS LEARNED'}
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wide hover:bg-background text-foreground"
                  onClick={() => edit(combo)}
                >
                  EDIT
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wide hover:bg-background text-red-400"
                  onClick={() => remove(combo.id)}
                >
                  DELETE
                </button>
              </>
            );
          })()}
        </div>,
        document.body
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
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "7jc", "9jc"].includes(k);
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
    case "L": return "L";
    case "M": return "M";
    case "H": return "H";
    case "S1": return "S1";
    case "S2": return "S2";
    case "+": return " + ";
    case "D": return "66";
    case "BD": return "44";
    case ">": return " > ";
    case "T": return " > ";
    case "tag": return "Tag";
    case "or": return " OR ";
    case "air": return "j.";
    case "delay": return "dl.";
    case "whiff": return "w.";
    case "hold": return "[hold]";
    case "~": return "~";
    default: return k; // Return the custom text as-is
  }
}


