"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { characters } from "@/lib/characters";
import CharacterCard from "@/components/CharacterCard";
import { useAuth } from "@/lib/AuthContext";
import { createBrowserClient } from "@/lib/supabaseClient";

export default function MyCombosPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="neon-title text-2xl md:text-3xl font-black tracking-wider mb-1">MY COMBOS</h1>
        </div>
        <div className="text-foreground/70 text-lg font-bold uppercase tracking-wide text-center">
          Please log in to view your saved combos.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="neon-title text-2xl md:text-3xl font-black tracking-wider mb-1">MY COMBOS</h1>
      </div>

      <section
        className="character-grid"
        role="grid"
        aria-label="Character selection grid"
      >
        {characters.map((character) => {
          return (
            <Link 
              key={character.slug} 
              href={`/c/${character.slug}`}
              className="character-grid__item"
              aria-label={`View ${character.name} combos`}
            >
              <CharacterCard 
                name={character.name} 
                src={character.portraitUrl} 
              />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
