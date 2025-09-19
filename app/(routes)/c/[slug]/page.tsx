"use client";
import { useParams } from "next/navigation";
import { findCharacter } from "@/lib/characters";
import MyCombos from "@/components/MyCombos";
import { useRouter } from "next/navigation";
import { InputKey } from "@/components/InputIcon";
import CharacterImage from "@/components/CharacterImage";

type Combo = {
  id: string;
  name: string;
  inputs: InputKey[];
  difficulty: string;
  tags: string[];
  character_id: string;
};

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params?.slug || "");
  const character = findCharacter(slug);

  const handleEdit = (combo: Combo) => {
    // Navigate to home page (combo builder) with the combo data in URL state
    router.push(`/?edit=${combo.id}`);
  };

  if (!character) {
    return <div className="text-white/70">Character not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <CharacterImage
              name={character.name}
              src={character.portraitUrl}
              variant="portrait"
              size={128}
            />
          </div>
          <div>
            <h1 className="neon-title text-2xl md:text-3xl font-black tracking-wider mb-1">
              {character.name.toUpperCase()} COMBOS
            </h1>
          </div>
        </div>
        <div>
          <a
            href={`/?character=${character.id}`}
            className="brutal-btn brutal-btn--primary px-6 py-3"
          >
            CREATE COMBO
          </a>
        </div>
      </div>

      <MyCombos characterId={character.id} onEdit={handleEdit} />
    </div>
  );
}





