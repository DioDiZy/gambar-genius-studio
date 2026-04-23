import { CharacterDescription } from "@/types/story";

export interface CharacterMemory {
  name: string;
  anchor: string;
  referenceImages: string[];
}

export function createCharacterMemory(characters: CharacterDescription[]): CharacterMemory[] {
  return characters.map((char) => {
    const anchor = `${char.name}, ${char.appearance}`.replace(/\n/g, " ").trim();
    return {
      name: char.name,
      anchor,
      referenceImages: char.referenceImages ?? [], // ← TAMBAH INI
    };
  });
}

export function buildScenePrompt(scene: string, memories: CharacterMemory[], style: string): string {
  const sceneBlock = `${scene}.`;
  const styleBlock = `children storybook illustration, bright colors, soft lighting, cute cartoon style.`;
  const characterBlock =
    memories.length > 0
      ? `Characters: ${memories
          .map((m) => {
            const shortAppearance = m.anchor
              .replace(m.name + ",", "")
              .split(",")
              .slice(0, 3)
              .join(",")
              .trim();
            return `${m.name} (${shortAppearance})`;
          })
          .join("; ")}.`
      : "";

  return [sceneBlock, styleBlock, characterBlock].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
