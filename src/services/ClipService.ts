
import { pipeline } from "@huggingface/transformers";

interface ClipScore {
  score: number;
  confidence: "high" | "medium" | "low";
}

interface ConsistencyResult {
  isConsistent: boolean;
  score: number;
  issues: string[];
}

interface ClipValidationResult {
  promptAccuracy: ClipScore;
  characterConsistency?: ConsistencyResult;
  recommendations: string[];
}

export class ClipService {
  private static clipModel: any = null;

  private static async initializeClip() {
    if (!this.clipModel) {
      console.log("Initializing CLIP model...");
      this.clipModel = await pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch32",
        { device: "webgpu" }
      );
      console.log("CLIP model initialized successfully");
    }
    return this.clipModel;
  }

  // Validate image against text prompt
  static async validateImageAccuracy(
    imageUrl: string,
    prompt: string
  ): Promise<ClipScore> {
    try {
      const model = await this.initializeClip();
      
      // Create variations of the prompt for better accuracy
      const prompts = [
        prompt,
        `An image of ${prompt}`,
        `A photo showing ${prompt}`,
        `A scene depicting ${prompt}`
      ];

      const results = await model(imageUrl, { candidate_labels: prompts });
      
      // Get the highest score from the variations
      const maxScore = Math.max(...results.map((r: any) => r.score));
      
      const confidence = maxScore > 0.7 ? "high" : maxScore > 0.4 ? "medium" : "low";
      
      console.log("Image accuracy validation:", { prompt, score: maxScore, confidence });
      
      return {
        score: maxScore,
        confidence
      };
    } catch (error) {
      console.error("Error validating image accuracy:", error);
      return {
        score: 0,
        confidence: "low"
      };
    }
  }

  // Check character consistency across multiple images
  static async validateCharacterConsistency(
    imageUrls: string[],
    characterDescriptions: string[]
  ): Promise<ConsistencyResult> {
    try {
      if (imageUrls.length < 2 || characterDescriptions.length === 0) {
        return {
          isConsistent: true,
          score: 1,
          issues: []
        };
      }

      const model = await this.initializeClip();
      const scores: number[] = [];
      const issues: string[] = [];

      // For each character description, check consistency across images
      for (const character of characterDescriptions) {
        const characterPrompts = [
          `A person with ${character}`,
          `Character with ${character}`,
          `Someone who has ${character}`
        ];

        const imageScores: number[] = [];
        
        for (const imageUrl of imageUrls) {
          const results = await model(imageUrl, { candidate_labels: characterPrompts });
          const maxScore = Math.max(...results.map((r: any) => r.score));
          imageScores.push(maxScore);
        }

        // Calculate variance in scores - lower variance means more consistent
        const mean = imageScores.reduce((a, b) => a + b, 0) / imageScores.length;
        const variance = imageScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / imageScores.length;
        const consistency = 1 - Math.min(variance * 2, 1); // Normalize variance to 0-1 scale

        scores.push(consistency);

        if (consistency < 0.6) {
          issues.push(`Character "${character}" appears inconsistent across images`);
        }
      }

      const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
      
      console.log("Character consistency validation:", { 
        overallScore, 
        isConsistent: overallScore > 0.6,
        issues 
      });

      return {
        isConsistent: overallScore > 0.6,
        score: overallScore,
        issues
      };
    } catch (error) {
      console.error("Error validating character consistency:", error);
      return {
        isConsistent: false,
        score: 0,
        issues: ["Failed to validate character consistency"]
      };
    }
  }

  // Comprehensive validation of generated images
  static async validateGeneratedImages(
    imageUrls: string[],
    prompts: string[],
    characterDescriptions: string[] = []
  ): Promise<ClipValidationResult[]> {
    const results: ClipValidationResult[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const prompt = prompts[i];

      // Validate prompt accuracy
      const promptAccuracy = await this.validateImageAccuracy(imageUrl, prompt);
      
      // Validate character consistency (only for story generation with multiple images)
      let characterConsistency: ConsistencyResult | undefined;
      if (characterDescriptions.length > 0 && imageUrls.length > 1) {
        characterConsistency = await this.validateCharacterConsistency(
          imageUrls,
          characterDescriptions
        );
      }

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (promptAccuracy.confidence === "low") {
        recommendations.push("Consider refining your prompt to be more specific and descriptive");
      }
      
      if (characterConsistency && !characterConsistency.isConsistent) {
        recommendations.push("Character appearances may be inconsistent - try adding more detailed character descriptions");
      }
      
      if (promptAccuracy.score < 0.3) {
        recommendations.push("Generated image may not match the intended description - consider regenerating");
      }

      results.push({
        promptAccuracy,
        characterConsistency,
        recommendations
      });
    }

    return results;
  }
}
