"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { findCharacter } from "@/lib/characters";
import MyCombos from "@/components/MyCombos";
import { useRouter } from "next/navigation";
import CharacterImage from "@/components/CharacterImage";
import { Combo } from "@/lib/types";

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params?.slug || "");
  const character = findCharacter(slug);

  if (!character) {
    return <div className="text-white/70">Character not found.</div>;
  }

  const handleEdit = (combo: Combo) => {
    // Navigate to home page (combo builder) with the combo data in URL state
    router.push(`/?edit=${combo.id}&returnTo=character&characterSlug=${character.slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Mobile-First Character Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <CharacterImage
              name={character.name}
              src={character.portraitUrl}
              variant="portrait"
              size={128}
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="neon-title text-xl md:text-2xl lg:text-3xl font-black tracking-wider mb-1">
              {character.name.toUpperCase()} COMBOS
            </h1>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Link
            href={`/?character=${character.id}`}
            className="brutal-btn brutal-btn--primary px-6 py-3 w-full md:w-auto text-center block"
            prefetch={true}
          >
            CREATE COMBO
          </Link>
        </div>
      </div>

      <MyCombos characterId={character.id} onEdit={handleEdit} />
    </div>
  );
}





