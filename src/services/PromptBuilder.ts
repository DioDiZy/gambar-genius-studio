import { CharacterDescription } from "@/types/story";
import { CharacterMemory } from "./CharacterMemoryService";
export function buildScenePrompt(scene: string, memories: CharacterMemory[]) {
  const characterText = memories.map((m) => m.anchor).join(" and ");

  const prompt = `
${characterText},
${scene},
cute children storybook illustration,
bright colors,
soft lighting
`;

  return prompt.replace(/\n/g, " ").trim();
}
export function simplifyScene(paragraph: string): string {
  const maxLength = 200;

  if (paragraph.length > maxLength) {
    return paragraph.slice(0, maxLength);
  }

  return paragraph;
}
