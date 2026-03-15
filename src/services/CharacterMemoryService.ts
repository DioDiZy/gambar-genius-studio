import { CharacterDescription } from "@/types/story";

export interface CharacterMemory {
  name: string;
  anchor: string;
}

export function createCharacterMemory(characters: CharacterDescription[]): CharacterMemory[] {
  return characters.map((char) => {
    const anchor = `
${char.name},
${char.appearance},
`;

    return {
      name: char.name,
      anchor: anchor.replace(/\n/g, " ").trim(),
    };
  });
}
export function buildScenePrompt(scene: string, memories: CharacterMemory[], style: string): string {
  const characterBlock = memories.map((m) => m.anchor).join(", ");

  const styleBlock = `
children storybook illustration,
bright colors,
soft lighting,
cute cartoon style,
simple shapes
`;

  const prompt = `
${characterBlock},
scene: ${scene},
${styleBlock}
`;

  return prompt.replace(/\n/g, " ").trim();
}
