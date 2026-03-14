
export interface CharacterDescription {
  name: string;
  appearance: string;
  referenceImages?: string[];
  pronouns?: string[];
  aliases?: string[];
}

export interface StoryboardPrompt {
  sceneIndex: number;
  originalText: string;
  enhancedPrompt: string;
  characters: CharacterReference[];
  visualElements: VisualElement[];
  sceneMetadata: SceneMetadata;
  continuityLinks: ContinuityLink[];
}

export interface CharacterReference {
  characterId: string;
  name: string;
  pronouns: string[];
  appearance: string;
  roleInScene: 'primary' | 'secondary' | 'mentioned';
  visualConsistencyWeight: number;
}

export interface VisualElement {
  type: 'character' | 'location' | 'object' | 'lighting' | 'composition' | 'atmosphere';
  id: string;
  description: string;
  consistencyWeight: number;
  crossReferenceId?: string;
}

export interface SceneMetadata {
  sceneType: 'establishing' | 'action' | 'dialogue' | 'transition' | 'climax';
  location: string;
  timeOfDay?: string;
  cameraAngle: string;
  emotionalTone: string;
  visualFocus: string[];
}

export interface ContinuityLink {
  linkType: 'character' | 'location' | 'object' | 'lighting' | 'narrative';
  sourceElementId: string;
  targetElementId: string;
  connectionStrength: number;
  description: string;
}

export interface PronounMapping {
  pronoun: string;
  characterId: string;
  confidence: number;
  contextClues: string[];
}
