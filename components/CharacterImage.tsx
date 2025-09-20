"use client";
import { useEffect, useState } from 'react';
import { imagePreloader } from '@/lib/imagePreloader';
import { getCharacterStyles } from '@/lib/characters';

interface CharacterImageProps {
  name: string;
  src: string;
  variant?: 'card' | 'portrait';
  size?: number;
}

export default function CharacterImage({ name, src, variant = 'card', size = 128 }: CharacterImageProps) {
  const characterStyles = getCharacterStyles(name);
  const [imageLoaded, setImageLoaded] = useState(() => imagePreloader.isLoaded(src));
  
  useEffect(() => {
    if (imageLoaded) return;
    
    imagePreloader.preload(src)
      .then(() => setImageLoaded(true))
      .catch(() => console.warn(`Failed to load character image: ${src}`));
  }, [src, imageLoaded]);
  
  if (variant === 'portrait') {
    return (
      <article 
        className="character-card group focus-within:outline-2 focus-within:outline-neon-cyan focus-within:outline-offset-2"
        role="button"
        tabIndex={0}
        style={{ width: size, height: size }}
      >
        <div 
          className="character-card__container h-full"
          style={{ height: size }}
        >
          <div 
            className="character-card__image-wrapper relative overflow-hidden h-full"
            style={{ height: size }}
          >
            <div 
              className={`absolute h-full w-[180%] -left-[50px] bg-no-repeat transition-all duration-200 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: characterStyles.backgroundPosition,
                backgroundSize: characterStyles.backgroundSize
              }}
              role="img"
              aria-label={`${name} character portrait`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-surface animate-pulse" />
            )}
          </div>
        </div>
      </article>
    );
  }

  // Default card variant - return the existing card structure
  return (
    <article 
      className="character-card group focus-within:outline-2 focus-within:outline-neon-cyan focus-within:outline-offset-2"
      role="button"
      tabIndex={0}
    >
      <div className="character-card__container">
        <div className="character-card__image-wrapper relative overflow-hidden">
          <div 
            className={`absolute h-full w-[180%] -left-[50px] bg-no-repeat transition-all duration-200 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: characterStyles.backgroundPosition,
              backgroundSize: characterStyles.backgroundSize
            }}
            role="img"
            aria-label={`${name} character card`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface animate-pulse" />
          )}
        </div>
        <div className="character-card__label">
          <span className="character-card__name">{name}</span>
        </div>
      </div>
    </article>
  );
}
