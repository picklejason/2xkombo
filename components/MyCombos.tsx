"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import ComboDisplay from "./ComboDisplay";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import { convertToNotation } from "@/lib/notation";
import { Combo } from "@/lib/types";

export default function MyCombos({ characterId, onEdit }: { characterId?: string; onEdit?: (combo: Combo) => void }) {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const [items, setItems] = useState<Combo[]>([]);
  const [filteredItems, setFilteredItems] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, maxHeight?: number} | null>(null);
  const dropdownButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);
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
      .select("id, name, inputs, difficulty, damage, tags, character_id, completed")
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
        combo.tags?.some(tag => tag.toLowerCase().includes(filterTerm)) ||
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
        combo.difficulty?.toLowerCase() === difficultyFilter
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

        // Check if the click is inside the dropdown menu
        const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

        if (!isDropdownButton && !isInsideDropdown) {
          setOpenDropdown(null);
          setDropdownPosition(null);
        }
      }
    }

    function handleScroll() {
      if (openDropdown) {
        const buttonRef = dropdownButtonRefs.current[openDropdown];
        if (buttonRef) {
          const position = calculateDropdownPosition(buttonRef);
          setDropdownPosition(position);
        }
      }
    }

    function handleResize() {
      if (openDropdown) {
        const buttonRef = dropdownButtonRefs.current[openDropdown];
        if (buttonRef) {
          const position = calculateDropdownPosition(buttonRef);
          setDropdownPosition(position);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [openDropdown]);


  const calculateDropdownPosition = (buttonElement: HTMLButtonElement) => {
    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 160; // Estimated dropdown width
    const dropdownHeight = 200; // Estimated dropdown height (5 items * ~40px each)
    const spacing = 4;

    let top = buttonRect.bottom + spacing;
    let left = buttonRect.right - dropdownWidth;

    // Handle viewport boundaries - vertical
    if (top + dropdownHeight > viewportHeight) {
      // Position above button if there's more space
      const spaceAbove = buttonRect.top - spacing;
      const spaceBelow = viewportHeight - buttonRect.bottom - spacing;

      if (spaceAbove > spaceBelow && spaceAbove >= dropdownHeight) {
        top = buttonRect.top - dropdownHeight - spacing;
      } else {
        // Keep below but adjust height if needed
        top = buttonRect.bottom + spacing;
        const availableHeight = viewportHeight - top - 16; // 16px bottom margin
        return {
          top,
          left: Math.max(16, Math.min(left, viewportWidth - dropdownWidth - 16)),
          maxHeight: Math.max(120, availableHeight)
        };
      }
    }

    // Handle viewport boundaries - horizontal
    if (left < 16) {
      left = 16; // 16px left margin
    } else if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16; // 16px right margin
    }

    return { top, left };
  };

  const handleDropdownToggle = (comboId: string) => {
    if (openDropdown === comboId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
      return;
    }

    const buttonRef = dropdownButtonRefs.current[comboId];
    if (buttonRef) {
      const position = calculateDropdownPosition(buttonRef);
      setDropdownPosition(position);
    }

    setOpenDropdown(comboId);
  };

  function shareCombo(combo: Combo) {
    const comboData = {
      inputs: combo.inputs.length > 0 ? combo.inputs : undefined,
      name: combo.name || undefined,
      difficulty: combo.difficulty || undefined,
      damage: combo.damage ? Number(combo.damage) || undefined : undefined,
      tags: combo.tags?.length > 0 ? combo.tags.join(", ") : undefined,
      characterId: combo.character_id || undefined
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
    showToast("Share link copied to clipboard!", "success");
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
      showToast("Error updating completed status", "error");
      return;
    }

    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: newCompleted } : item
      )
    );

    showToast(newCompleted ? "Marked as learned!" : "Marked as not learned", "success");
    setOpenDropdown(null);
  }

  function edit(combo: Combo) {
    if (onEdit) {
      onEdit(combo);
    } else {
      showToast("Edit functionality coming soon!", "info");
    }
    setOpenDropdown(null);
  }

  function copyNotation(combo: Combo) {
    const notation = convertToNotation(combo.inputs);
    navigator.clipboard.writeText(notation);
    showToast(`Copied: ${notation}`, "success");
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
              {/* Single Row Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                {/* Search Input */}
                <div className="col-span-1 md:col-span-4">
                  <input
                    type="text"
                    placeholder="Search by tags or name..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="w-full px-4 py-4 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan min-h-[56px]"
                  />
                </div>

                {/* Filter Label and Status */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">FILTER:</span>
                    <select
                      value={completedFilter}
                      onChange={(e) => setCompletedFilter(e.target.value as 'all' | 'learned' | 'not-learned')}
                      className="w-full px-4 py-4 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan min-h-[56px]"
                    >
                      <option value="all">ALL STATUS</option>
                      <option value="learned">LEARNED</option>
                      <option value="not-learned">NOT LEARNED</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="col-span-1 md:col-span-2">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                    className="w-full px-4 py-4 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan min-h-[56px]"
                  >
                    <option value="all">ALL DIFFICULTY</option>
                    <option value="easy">EASY</option>
                    <option value="medium">MEDIUM</option>
                    <option value="hard">HARD</option>
                  </select>
                </div>

                {/* Sort Controls Grouped */}
                <div className="col-span-1 md:col-span-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">SORT:</span>
                    <div className="flex gap-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'difficulty' | 'created')}
                        className="flex-1 px-4 py-4 bg-background border-2 border-brutal-border text-foreground text-sm font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan min-h-[56px]"
                      >
                        <option value="created">NEWEST</option>
                        <option value="name">NAME</option>
                        <option value="difficulty">DIFFICULTY</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="brutal-btn brutal-btn--secondary !w-[56px] !h-[56px] !min-w-[56px] !min-h-[56px] !p-0 text-xl flex-shrink-0"
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
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
        return (
          <div key={c.id} className={`panel p-4 ${c.completed ? 'opacity-75 bg-green-900/20' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {c.name && (
                  <div className={`text-lg font-bold uppercase tracking-wide mb-2 ${c.completed ? 'text-black' : 'text-neon-cyan'}`}>
                    {c.name}
                    {c.completed && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 font-bold uppercase tracking-wide">LEARNED</span>
                    )}
                  </div>
                )}
                <div className="mb-3">
                  <ComboDisplay
                    inputs={c.inputs}
                    notation="icons"
                    showBackground={false}
                    size={56}
                  />
                </div>
                <div className={`text-sm font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 ${c.completed ? 'text-black' : 'text-foreground'}`}>
                  {c.difficulty && (
                    <span className="uppercase tracking-wide">DIFFICULTY: {c.difficulty?.toUpperCase()}</span>
                  )}
                  {c.damage && (
                    <span className="uppercase tracking-wide">DAMAGE: {c.damage}</span>
                  )}
                  {c.tags && c.tags.length > 0 && (
                    <span className="uppercase tracking-wide break-words">TAGS: {c.tags?.join(", ").toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center ml-2 sm:ml-4">
                <button
                  ref={(el) => { dropdownButtonRefs.current[c.id] = el; }}
                  className="brutal-btn brutal-btn--secondary px-2 py-2 sm:px-3 sm:py-2 text-base sm:text-sm !min-w-[36px] !min-h-[36px] !w-[36px] !h-[36px] sm:!min-w-auto sm:!min-h-auto sm:!w-auto sm:!h-auto flex items-center justify-center"
                  onClick={() => handleDropdownToggle(c.id)}
                  aria-label="More options"
                  title="More options"
                >
                  <span className="block sm:hidden text-center">⋮</span>
                  <span className="hidden sm:block text-center">⋯</span>
                </button>
              </div>
          </div>
        </div>
      );
      })}


      {/* Portal Dropdown */}
      {openDropdown && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-surface border-4 border-brutal-border box-shadow-brutal z-[10000] w-[160px] overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            maxHeight: dropdownPosition.maxHeight || 'auto'
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
