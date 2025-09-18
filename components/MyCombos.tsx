"use client";
import { useEffect, useState } from "react";
import InputIcon from "./InputIcon";
import { createBrowserClient } from "@/lib/supabaseClient";

type Combo = {
  id: string;
  inputs: string[];
  difficulty: string;
  tags: string[];
  notes: string | null;
  is_published: boolean;
};

export default function MyCombos({ characterId, onEdit }: { characterId: string; onEdit?: (combo: Combo) => void }) {
  const supabase = createBrowserClient();
  const [items, setItems] = useState<Combo[]>([]);

  async function load() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase
      .from("combos")
      .select("id, inputs, difficulty, tags, notes, is_published")
      .eq("character_id", characterId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as any) || []);
  }

  useEffect(() => { load(); }, [characterId]);

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
      {items.map((c) => (
        <div key={c.id} className="panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {c.inputs.map((k,i)=> <InputIcon key={i} k={k as any} />)}
              </div>
              <div className="text-sm font-bold text-foreground flex items-center gap-4">
                <span className="uppercase tracking-wide">DIFFICULTY: {c.difficulty.toUpperCase()}</span>
                <span className="uppercase tracking-wide">TAGS: {(c.tags||[]).join(", ").toUpperCase() || "—"}</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                className="brutal-btn brutal-btn--secondary px-4 py-2 text-xs"
                onClick={()=>edit(c)}
              >
                EDIT
              </button>
              <button
                className="brutal-btn brutal-btn--danger px-4 py-2 text-xs"
                onClick={()=>remove(c.id)}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      ))}
      {items.length===0 && <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide">NO SAVED COMBOS.</div>}
    </div>
  );
}


