import { CharacterDescription, PronounMapping, CharacterReference } from "@/types/story";

/**
 * Service for resolving pronouns to specific characters across story scenes
 */
export class PronounResolver {
  private characterMap: Map<string, CharacterDescription> = new Map();
  private pronounMappings: Map<string, PronounMapping[]> = new Map();

  constructor(characters: CharacterDescription[]) {
    this.initializeCharacters(characters);
  }

  private initializeCharacters(characters: CharacterDescription[]) {
    characters.forEach((char, index) => {
      const characterId = `char_${index}_${char.name.toLowerCase().replace(/\s+/g, '_')}`;
      this.characterMap.set(characterId, {
        ...char,
        pronouns: char.pronouns || this.inferPronouns(char.name),
        aliases: char.aliases || [char.name, char.name.toLowerCase()]
      });
    });
  }

  private inferPronouns(name: string): string[] {
    // Simple heuristic - can be enhanced with more sophisticated logic
    const maleNames = ['john', 'david', 'michael', 'james', 'robert', 'william', 'richard', 'thomas'];
    const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica'];
    
    const lowerName = name.toLowerCase();
    
    if (maleNames.some(male => lowerName.includes(male))) {
      return ['he', 'him', 'his'];
    } else if (femaleNames.some(female => lowerName.includes(female))) {
      return ['she', 'her', 'hers'];
    }
    
    return ['they', 'them', 'their'];
  }

  /**
   * Resolve pronouns in a paragraph to specific characters
   */
  public resolvePronounsInText(text: string, sceneIndex: number): {
    resolvedText: string;
    characterReferences: CharacterReference[];
    pronounMappings: PronounMapping[];
  } {
    const pronounMappings: PronounMapping[] = [];
    const characterReferences: CharacterReference[] = [];
    const characterUsage = new Map<string, number>();

    let resolvedText = text;

    // First pass: identify direct character mentions
    this.characterMap.forEach((char, characterId) => {
      const allNames = [char.name, ...(char.aliases || [])];
      
      allNames.forEach(name => {
        const regex = new RegExp(`\\b${name}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          characterUsage.set(characterId, (characterUsage.get(characterId) || 0) + matches.length);
        }
      });
    });

    // Second pass: resolve pronouns
    const pronounRegex = /\b(he|she|they|him|her|them|his|hers|their|theirs)\b/gi;
    const pronounMatches = text.match(pronounRegex);

    if (pronounMatches) {
      pronounMatches.forEach(pronoun => {
        const mapping = this.resolvePronoun(pronoun, text, characterUsage, sceneIndex);
        if (mapping) {
          pronounMappings.push(mapping);
          
          // Replace pronoun with character reference in resolved text
          const character = this.characterMap.get(mapping.characterId);
          if (character && mapping.confidence > 0.7) {
            const pronounRegex = new RegExp(`\\b${pronoun}\\b`, 'i');
            resolvedText = resolvedText.replace(pronounRegex, character.name);
          }
        }
      });
    }

    // Create character references for all mentioned characters
    characterUsage.forEach((usage, characterId) => {
      const character = this.characterMap.get(characterId);
      if (character) {
        characterReferences.push({
          characterId,
          name: character.name,
          pronouns: character.pronouns || [],
          appearance: character.appearance,
          roleInScene: usage > 2 ? 'primary' : usage > 0 ? 'secondary' : 'mentioned',
          visualConsistencyWeight: Math.min(usage / 3, 1.0)
        });
      }
    });

    return {
      resolvedText,
      characterReferences,
      pronounMappings
    };
  }

  private resolvePronoun(
    pronoun: string, 
    text: string, 
    characterUsage: Map<string, number>,
    sceneIndex: number
  ): PronounMapping | null {
    const lowerPronoun = pronoun.toLowerCase();
    let bestMatch: { characterId: string; confidence: number } | null = null;
    const contextClues: string[] = [];

    // Find the position of the pronoun in text for context analysis
    const pronounIndex = text.toLowerCase().indexOf(lowerPronoun);
    const contextBefore = text.substring(Math.max(0, pronounIndex - 100), pronounIndex);
    const contextAfter = text.substring(pronounIndex, Math.min(text.length, pronounIndex + 100));

    this.characterMap.forEach((character, characterId) => {
      if (!character.pronouns?.includes(lowerPronoun)) return;

      let confidence = 0;

      // Factor 1: Recent mention in same paragraph
      const allNames = [character.name, ...(character.aliases || [])];
      const recentMention = allNames.some(name => 
        contextBefore.toLowerCase().includes(name.toLowerCase())
      );
      
      if (recentMention) {
        confidence += 0.6;
        contextClues.push(`Recent mention of ${character.name}`);
      }

      // Factor 2: Character prominence in scene
      const usage = characterUsage.get(characterId) || 0;
      if (usage > 0) {
        confidence += Math.min(usage * 0.2, 0.4);
        contextClues.push(`Character usage: ${usage}`);
      }

      // Factor 3: Sentence structure analysis
      const sentences = text.split(/[.!?]+/);
      const currentSentence = sentences.find(s => s.toLowerCase().includes(lowerPronoun));
      if (currentSentence) {
        const mentionedInSameSentence = allNames.some(name =>
          currentSentence.toLowerCase().includes(name.toLowerCase())
        );
        if (mentionedInSameSentence) {
          confidence += 0.3;
          contextClues.push('Same sentence reference');
        }
      }

      // Factor 4: Previous scene continuity (if available)
      const previousMappings = this.pronounMappings.get(`scene_${sceneIndex - 1}`);
      if (previousMappings) {
        const previousMapping = previousMappings.find(m => 
          m.pronoun.toLowerCase() === lowerPronoun && m.characterId === characterId
        );
        if (previousMapping) {
          confidence += 0.2 * previousMapping.confidence;
          contextClues.push('Previous scene continuity');
        }
      }

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { characterId, confidence };
      }
    });

    if (bestMatch && bestMatch.confidence > 0.3) {
      const mapping: PronounMapping = {
        pronoun: lowerPronoun,
        characterId: bestMatch.characterId,
        confidence: bestMatch.confidence,
        contextClues
      };

      // Store mapping for future reference
      const sceneKey = `scene_${sceneIndex}`;
      if (!this.pronounMappings.has(sceneKey)) {
        this.pronounMappings.set(sceneKey, []);
      }
      this.pronounMappings.get(sceneKey)!.push(mapping);

      return mapping;
    }

    return null;
  }

  /**
   * Get all character references for consistency tracking
   */
  public getAllCharacters(): Map<string, CharacterDescription> {
    return new Map(this.characterMap);
  }

  /**
   * Get pronoun mappings for a specific scene
   */
  public getSceneMappings(sceneIndex: number): PronounMapping[] {
    return this.pronounMappings.get(`scene_${sceneIndex}`) || [];
  }
}