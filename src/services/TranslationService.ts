
// Translation service using Google Translate API
export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  detectedLanguage?: string;
}

export async function translateText(text: string, targetLanguage: string = 'en'): Promise<TranslationResponse> {
  try {
    // Use Google Translate API via a free service
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|${targetLanguage}`);
    
    if (!response.ok) {
      throw new Error('Translation service unavailable');
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return {
        translatedText: data.responseData.translatedText,
        originalText: text,
        detectedLanguage: 'id'
      };
    } else {
      // Fallback: return original text if translation fails
      return {
        translatedText: text,
        originalText: text
      };
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return {
      translatedText: text,
      originalText: text
    };
  }
}

// Function to detect if text is likely Indonesian
export function isIndonesianText(text: string): boolean {
  const indonesianWords = [
    'adalah', 'dengan', 'untuk', 'dari', 'yang', 'dalam', 'akan', 'pada', 'atau', 'juga',
    'tidak', 'dapat', 'telah', 'ini', 'itu', 'mereka', 'kita', 'dia', 'saya', 'kami',
    'dan', 'ke', 'di', 'sebuah', 'suatu', 'bisa', 'harus', 'sudah', 'belum', 'sedang',
    'bagaimana', 'dimana', 'kapan', 'mengapa', 'siapa', 'apa', 'mana', 'berapa'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const indonesianWordCount = words.filter(word => 
    indonesianWords.some(indoWord => word.includes(indoWord))
  ).length;
  
  // If more than 20% of words are Indonesian, consider it Indonesian text
  return (indonesianWordCount / words.length) > 0.2;
}

// Function to translate Indonesian text to English for better image generation
export async function translateForImageGeneration(text: string): Promise<string> {
  // Only translate if the text appears to be Indonesian
  if (isIndonesianText(text)) {
    const translation = await translateText(text, 'en');
    console.log('Translated Indonesian text:', {
      original: text,
      translated: translation.translatedText
    });
    return translation.translatedText;
  }
  
  return text;
}
