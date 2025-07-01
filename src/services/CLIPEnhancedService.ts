
// CLIP-Enhanced Service for better Indonesian prompt-to-image matching
import { IndonesianNLPService, ProcessedPrompt } from './IndonesianNLPService';

export interface CLIPEnhancedPrompt {
  originalPrompt: string;
  clipOptimizedPrompt: string;
  visualKeywords: string[];
  semanticContext: string[];
  qualityEnhancers: string[];
}

export class CLIPEnhancedService {
  // Visual quality enhancers that work well with CLIP models
  private static readonly QUALITY_ENHANCERS = [
    'highly detailed',
    'professional quality',
    'sharp focus',
    'vivid colors',
    'excellent composition',
    'masterpiece quality',
    'photorealistic rendering',
    'perfect lighting'
  ];

  // Visual style mappings optimized for CLIP understanding
  private static readonly VISUAL_STYLE_MAPPINGS = {
    'photorealistic': ['photographic quality', 'realistic rendering', 'lifelike appearance'],
    'digital-art': ['digital painting', 'concept art style', 'digital illustration'],
    'anime': ['anime art style', 'manga illustration', 'Japanese animation style'],
    '3d-render': ['3D rendered', 'computer graphics', 'CGI quality'],
    'oil-painting': ['oil painting technique', 'traditional painting style', 'artistic brushwork'],
    'watercolor': ['watercolor painting', 'soft color blending', 'artistic transparency'],
    'comic-book': ['comic book art', 'graphic novel style', 'bold illustration'],
    'storybook-sketch': ['children\'s book illustration', 'storybook art', 'narrative illustration']
  };

  // Indonesian-specific visual context enhancers
  private static readonly INDONESIAN_VISUAL_CONTEXTS = {
    'landscape': ['tropical Indonesian landscape', 'Southeast Asian scenery', 'Indonesian natural beauty'],
    'architecture': ['Indonesian traditional architecture', 'tropical building design', 'Southeast Asian structures'],
    'people': ['Indonesian people', 'Southeast Asian appearance', 'Indonesian cultural dress'],
    'food': ['Indonesian cuisine presentation', 'traditional Indonesian food styling', 'Asian culinary art'],
    'culture': ['Indonesian cultural scene', 'traditional Indonesian ceremony', 'Indonesian heritage display']
  };

  static enhancePromptWithCLIP(
    prompt: string, 
    style: string = 'photorealistic',
    language: string = 'indonesian'
  ): CLIPEnhancedPrompt {
    // First, process with Indonesian NLP
    const nlpResult: ProcessedPrompt = IndonesianNLPService.processIndonesianPrompt(prompt);
    
    // Extract visual keywords that CLIP models understand well
    const visualKeywords = this.extractVisualKeywords(nlpResult.keywords);
    
    // Build semantic context for better CLIP alignment
    const semanticContext = this.buildSemanticContext(nlpResult, language);
    
    // Select appropriate quality enhancers
    const qualityEnhancers = this.selectQualityEnhancers(style);
    
    // Build CLIP-optimized prompt
    const clipOptimizedPrompt = this.buildCLIPOptimizedPrompt(
      nlpResult.enhancedPrompt,
      visualKeywords,
      semanticContext,
      qualityEnhancers,
      style
    );

    return {
      originalPrompt: prompt,
      clipOptimizedPrompt,
      visualKeywords,
      semanticContext,
      qualityEnhancers
    };
  }

  private static extractVisualKeywords(keywords: string[]): string[] {
    // Keywords that are particularly important for visual generation
    const visualKeywordPatterns = [
      /color|warna|merah|biru|hijau|kuning|putih|hitam/i,
      /size|ukuran|besar|kecil|tinggi|pendek/i,
      /action|aksi|berlari|terbang|duduk|berdiri/i,
      /object|objek|rumah|mobil|pohon|bunga/i,
      /emotion|emosi|bahagia|sedih|marah|takut/i
    ];

    return keywords.filter(keyword => 
      visualKeywordPatterns.some(pattern => pattern.test(keyword))
    );
  }

  private static buildSemanticContext(nlpResult: ProcessedPrompt, language: string): string[] {
    const context: string[] = [];
    
    // Add cultural context if present
    if (nlpResult.culturalContext.length > 0) {
      context.push(...nlpResult.culturalContext.slice(0, 2));
    }
    
    // Add semantic enhancements
    if (nlpResult.semanticEnhancement.length > 0) {
      context.push(...nlpResult.semanticEnhancement.slice(0, 3));
    }
    
    // Add Indonesian-specific visual context
    if (language === 'indonesian') {
      context.push('Indonesian cultural context', 'Southeast Asian visual style');
    }
    
    return context;
  }

  private static selectQualityEnhancers(style: string): string[] {
    const baseEnhancers = this.QUALITY_ENHANCERS.slice(0, 3);
    const styleSpecific = this.VISUAL_STYLE_MAPPINGS[style] || [];
    
    return [...baseEnhancers, ...styleSpecific.slice(0, 2)];
  }

  private static buildCLIPOptimizedPrompt(
    basePrompt: string,
    visualKeywords: string[],
    semanticContext: string[],
    qualityEnhancers: string[],
    style: string
  ): string {
    let optimized = basePrompt;
    
    // Add visual keywords for better CLIP understanding
    if (visualKeywords.length > 0) {
      optimized += `, emphasizing ${visualKeywords.slice(0, 3).join(', ')}`;
    }
    
    // Add semantic context
    if (semanticContext.length > 0) {
      optimized += `, ${semanticContext.slice(0, 3).join(', ')}`;
    }
    
    // Add quality enhancers
    if (qualityEnhancers.length > 0) {
      optimized += `, ${qualityEnhancers.slice(0, 3).join(', ')}`;
    }
    
    // Add CLIP-specific optimization phrases
    optimized += ', optimized for visual clarity and semantic accuracy';
    
    return optimized;
  }

  // Method to validate prompt quality for CLIP models
  static validatePromptForCLIP(prompt: string): {
    isOptimal: boolean;
    suggestions: string[];
    score: number;
  } {
    const suggestions: string[] = [];
    let score = 0;
    
    // Check for visual descriptors
    if (/color|shape|size|texture/i.test(prompt)) score += 20;
    else suggestions.push('Add color or size descriptions');
    
    // Check for clear objects/subjects
    if (/\b(cat|dog|house|tree|person|car)\b/i.test(prompt)) score += 20;
    else suggestions.push('Include clear object descriptions');
    
    // Check for style indicators
    if (/style|art|painting|photo/i.test(prompt)) score += 15;
    else suggestions.push('Specify artistic style');
    
    // Check for composition hints
    if (/background|foreground|center|left|right/i.test(prompt)) score += 15;
    else suggestions.push('Add composition details');
    
    // Check length (CLIP works better with detailed but not overly long prompts)
    const wordCount = prompt.split(' ').length;
    if (wordCount >= 10 && wordCount <= 50) score += 20;
    else if (wordCount < 10) suggestions.push('Add more descriptive details');
    else suggestions.push('Simplify prompt (too long)');
    
    // Bonus for Indonesian cultural elements
    if (IndonesianNLPService.containsIndonesianCulture(prompt)) score += 10;
    
    return {
      isOptimal: score >= 70,
      suggestions,
      score
    };
  }
}
