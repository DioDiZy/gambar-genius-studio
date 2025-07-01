
// Indonesian NLP Service for better prompt processing
// Inspired by https://github.com/sastrawi/nlp-bahasa-indonesia

export interface ProcessedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  keywords: string[];
  culturalContext: string[];
  semanticEnhancement: string[];
}

export class IndonesianNLPService {
  // Indonesian stopwords (kata penghenti)
  private static readonly STOPWORDS = [
    'yang', 'dan', 'di', 'ke', 'dari', 'dengan', 'untuk', 'pada', 'dalam', 'adalah',
    'akan', 'telah', 'sudah', 'sedang', 'sangat', 'lebih', 'paling', 'juga', 'tidak',
    'bukan', 'belum', 'masih', 'hanya', 'saja', 'dapat', 'bisa', 'mampu', 'boleh'
  ];

  // Indonesian root words and their semantic enhancements
  private static readonly SEMANTIC_ENHANCEMENTS = {
    // Nature and animals (Alam dan hewan)
    'kucing': ['domestic cat', 'feline creature'],
    'anjing': ['domestic dog', 'canine companion'], 
    'burung': ['bird', 'avian creature'],
    'ikan': ['fish', 'aquatic creature'],
    'bunga': ['flower', 'blooming plant'],
    'pohon': ['tree', 'large plant'],
    'gunung': ['mountain', 'high elevation landscape'],
    'laut': ['ocean', 'sea', 'large body of water'],
    'sungai': ['river', 'flowing water'],
    'hutan': ['forest', 'woodland area'],
    
    // Colors (Warna)
    'merah': ['red', 'crimson', 'scarlet'],
    'biru': ['blue', 'azure', 'cerulean'],
    'hijau': ['green', 'emerald', 'verdant'],
    'kuning': ['yellow', 'golden', 'amber'],
    'putih': ['white', 'pristine', 'pure'],
    'hitam': ['black', 'dark', 'ebony'],
    'coklat': ['brown', 'chocolate', 'earth-toned'],
    'ungu': ['purple', 'violet', 'lavender'],
    
    // Emotions and characteristics (Emosi dan karakteristik)
    'bahagia': ['happy', 'joyful', 'cheerful'],
    'sedih': ['sad', 'melancholy', 'sorrowful'],
    'marah': ['angry', 'furious', 'irate'],
    'takut': ['afraid', 'frightened', 'scared'],
    'cantik': ['beautiful', 'lovely', 'attractive'],
    'jelek': ['ugly', 'unattractive', 'unsightly'],
    'besar': ['big', 'large', 'huge'],
    'kecil': ['small', 'tiny', 'little'],
    
    // Actions (Aksi)
    'berlari': ['running', 'sprinting', 'jogging'],
    'berjalan': ['walking', 'strolling', 'moving'],
    'terbang': ['flying', 'soaring', 'airborne'],
    'berenang': ['swimming', 'floating', 'in water'],
    'bermain': ['playing', 'having fun', 'recreational activity'],
    'tidur': ['sleeping', 'resting', 'lying down'],
    'makan': ['eating', 'consuming food', 'feeding'],
    
    // Places and settings (Tempat dan latar)
    'rumah': ['house', 'home', 'residential building'],
    'sekolah': ['school', 'educational institution'],
    'taman': ['garden', 'park', 'green space'],
    'pantai': ['beach', 'shoreline', 'coastal area'],
    'kota': ['city', 'urban area', 'metropolitan'],
    'desa': ['village', 'rural area', 'countryside'],
    
    // Weather and time (Cuaca dan waktu)
    'hujan': ['rain', 'precipitation', 'water droplets'],
    'panas': ['hot', 'warm', 'sunny weather'],
    'dingin': ['cold', 'chilly', 'cool temperature'],
    'siang': ['daytime', 'noon', 'bright daylight'],
    'malam': ['night', 'evening', 'dark time'],
    'pagi': ['morning', 'dawn', 'early day']
  };

  // Indonesian cultural context mappings
  private static readonly CULTURAL_CONTEXTS = {
    'batik': ['traditional Indonesian textile pattern', 'intricate geometric designs'],
    'wayang': ['traditional Indonesian puppet show', 'shadow puppet theater'],
    'gamelan': ['traditional Indonesian musical ensemble', 'bronze percussion instruments'],
    'angklung': ['traditional Indonesian bamboo musical instrument'],
    'keris': ['traditional Indonesian ceremonial dagger', 'cultural artifact'],
    'tari': ['traditional Indonesian dance', 'cultural performance'],
    'kebaya': ['traditional Indonesian blouse', 'cultural clothing'],
    'sarong': ['traditional Indonesian wrap-around garment'],
    'nasi': ['rice', 'Indonesian staple food'],
    'rendang': ['traditional Indonesian spiced meat dish'],
    'gudeg': ['traditional Javanese jackfruit dish'],
    'sate': ['Indonesian grilled meat skewers', 'satay'],
    'gado-gado': ['Indonesian mixed vegetable salad'],
    'rujak': ['Indonesian fruit salad with spicy dressing']
  };

  static processIndonesianPrompt(prompt: string): ProcessedPrompt {
    const words = this.tokenize(prompt);
    const filteredWords = this.removeStopwords(words);
    const keywords = this.extractKeywords(filteredWords);
    const culturalContext = this.identifyCulturalContext(words);
    const semanticEnhancement = this.getSemanticEnhancements(filteredWords);
    
    const enhancedPrompt = this.buildEnhancedPrompt(
      prompt, 
      keywords, 
      culturalContext, 
      semanticEnhancement
    );

    return {
      originalPrompt: prompt,
      enhancedPrompt,
      keywords,
      culturalContext,
      semanticEnhancement
    };
  }

  private static tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private static removeStopwords(words: string[]): string[] {
    return words.filter(word => !this.STOPWORDS.includes(word));
  }

  private static extractKeywords(words: string[]): string[] {
    // Extract important keywords that should be emphasized
    return words.filter(word => 
      this.SEMANTIC_ENHANCEMENTS[word] || 
      this.CULTURAL_CONTEXTS[word] ||
      word.length > 3
    );
  }

  private static identifyCulturalContext(words: string[]): string[] {
    const contexts: string[] = [];
    
    words.forEach(word => {
      if (this.CULTURAL_CONTEXTS[word]) {
        contexts.push(...this.CULTURAL_CONTEXTS[word]);
      }
    });

    return contexts;
  }

  private static getSemanticEnhancements(words: string[]): string[] {
    const enhancements: string[] = [];
    
    words.forEach(word => {
      if (this.SEMANTIC_ENHANCEMENTS[word]) {
        enhancements.push(...this.SEMANTIC_ENHANCEMENTS[word]);
      }
    });

    return enhancements;
  }

  private static buildEnhancedPrompt(
    original: string, 
    keywords: string[], 
    culturalContext: string[], 
    semanticEnhancement: string[]
  ): string {
    let enhanced = original;

    // Add semantic enhancements
    if (semanticEnhancement.length > 0) {
      enhanced += `, featuring ${semanticEnhancement.slice(0, 3).join(', ')}`;
    }

    // Add cultural context
    if (culturalContext.length > 0) {
      enhanced += `, with Indonesian cultural elements: ${culturalContext.slice(0, 2).join(', ')}`;
    }

    // Add quality and style improvements for Indonesian context
    enhanced += ', high quality Indonesian art style, detailed and culturally appropriate';

    return enhanced;
  }

  // Method to check if text contains Indonesian cultural elements
  static containsIndonesianCulture(text: string): boolean {
    const words = this.tokenize(text);
    return words.some(word => this.CULTURAL_CONTEXTS[word]);
  }

  // Method to get Indonesian-specific style recommendations
  static getIndonesianStyleRecommendations(): string[] {
    return [
      'Indonesian traditional art style',
      'Southeast Asian cultural context',
      'Tropical Indonesian landscape',
      'Indonesian architectural elements',
      'Traditional Indonesian patterns and motifs',
      'Indonesian natural environment'
    ];
  }
}
