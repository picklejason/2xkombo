"use client";
import Image from "next/image";

interface CharacterCardProps {
  name: string;
  src: string;
}

export default function CharacterCard({ name, src }: CharacterCardProps) {
  return (
    <article 
      className="character-card group focus-within:outline-2 focus-within:outline-neon-cyan focus-within:outline-offset-2"
      role="button"
      tabIndex={0}
    >
      <div className="character-card__container">
        <div className="character-card__image-wrapper">
          <Image 
            src={src} 
            alt={`${name} character portrait`}
            width={200}
            height={260}
            className="character-card__image"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7SNf/Z"
          />
          <div className="character-card__label">
            <span className="character-card__name">{name}</span>
          </div>
        </div>
        <div className="character-card__accent" aria-hidden="true" />
      </div>
    </article>
  );
}


