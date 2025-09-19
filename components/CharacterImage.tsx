"use client";

interface CharacterImageProps {
  name: string;
  src: string;
  variant?: 'card' | 'portrait';
  size?: number;
}

const getCharacterStyles = (name: string) => {
  const characterName = name.toLowerCase();
  
  const positions: Record<string, { backgroundPosition: string; backgroundSize: string }> = {
    ahri: { backgroundPosition: '-65px -10px', backgroundSize: '400px' },
    blitzcrank: { backgroundPosition: '-160px 4px', backgroundSize: '500px' },
    braum: { backgroundPosition: '-190px -44px', backgroundSize: '460px' },
    darius: { backgroundPosition: '-292px -54px', backgroundSize: '540px' },
    ekko: { backgroundPosition: '-94px -34px', backgroundSize: '400px' },
    illaoi: { backgroundPosition: '-110px -58px', backgroundSize: '400px' },
    jinx: { backgroundPosition: '-52px -60px', backgroundSize: '400px' },
    vi: { backgroundPosition: '-86px -10px', backgroundSize: '400px' },
    yasuo: { backgroundPosition: '-196px -62px', backgroundSize: '540px' }
  };

  return positions[characterName] || { backgroundPosition: 'center', backgroundSize: '400px' };
};

export default function CharacterImage({ name, src, variant = 'card', size = 128 }: CharacterImageProps) {
  const characterStyles = getCharacterStyles(name);
  
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
              className="absolute h-full w-[180%] -left-[50px] bg-no-repeat transition-all duration-200 ease-out"
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: characterStyles.backgroundPosition,
                backgroundSize: characterStyles.backgroundSize
              }}
            />
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
            className="absolute h-full w-[180%] -left-[50px] bg-no-repeat transition-all duration-200 ease-out"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: characterStyles.backgroundPosition,
              backgroundSize: characterStyles.backgroundSize
            }}
          />
        </div>
        <div className="character-card__label">
          <span className="character-card__name">{name}</span>
        </div>
      </div>
    </article>
  );
}
