export type Character = {
  id: string;
  slug: string;
  name: string;
  portraitUrl: string;
};

type BaseChar = Omit<Character, "portraitUrl"> & { imagePrefix: string };
const raw: BaseChar[] = [
  { id: "ahri", slug: "ahri", name: "Ahri", imagePrefix: "2xko_ahri" },
  { id: "blitzcrank", slug: "blitzcrank", name: "Blitzcrank", imagePrefix: "2xko_blitzcrank" },
  { id: "braum", slug: "braum", name: "Braum", imagePrefix: "2xko_braum" },
  { id: "darius", slug: "darius", name: "Darius", imagePrefix: "2xko_darius" },
  { id: "ekko", slug: "ekko", name: "Ekko", imagePrefix: "2xko_ekko" },
  { id: "illaoi", slug: "illaoi", name: "Illaoi", imagePrefix: "2xko_illaoi" },
  { id: "jinx", slug: "jinx", name: "Jinx", imagePrefix: "2xko_jinx" },
  { id: "vi", slug: "vi", name: "Vi", imagePrefix: "2xko_vi" },
  { id: "yasuo", slug: "yasuo", name: "Yasuo", imagePrefix: "2xko_yasuo" },
];

export const characters: Character[] = raw.map((c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  portraitUrl: `/assets/600px-${c.name}_cs.png`,
}));

export function findCharacter(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}


