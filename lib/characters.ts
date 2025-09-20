export type Character = {
  id: string;
  slug: string;
  name: string;
  portraitUrl: string;
  backgroundPosition: string;
  backgroundSize: string;
};

type BaseChar = {
  id: string;
  slug: string;
  name: string;
  backgroundPosition: string;
  backgroundSize: string;
};

const characterData: BaseChar[] = [
  { id: "ahri", slug: "ahri", name: "Ahri", backgroundPosition: '-65px -10px', backgroundSize: '400px' },
  { id: "blitzcrank", slug: "blitzcrank", name: "Blitzcrank", backgroundPosition: '-160px 4px', backgroundSize: '500px' },
  { id: "braum", slug: "braum", name: "Braum", backgroundPosition: '-190px -44px', backgroundSize: '460px' },
  { id: "darius", slug: "darius", name: "Darius", backgroundPosition: '-292px -54px', backgroundSize: '540px' },
  { id: "ekko", slug: "ekko", name: "Ekko", backgroundPosition: '-94px -34px', backgroundSize: '400px' },
  { id: "illaoi", slug: "illaoi", name: "Illaoi", backgroundPosition: '-110px -58px', backgroundSize: '400px' },
  { id: "jinx", slug: "jinx", name: "Jinx", backgroundPosition: '-52px -60px', backgroundSize: '400px' },
  { id: "vi", slug: "vi", name: "Vi", backgroundPosition: '-86px -10px', backgroundSize: '400px' },
  { id: "yasuo", slug: "yasuo", name: "Yasuo", backgroundPosition: '-196px -62px', backgroundSize: '540px' },
];

export const characters: Character[] = characterData.map((c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  portraitUrl: `/assets/600px-${c.name}_cs.png`,
  backgroundPosition: c.backgroundPosition,
  backgroundSize: c.backgroundSize,
}));

export function findCharacter(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}

export function getCharacterStyles(name: string) {
  const character = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
  return character 
    ? { backgroundPosition: character.backgroundPosition, backgroundSize: character.backgroundSize }
    : { backgroundPosition: 'center', backgroundSize: '400px' };
}
