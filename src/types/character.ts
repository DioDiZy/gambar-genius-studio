export interface DetailedCharacter {
  id: string;
  name: string;
  role: string;
  age: string;
  personality: string;
  physicalTraits: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyShape: string;
  mainOutfit: string;
  dominantColor: string;
  typicalExpression: string;
  signatureAccessory: string;
  relationships: string;
  lockedFields: string[];
  referenceImages?: string[];
  // legacy compat
  appearance?: string;
}

export interface StoryScene {
  id: string;
  order: number;
  title: string;
  summary: string;
  characterIds: string[];
  location: string;
  timeOfDay: string;
  mainAction: string;
  mainEmotion: string;
  importantDialogue: string;
  pageNarration: string;
  sceneGoal: string;
  prevConnection: string;
  nextConnection: string;
  consistencyNotes: string;
}

export interface ConsistencyIssue {
  type: 'missing_data' | 'broken_reference' | 'needs_attention' | 'consistent';
  target: string;
  targetId: string;
  message: string;
  suggestion: string;
}

export function generateCharacterPromptBlock(char: DetailedCharacter): string {
  const parts: string[] = [];
  if (char.name) parts.push(char.name);
  if (char.age) parts.push(`${char.age} years old`);
  if (char.hairStyle || char.hairColor) parts.push(`${char.hairColor} ${char.hairStyle} hair`.trim());
  if (char.eyeColor) parts.push(`${char.eyeColor} eyes`);
  if (char.bodyShape) parts.push(char.bodyShape);
  if (char.mainOutfit) parts.push(`wearing ${char.mainOutfit}`);
  if (char.dominantColor) parts.push(`dominant color ${char.dominantColor}`);
  if (char.signatureAccessory) parts.push(`with ${char.signatureAccessory}`);
  if (char.typicalExpression) parts.push(`${char.typicalExpression} expression`);
  if (char.physicalTraits) parts.push(char.physicalTraits);
  return parts.join(', ');
}

export function createEmptyCharacter(): DetailedCharacter {
  return {
    id: crypto.randomUUID(),
    name: '', role: '', age: '', personality: '',
    physicalTraits: '', hairStyle: '', hairColor: '', eyeColor: '',
    bodyShape: '', mainOutfit: '', dominantColor: '',
    typicalExpression: '', signatureAccessory: '', relationships: '',
    lockedFields: [], referenceImages: [],
  };
}

export function createEmptyScene(order: number): StoryScene {
  return {
    id: crypto.randomUUID(),
    order,
    title: '', summary: '', characterIds: [],
    location: '', timeOfDay: '', mainAction: '', mainEmotion: '',
    importantDialogue: '', pageNarration: '', sceneGoal: '',
    prevConnection: '', nextConnection: '', consistencyNotes: '',
  };
}