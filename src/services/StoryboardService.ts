import { translateForImageGeneration } from "./TranslationService";
import { CharacterDescription } from "@/types/story";
import { createCharacterMemory, buildScenePrompt } from "./CharacterMemoryService";
export interface StoryboardContext {
  previousScenes: string[];
  visualMemory: VisualElement[];
  sceneTransitions: SceneTransition[];
  cameraAngles: string[];
  lighting: string[];
  environments: string[];
}

export interface VisualElement {
  type: "character" | "location" | "object" | "lighting" | "composition";
  description: string;
  consistency_weight: number;
}

export interface SceneTransition {
  from_scene: number;
  to_scene: number;
  transition_type: "cut" | "fade" | "pan" | "zoom" | "match_cut";
  visual_connection: string;
}

/**
 * Analyze story structure to identify scenes, characters, and transitions
 */
export function analyzeStoryStructure(paragraphs: string[]): {
  scenes: Array<{ paragraph: string; scene_type: string; location: string; characters: string[] }>;
  transitions: SceneTransition[];
} {
  const scenes = paragraphs.map((paragraph, index) => {
    // Detect scene indicators
    const isNewLocation = /\b(in the|at the|outside|inside|somewhere|meanwhile|later|then|next)\b/i.test(paragraph);
    const isTimeChange = /\b(morning|evening|night|day|hour|minute|later|after|before)\b/i.test(paragraph);
    const isActionScene = /\b(running|fighting|moving|walking|driving|flying)\b/i.test(paragraph);
    const isDialogueScene = /["']|said|asked|replied|whispered|shouted/i.test(paragraph);

    // Determine scene type
    let scene_type = "action";
    if (isDialogueScene) scene_type = "dialogue";
    if (isNewLocation || isTimeChange) scene_type = "establishing";

    // Extract potential location
    const locationMatch = paragraph.match(/\b(?:in|at|on|inside|outside|near|by)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\s|,|\.)/i);
    const location = locationMatch ? locationMatch[1].trim() : "unknown";

    // Extract character mentions (simple approach)
    const characterMentions: string[] = [];
    const commonCharacterWords = /\b(he|she|they|him|her|them|his|hers|their|man|woman|person|character)\b/gi;
    const matches = paragraph.match(commonCharacterWords);
    if (matches) {
      characterMentions.push(...matches);
    }

    return {
      paragraph,
      scene_type,
      location,
      characters: [...new Set(characterMentions)],
    };
  });

  // Generate transitions between scenes
  const transitions: SceneTransition[] = [];
  for (let i = 0; i < scenes.length - 1; i++) {
    const currentScene = scenes[i];
    const nextScene = scenes[i + 1];

    let transition_type: SceneTransition["transition_type"] = "cut";
    let visual_connection = "";

    // Determine transition type based on scene analysis
    if (currentScene.location === nextScene.location) {
      transition_type = "match_cut";
      visual_connection = `Same location: ${currentScene.location}`;
    } else if (currentScene.scene_type === "establishing" || nextScene.scene_type === "establishing") {
      transition_type = "fade";
      visual_connection = `Location change from ${currentScene.location} to ${nextScene.location}`;
    } else if (currentScene.characters.some((char) => nextScene.characters.includes(char))) {
      transition_type = "pan";
      visual_connection = `Following character movement`;
    }

    transitions.push({
      from_scene: i,
      to_scene: i + 1,
      transition_type,
      visual_connection,
    });
  }

  return { scenes, transitions };
}

/**
 * Build visual memory from previous scenes to maintain continuity
 */
export function buildVisualMemory(sceneIndex: number, scenes: Array<{ paragraph: string; scene_type: string; location: string; characters: string[] }>, characters: CharacterDescription[]): VisualElement[] {
  const visualElements: VisualElement[] = [];

  // Add character consistency elements
  characters.forEach((char) => {
    visualElements.push({
      type: "character",
      description: `${char.name} with consistent ${char.appearance}`,
      consistency_weight: 1.0,
    });
  });

  // Add location consistency for scenes in same location
  const currentLocation = scenes[sceneIndex]?.location;
  const previousScenesInSameLocation = scenes.slice(0, sceneIndex).filter((scene) => scene.location === currentLocation);

  if (previousScenesInSameLocation.length > 0) {
    visualElements.push({
      type: "location",
      description: `Consistent ${currentLocation} environment as established in previous scenes`,
      consistency_weight: 0.8,
    });
  }

  // Add lighting consistency based on scene progression
  let lightingContext = "";
  if (sceneIndex > 0) {
    const timeIndicators = scenes
      .slice(0, sceneIndex + 1)
      .map((scene) => scene.paragraph)
      .join(" ")
      .match(/\b(morning|afternoon|evening|night|dawn|dusk|daylight|darkness)\b/gi);

    if (timeIndicators) {
      const latestTime = timeIndicators[timeIndicators.length - 1];
      lightingContext = `${latestTime} lighting consistent with story progression`;
      visualElements.push({
        type: "lighting",
        description: lightingContext,
        consistency_weight: 0.6,
      });
    }
  }

  return visualElements;
}

/**
 * Generate cinematic composition instructions based on scene type and position
 */
export function generateCompositionInstructions(sceneIndex: number, totalScenes: number, sceneType: string, transition?: SceneTransition): string {
  const instructions: string[] = [];

  // Frame composition based on scene position
  if (sceneIndex === 0) {
    instructions.push("establishing wide shot");
  } else if (sceneIndex === totalScenes - 1) {
    instructions.push("concluding medium shot");
  } else {
    // Vary shots for middle scenes
    const shotTypes = ["medium shot", "close-up shot", "medium-wide shot"];
    const shotType = shotTypes[sceneIndex % shotTypes.length];
    instructions.push(shotType);
  }

  // Scene type specific instructions
  switch (sceneType) {
    case "dialogue":
      instructions.push("focused on character expressions");
      break;
    case "action":
      instructions.push("dynamic composition with clear action lines");
      break;
    case "establishing":
      instructions.push("wide angle showing environment and context");
      break;
  }

  // Transition specific instructions
  if (transition) {
    switch (transition.transition_type) {
      case "match_cut":
        instructions.push("matching camera angle and framing for visual continuity");
        break;
      case "pan":
        instructions.push("horizontal composition allowing for camera movement");
        break;
      case "zoom":
        instructions.push("centered composition for zoom transition");
        break;
    }
  }

  return instructions.join(", ");
}

/**
 * Create enhanced prompts with storyboard continuity
 */
export async function createStoryboardPrompts(paragraphs: string[], characters: CharacterDescription[], style: string, characterDescriptions: string, language: "english" | "indonesian"): Promise<string[]> {
  // Import and use the enhanced service
  const { EnhancedStoryboardService } = await import("./EnhancedStoryboardService");
  const enhancedService = new EnhancedStoryboardService(characters);

  const storyboardPrompts = await enhancedService.createStructuredPrompts(paragraphs, style, characterDescriptions, language);

  return enhancedService.getSimplifiedPrompts();
}

/**
 * Create structured JSON prompts with pronoun resolution and enhanced continuity
 */
export async function createStructuredStoryboardPrompts(paragraphs: string[], characters: CharacterDescription[], style: string, characterDescriptions: string, language: "english" | "indonesian") {
  // Try AI-powered FLUX.1 prompt generation via edge function
  try {
    const { supabase } = await import("@/integrations/supabase/client");

    console.log("Calling generate-flux-prompts edge function for AI-powered prompt generation...");

    const { data, error } = await supabase.functions.invoke("generate-flux-prompts", {
      body: {
        paragraphs,
        characters: characters.map((c) => ({
          name: c.name,
          appearance: c.appearance,
          referenceImages: c.referenceImages ?? [],
        })),
        characterDescriptions,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Edge function failed");
    }

    if (data?.prompts && Array.isArray(data.prompts) && data.prompts.length > 0) {
      console.log("AI-generated FLUX.1 prompts:", data.prompts);
      return {
        prompts: data.prompts,
        structuredData: data.scenes || [],
        metadata: {
          totalScenes: paragraphs.length,
          charactersResolved: characters.length,
          enhancedFormat: true,
          characterProfiles: data.character_profiles || [],
        },
      };
    }

    throw new Error("No prompts returned from AI");
  } catch (err) {
    console.warn("AI prompt generation failed, falling back to local method:", err);
  }

  // Fallback: local translation + simple prompt building
  const memories = createCharacterMemory(characters);
  const prompts: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const translated = await translateForImageGeneration(paragraphs[i]);
    const prompt = buildScenePrompt(translated, memories, style);
    prompts.push(prompt);
  }

  return {
    prompts,
    structuredData: [],
    metadata: {
      totalScenes: paragraphs.length,
      charactersResolved: characters.length,
      enhancedFormat: false,
    },
  };
}
/**
 * Legacy function - maintained for backward compatibility
 */
export async function createLegacyStoryboardPrompts(paragraphs: string[], characters: CharacterDescription[], style: string, characterDescriptions: string, language: "english" | "indonesian"): Promise<string[]> {
  const { scenes, transitions } = analyzeStoryStructure(paragraphs);
  const enhancedPrompts: string[] = [];

  // Style mapping
  const styleMap: Record<string, string> = {
    photorealistic: "highly detailed photorealistic style with realistic lighting and textures",
    "digital-art": "vibrant digital art style with rich colors",
    anime: "anime style with clean lines and expressive characters",
    "3d-render": "3D rendered style with depth and realistic materials",
    "oil-painting": "oil painting style with visible brush strokes and rich textures",
    watercolor: "delicate watercolor style with soft color blending",
    "comic-book": "comic book style with bold outlines and flat colors",
    "storyboard-sketch": "professional storyboard sketch style with clear scene composition",
  };

  const styleDescription = styleMap[style] || styleMap["photorealistic"];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const transition = transitions.find((t) => t.to_scene === i);
    const visualMemory = buildVisualMemory(i, scenes, characters);

    // Start with translated paragraph
    let enhancedPrompt = await translateForImageGeneration(scene.paragraph);

    // Add style
    enhancedPrompt += `, ${styleDescription}`;

    // Add composition instructions
    const compositionInstructions = generateCompositionInstructions(i, scenes.length, scene.scene_type, transition);
    enhancedPrompt += `, ${compositionInstructions}`;

    // Add character consistency
    if (characters.length > 0) {
      const characterPrompts = await Promise.all(
        characters.map(async (char) => {
          const translatedAppearance = await translateForImageGeneration(char.appearance);
          return `${char.name} (${translatedAppearance}, consistent appearance throughout all scenes)`;
        }),
      );
      enhancedPrompt += `. Characters in scene: ${characterPrompts.join("; ")}`;
    }

    // Add visual memory for continuity
    if (visualMemory.length > 0) {
      const memoryDescriptions = visualMemory.filter((vm) => vm.consistency_weight > 0.5).map((vm) => vm.description);
      if (memoryDescriptions.length > 0) {
        enhancedPrompt += `. Visual continuity: ${memoryDescriptions.join(", ")}`;
      }
    }

    // Add scene-specific context
    if (i > 0) {
      enhancedPrompt += `. Continuing from previous scene with visual consistency`;
    }

    // Add transition context
    if (transition) {
      enhancedPrompt += `. ${transition.visual_connection}`;
    }

    // Add character descriptions
    if (characterDescriptions.trim()) {
      const translatedDescriptions = await translateForImageGeneration(characterDescriptions);
      enhancedPrompt += `. Scene details: ${translatedDescriptions}`;
    }

    // Add storyboard framing
    enhancedPrompt += `. Professional storyboard frame with clear subject focus and cinematic composition`;

    // Add language context
    if (language === "indonesian") {
      enhancedPrompt += ". Visual representation should match Indonesian cultural context where appropriate";
    }

    enhancedPrompts.push(enhancedPrompt);
  }

  return enhancedPrompts;
}
