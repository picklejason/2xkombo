"use client";
import CharacterImage from "./CharacterImage";

interface CharacterCardProps {
  name: string;
  src: string;
}

export default function CharacterCard({ name, src }: CharacterCardProps) {
  return <CharacterImage name={name} src={src} variant="card" />;
}