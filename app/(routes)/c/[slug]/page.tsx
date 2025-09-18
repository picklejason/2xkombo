"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { characters, findCharacter } from "@/lib/characters";
import ComboBuilder from "@/components/ComboBuilder";
import MyCombos from "@/components/MyCombos";

type TabKey = "my" | "builder";

const tabs: { key: TabKey; label: string }[] = [
  { key: "my", label: "My Combos" },
  { key: "builder", label: "Combo Builder" },
];

export default function CharacterPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const character = findCharacter(slug);
  const [active, setActive] = useState<TabKey>("builder");
  const [editingCombo, setEditingCombo] = useState<any>(null);

  if (!character) {
    return <div className="text-white/70">Character not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img
              src={character.portraitUrl}
              alt={character.name}
              className="h-24 w-24 md:h-32 md:w-32 object-cover border-4 border-brutal-border box-shadow-brutal"
            />
          </div>
          <div>
            <h1 className="neon-title text-2xl md:text-3xl font-black tracking-wider mb-1">{character.name.toUpperCase()}</h1>
          </div>
        </div>

        <div className="flex gap-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`brutal-btn ${active===t.key ? "brutal-btn--primary" : "brutal-btn--secondary"}`}
              aria-selected={active===t.key}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {active === "my" && (
        <MyCombos
          characterId={character.id}
          onEdit={(combo) => {
            setEditingCombo(combo);
            setActive("builder");
          }}
        />
      )}
      {active === "builder" && (
        <ComboBuilder
          characterId={character.id}
          editingCombo={editingCombo}
          onSave={() => setEditingCombo(null)}
        />
      )}
    </div>
  );
}


