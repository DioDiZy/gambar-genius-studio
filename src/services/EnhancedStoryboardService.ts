import { translateForImageGeneration } from "./TranslationService";
import { PronounResolver } from "./PronounResolver";
import { 
  CharacterDescription, 
  StoryboardPrompt, 
  VisualElement, 
  SceneMetadata, 
  ContinuityLink 
} from "@/types/story";

/**
 * Enhanced storyboard service with JSON-structured prompting and pronoun resolution
 */
export class EnhancedStoryboardService {
  private pronounResolver: PronounResolver;
  private sceneHistory: StoryboardPrompt[] = [];

  constructor(characters: CharacterDescription[]) {
    this.pronounResolver = new PronounResolver(characters);
  }

  /**
   * Create structured storyboard prompts with enhanced accuracy and continuity
   */
  public async createStructuredPrompts(
    paragraphs: string[],
    style: string,
    characterDescriptions: string,
    language: "english" | "indonesian"
  ): Promise<StoryboardPrompt[]> {
    const storyboardPrompts: StoryboardPrompt[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const prompt = await this.createScenePrompt(
        paragraphs[i], 
        i, 
        paragraphs.length, 
        style, 
        characterDescriptions, 
        language
      );
      storyboardPrompts.push(prompt);
      this.sceneHistory.push(prompt);
    }

    return storyboardPrompts;
  }

  private async createScenePrompt(
    originalText: string,
    sceneIndex: number,
    totalScenes: number,
    style: string,
    characterDescriptions: string,
    language: "english" | "indonesian"
  ): Promise<StoryboardPrompt> {
    // Resolve pronouns and get character references
    const { resolvedText, characterReferences, pronounMappings } = 
      this.pronounResolver.resolvePronounsInText(originalText, sceneIndex);

    // Analyze scene metadata
    const sceneMetadata = this.analyzeSceneMetadata(resolvedText, sceneIndex, totalScenes);

    // Create visual elements
    const visualElements = this.createVisualElements(
      resolvedText, 
      characterReferences, 
      sceneMetadata, 
      sceneIndex
    );

    // Generate continuity links
    const continuityLinks = this.generateContinuityLinks(
      visualElements, 
      sceneIndex
    );

    // Create enhanced prompt
    const enhancedPrompt = await this.buildEnhancedPrompt(
      resolvedText,
      characterReferences,
      visualElements,
      sceneMetadata,
      style,
      characterDescriptions,
      language,
      sceneIndex
    );

    return {
      sceneIndex,
      originalText,
      enhancedPrompt,
      characters: characterReferences,
      visualElements,
      sceneMetadata,
      continuityLinks
    };
  }

  private analyzeSceneMetadata(
    text: string, 
    sceneIndex: number, 
    totalScenes: number
  ): SceneMetadata {
    // Determine scene type
    let sceneType: SceneMetadata['sceneType'] = 'action';
    if (text.match(/["']|said|asked|replied|whispered|shouted/i)) {
      sceneType = 'dialogue';
    } else if (sceneIndex === 0 || text.match(/\b(in the|at the|outside|inside|meanwhile|later)\b/i)) {
      sceneType = 'establishing';
    } else if (sceneIndex === totalScenes - 1) {
      sceneType = 'climax';
    } else if (text.match(/\b(then|next|after|suddenly|meanwhile)\b/i)) {
      sceneType = 'transition';
    }

    // Extract location
    const locationMatch = text.match(/\b(?:in|at|on|inside|outside|near|by)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\s|,|\.)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'unspecified location';

    // Determine time of day
    const timeMatch = text.match(/\b(morning|afternoon|evening|night|dawn|dusk|daylight|darkness)\b/i);
    const timeOfDay = timeMatch ? timeMatch[1].toLowerCase() : undefined;

    // Determine camera angle based on scene type and position
    let cameraAngle = 'medium shot';
    if (sceneType === 'establishing') {
      cameraAngle = 'wide shot';
    } else if (sceneType === 'dialogue') {
      cameraAngle = 'close-up';
    } else if (sceneIndex === 0) {
      cameraAngle = 'establishing wide shot';
    }

    // Analyze emotional tone
    const emotionalTone = this.analyzeEmotionalTone(text);

    // Identify visual focus elements
    const visualFocus = this.extractVisualFocus(text);

    return {
      sceneType,
      location,
      timeOfDay,
      cameraAngle,
      emotionalTone,
      visualFocus
    };
  }

  private analyzeEmotionalTone(text: string): string {
    const emotionKeywords = {
      tense: ['danger', 'fear', 'urgent', 'quickly', 'rushed', 'panic'],
      peaceful: ['calm', 'gentle', 'quiet', 'serene', 'peaceful', 'relaxed'],
      dramatic: ['intense', 'powerful', 'dramatic', 'climax', 'conflict'],
      mysterious: ['dark', 'shadow', 'secret', 'hidden', 'mystery', 'unknown'],
      joyful: ['happy', 'joy', 'celebration', 'laughter', 'bright', 'cheerful']
    };

    let bestMatch = 'neutral';
    let maxMatches = 0;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = emotion;
      }
    });

    return bestMatch;
  }

  private extractVisualFocus(text: string): string[] {
    const focus: string[] = [];
    
    // Extract objects and important elements
    const objectMatches = text.match(/\b(door|window|car|house|tree|mountain|river|bridge|road|building)\b/gi);
    if (objectMatches) {
      focus.push(...objectMatches.map(match => match.toLowerCase()));
    }

    // Extract actions for visual focus
    const actionMatches = text.match(/\b(running|walking|fighting|talking|looking|holding|wearing)\b/gi);
    if (actionMatches) {
      focus.push(...actionMatches.map(match => `${match.toLowerCase()} action`));
    }

    return [...new Set(focus)];
  }

  private createVisualElements(
    text: string,
    characterReferences: any[],
    sceneMetadata: SceneMetadata,
    sceneIndex: number
  ): VisualElement[] {
    const elements: VisualElement[] = [];
    let elementId = 0;

    // Add character elements
    characterReferences.forEach(char => {
      elements.push({
        type: 'character',
        id: `scene_${sceneIndex}_char_${elementId++}`,
        description: `${char.name} with ${char.appearance}`,
        consistencyWeight: char.visualConsistencyWeight,
        crossReferenceId: char.characterId
      });
    });

    // Add location element
    if (sceneMetadata.location !== 'unspecified location') {
      elements.push({
        type: 'location',
        id: `scene_${sceneIndex}_loc_${elementId++}`,
        description: sceneMetadata.location,
        consistencyWeight: 0.8
      });
    }

    // Add lighting element
    if (sceneMetadata.timeOfDay) {
      elements.push({
        type: 'lighting',
        id: `scene_${sceneIndex}_light_${elementId++}`,
        description: `${sceneMetadata.timeOfDay} lighting`,
        consistencyWeight: 0.6
      });
    }

    // Add atmosphere element
    elements.push({
      type: 'atmosphere',
      id: `scene_${sceneIndex}_atm_${elementId++}`,
      description: `${sceneMetadata.emotionalTone} atmosphere`,
      consistencyWeight: 0.5
    });

    // Add composition element
    elements.push({
      type: 'composition',
      id: `scene_${sceneIndex}_comp_${elementId++}`,
      description: sceneMetadata.cameraAngle,
      consistencyWeight: 0.7
    });

    return elements;
  }

  private generateContinuityLinks(
    currentElements: VisualElement[],
    sceneIndex: number
  ): ContinuityLink[] {
    const links: ContinuityLink[] = [];

    if (sceneIndex === 0 || this.sceneHistory.length === 0) {
      return links;
    }

    const previousScene = this.sceneHistory[sceneIndex - 1];
    
    // Link characters across scenes
    currentElements
      .filter(elem => elem.type === 'character' && elem.crossReferenceId)
      .forEach(currentChar => {
        const previousChar = previousScene.visualElements.find(elem => 
          elem.type === 'character' && elem.crossReferenceId === currentChar.crossReferenceId
        );

        if (previousChar) {
          links.push({
            linkType: 'character',
            sourceElementId: previousChar.id,
            targetElementId: currentChar.id,
            connectionStrength: Math.min(currentChar.consistencyWeight, previousChar.consistencyWeight),
            description: `Character continuity for ${currentChar.crossReferenceId}`
          });
        }
      });

    // Link locations if same
    const currentLocation = currentElements.find(elem => elem.type === 'location');
    const previousLocation = previousScene.visualElements.find(elem => elem.type === 'location');
    
    if (currentLocation && previousLocation && 
        currentLocation.description === previousLocation.description) {
      links.push({
        linkType: 'location',
        sourceElementId: previousLocation.id,
        targetElementId: currentLocation.id,
        connectionStrength: 0.9,
        description: `Location continuity: ${currentLocation.description}`
      });
    }

    return links;
  }

  private async buildEnhancedPrompt(
    resolvedText: string,
    characterReferences: any[],
    visualElements: VisualElement[],
    sceneMetadata: SceneMetadata,
    style: string,
    characterDescriptions: string,
    language: "english" | "indonesian",
    sceneIndex: number
  ): Promise<string> {
    // Use structured prompt engine v2.0 for storyboard-sketch style
    if (style === "storyboard-sketch") {
      return this.buildStoryboardSketchPrompt(
        resolvedText,
        characterReferences,
        sceneMetadata,
        characterDescriptions,
        language,
        sceneIndex
      );
    }

    // Default prompt building for other styles
    let prompt = await translateForImageGeneration(resolvedText);

    const styleMap: Record<string, string> = {
      "photorealistic": "highly detailed photorealistic style with realistic lighting and textures",
      "digital-art": "vibrant digital art style with rich colors",
      "anime": "anime style with clean lines and expressive characters",
      "3d-render": "3D rendered style with depth and realistic materials",
      "oil-painting": "oil painting style with visible brush strokes and rich textures",
      "watercolor": "delicate watercolor style with soft color blending",
      "comic-book": "comic book style with bold outlines and flat colors",
    };
    
    const styleDescription = styleMap[style] || styleMap["photorealistic"];
    prompt += `, ${styleDescription}`;

    prompt += `, ${sceneMetadata.cameraAngle}`;
    prompt += `, ${sceneMetadata.emotionalTone} atmosphere`;

    if (characterReferences.length > 0) {
      const charDetails = characterReferences
        .filter(char => char.roleInScene === 'primary' || char.roleInScene === 'secondary')
        .map(char => `${char.name} (${char.appearance}, consistent appearance)`)
        .join('; ');
      if (charDetails) {
        prompt += `. Characters: ${charDetails}`;
      }
    }

    if (sceneIndex > 0) {
      const continuityElements = visualElements
        .filter(elem => elem.consistencyWeight > 0.7)
        .map(elem => elem.description);
      if (continuityElements.length > 0) {
        prompt += `. Visual continuity: ${continuityElements.join(', ')}`;
      }
    }

    if (characterDescriptions.trim()) {
      const translatedDescriptions = await translateForImageGeneration(characterDescriptions);
      prompt += `. Additional details: ${translatedDescriptions}`;
    }

    // Add scene continuity context from previous scenes
    if (sceneIndex > 0 && this.sceneHistory.length > 0) {
      const prevScene = this.sceneHistory[sceneIndex - 1];
      if (prevScene.sceneMetadata.location !== 'unspecified location') {
        prompt += `. Scene takes place ${prevScene.sceneMetadata.location === sceneMetadata.location ? 'in the same location as previous scene' : 'in a new location, maintaining time continuity'}`;
      }
      if (prevScene.sceneMetadata.timeOfDay && sceneMetadata.timeOfDay) {
        prompt += `, ${sceneMetadata.timeOfDay} lighting consistent with story progression`;
      }
    }

    prompt += `. Professional storyboard frame, clear composition, cinematic quality. No text, no watermarks, no letters, no writing on the image`;

    if (language === "indonesian") {
      prompt += ". Include Indonesian cultural context where appropriate";
    }

    return prompt;
  }

  /**
   * Prompt Engine v2.0 — Structured prompt for Storyboard Sketch style (Flux.1-dev)
   */
  private async buildStoryboardSketchPrompt(
    resolvedText: string,
    characterReferences: any[],
    sceneMetadata: SceneMetadata,
    characterDescriptions: string,
    language: "english" | "indonesian",
    sceneIndex: number
  ): Promise<string> {
    const translatedScene = await translateForImageGeneration(resolvedText);

    // PREFIX: style preset
    const prefix = "Storyboard Sketch style, professional storyboard panel.";

    // CHARACTER ANCHOR: primary character with full description
    let characterAnchor = "";
    let referenceImageUrls: string[] = [];
    if (characterReferences.length > 0) {
      const primary = characterReferences.find(c => c.roleInScene === 'primary') || characterReferences[0];
      characterAnchor = `Core Character: ${primary.name}, ${primary.appearance}.`;
      
      // Collect reference images from the original character data
      const originalChar = this.pronounResolver.getCharacterByName(primary.name);
      if (originalChar?.referenceImages && originalChar.referenceImages.length > 0) {
        referenceImageUrls = originalChar.referenceImages;
        characterAnchor += ` [Character has ${referenceImageUrls.length} visual reference image(s) for consistency].`;
      }
    }

    // SCENE ACTION: the paragraph content
    const sceneAction = `Current Scene: ${translatedScene}.`;

    // ENVIRONMENT: additional instructions + lighting + atmosphere
    const envParts: string[] = [];
    envParts.push(`${sceneMetadata.cameraAngle}`);
    if (sceneMetadata.timeOfDay) {
      envParts.push(`${sceneMetadata.timeOfDay} lighting`);
    }
    envParts.push(`${sceneMetadata.emotionalTone} atmosphere`);
    if (characterDescriptions.trim()) {
      const translatedDesc = await translateForImageGeneration(characterDescriptions);
      envParts.push(translatedDesc);
    }
    const environment = `Environment & Lighting: ${envParts.join(', ')}.`;

    // Scene continuity from previous panels
    let sceneContinuity = "";
    if (sceneIndex > 0 && this.sceneHistory.length > 0) {
      const prevScene = this.sceneHistory[sceneIndex - 1];
      if (prevScene.sceneMetadata.location !== 'unspecified location') {
        sceneContinuity = prevScene.sceneMetadata.location === sceneMetadata.location
          ? `Same location as previous panel.`
          : `New location, maintaining time continuity from previous panel.`;
      }
      if (prevScene.sceneMetadata.timeOfDay && sceneMetadata.timeOfDay) {
        sceneContinuity += ` ${sceneMetadata.timeOfDay} lighting consistent with story progression.`;
      }
    }

    // SUFFIX: character consistency enforcement + anti-artifact
    let suffix = "High quality sketch. No text, no watermarks, no letters, no writing on the image.";
    if (characterReferences.length > 0) {
      const primary = characterReferences.find(c => c.roleInScene === 'primary') || characterReferences[0];
      suffix = `Ensuring ${primary.name} looks exactly the same as previous panels. High quality sketch. No text, no watermarks, no letters, no writing on the image.`;
    }

    // Panel-specific weighting (re-enforce on panel 3+ to prevent drift)
    let panelWeighting = "";
    if (sceneIndex === 0) {
      panelWeighting = "Focus on character introduction and setting.";
    } else if (sceneIndex === 1) {
      panelWeighting = "Focus on interaction with environment.";
    } else {
      // Every 3rd panel or later: critical re-enforcement
      const primary = characterReferences.find(c => c.roleInScene === 'primary') || characterReferences[0];
      const charName = primary?.name || "the character";
      panelWeighting = `CRITICAL: Re-enforce character features to prevent drift. Focus on ${charName}'s reaction.`;
    }

    // Secondary characters
    let secondaryChars = "";
    const secondaries = characterReferences.filter(c => c.roleInScene === 'secondary');
    if (secondaries.length > 0) {
      secondaryChars = ` Also present: ${secondaries.map(c => `${c.name} (${c.appearance})`).join('; ')}.`;
    }

    const fullPrompt = [prefix, characterAnchor, sceneAction, environment, sceneContinuity, panelWeighting, suffix, secondaryChars]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return fullPrompt;
  }

  /**
   * Get the complete storyboard data as JSON
   */
  public getStoryboardJSON(): StoryboardPrompt[] {
    return this.sceneHistory;
  }

  /**
   * Export prompts in simplified format for image generation
   */
  public getSimplifiedPrompts(): string[] {
    return this.sceneHistory.map(scene => scene.enhancedPrompt);
  }
}