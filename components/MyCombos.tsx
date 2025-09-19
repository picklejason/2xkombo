"use client";
import { useEffect, useState, useCallback } from "react";
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
};

export default function MyCombos({ characterId, onEdit }: { characterId?: string; onEdit?: (combo: Combo) => void }) {
  const { user } = useAuth();
  const supabase = createBrowserClient();
  const [items, setItems] = useState<Combo[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    let query = supabase
      .from("combos")
      .select("id, name, inputs, difficulty, tags, character_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (characterId) {
      query = query.eq("character_id", characterId);
    }
    
    const { data } = await query;
    setItems((data as Combo[]) || []);
  }, [user, supabase, characterId]);

  useEffect(() => { 
    load(); 
  }, [load]);

  async function remove(id: string) {
    await supabase.from("combos").delete().eq("id", id);
    setItems((a)=>a.filter((x)=>x.id!==id));
  }

  function edit(combo: Combo) {
    if (onEdit) {
      onEdit(combo);
    } else {
      alert("Edit functionality coming soon!");
    }
  }

  return (
    <div className="space-y-3">
      {!user && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide text-center">
          Please log in to view your saved combos.
        </div>
      )}
      {user && items.length === 0 && (
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide">NO SAVED COMBOS.</div>
      )}
      {items.map((c) => {
        const character = characters.find(char => char.id === c.character_id);
        return (
          <div key={c.id} className="panel p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {c.name && (
                  <div className="text-lg font-bold text-neon-cyan uppercase tracking-wide mb-2">
                    {c.name}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {c.inputs.map((k,i)=> <InputIcon key={i} k={k as InputKey} showBackground={false} size={56} />)}
                </div>
                <div className="text-sm font-bold text-foreground flex items-center gap-4">
                  {c.difficulty && (
                    <span className="uppercase tracking-wide">DIFFICULTY: {c.difficulty.toUpperCase()}</span>
                  )}
                  {c.tags && c.tags.length > 0 && (
                    <span className="uppercase tracking-wide">TAGS: {c.tags.join(", ").toUpperCase()}</span>
                  )}
                </div>
              </div>
            <div className="flex gap-2 ml-4">
              <button
                className="brutal-btn brutal-btn--secondary px-4 py-2 text-xs w-20"
                onClick={()=>edit(c)}
              >
                EDIT
              </button>
              <button
                className="brutal-btn brutal-btn--danger px-4 py-2 text-xs w-20"
                onClick={()=>remove(c.id)}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
}


