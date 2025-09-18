"use client";
import Link from "next/link";
import { characters } from "@/lib/characters";
import CharacterCard from "@/components/CharacterCard";

export default function Home() {
  return (
    <div>
      <section
        className="character-grid"
        role="grid"
        aria-label="Character selection grid"
      >
        {characters.map((character, index) => (
          <Link 
            key={character.slug} 
            href={`/c/${character.slug}`}
            className="character-grid__item"
            aria-label={`View ${character.name} details`}
          >
            <CharacterCard name={character.name} src={character.portraitUrl} />
          </Link>
        ))}
      </section>
    </div>
  );
}
