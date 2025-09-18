"use client";
import { useEffect, useMemo, useState } from "react";
import InputIcon from "./InputIcon";
import { createBrowserClient } from "@/lib/supabaseClient";

type Combo = {
  id: string;
  inputs: string[];
  difficulty: string;
  tags: string[];
  notes: string | null;
  user_id: string;
};

export default function CommunityCombos({ characterId }: { characterId: string }) {
  const supabase = createBrowserClient();
  const [items, setItems] = useState<Combo[]>([]);
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [tag, setTag] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("combos")
        .select("id, inputs, difficulty, tags, notes, user_id")
        .eq("character_id", characterId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setItems((data as any) || []);
    })();
  }, [characterId]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (difficulty && c.difficulty !== difficulty) return false;
      if (tag && !(c.tags || []).includes(tag)) return false;
      if (q && !(c.notes || "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, difficulty, tag]);

  return (
    <div className="space-y-3">
      <div className="panel p-6 grid sm:grid-cols-4 gap-4">
        <input className="bg-background border-4 border-brutal-border p-3 text-lg font-bold uppercase tracking-wide sm:col-span-2 focus:outline-none focus:border-neon-cyan" placeholder="SEARCH NOTES" value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="bg-background border-4 border-brutal-border p-3 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
          <option value="">ALL DIFFICULTIES</option>
          <option>EASY</option>
          <option>MEDIUM</option>
          <option>HARD</option>
        </select>
        <input className="bg-background border-4 border-brutal-border p-3 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" placeholder="FILTER TAG E.G. BNB" value={tag} onChange={(e)=>setTag(e.target.value)} />
      </div>

      <ul className="space-y-3">
        {filtered.map((c) => (
          <li key={c.id} className="panel p-3">
            <div className="flex items-center gap-2 flex-wrap">
              {c.inputs.map((k, i) => (
                <InputIcon key={i} k={k as any} />
              ))}
            </div>
            <div className="mt-3 text-lg font-bold text-foreground flex items-center gap-4">
              <span className="uppercase tracking-wide">DIFFICULTY: {c.difficulty.toUpperCase()}</span>
              <span className="uppercase tracking-wide">TAGS: {(c.tags||[]).join(", ").toUpperCase() || "—"}</span>
            </div>
            <div className="mt-4">
              <button className="brutal-btn brutal-btn--primary" onClick={async ()=>{
                const user = (await supabase.auth.getUser()).data.user;
                if (!user) { alert("Log in to save combos"); return; }
                await supabase.from("saved_combos").insert({ user_id: user.id, combo_id: c.id });
                alert("Saved to My Combos");
              }}>SAVE TO MY COMBOS</button>
            </div>
          </li>
        ))}
        {filtered.length===0 && <li className="text-foreground/70 text-lg font-bold uppercase tracking-wide">NO COMBOS YET.</li>}
      </ul>
    </div>
  );
}


