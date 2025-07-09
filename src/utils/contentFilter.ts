
// Content filtering utility to prevent inappropriate content
export interface ContentFilterResult {
  isAppropriate: boolean;
  reason?: string;
}

// Lists of inappropriate keywords in English and Indonesian
const inappropriateKeywords = {
  english: [
    // Violence
    'kill', 'murder', 'death', 'blood', 'violence', 'weapon', 'gun', 'knife', 'sword', 'bomb', 'explosion', 'fight', 'war', 'battle', 'torture', 'abuse', 'assault', 'attack', 'harm', 'hurt', 'pain', 'wound', 'injury', 'corpse', 'dead body',
    
    // Sexual content
    'sex', 'sexual', 'porn', 'pornography', 'nude', 'naked', 'breast', 'genital', 'penis', 'vagina', 'erotic', 'seductive', 'arousal', 'orgasm', 'masturbation', 'intercourse', 'fetish', 'kinky', 'bdsm', 'adult content',
    
    // Harassment/Bullying
    'harassment', 'bullying', 'discrimination', 'racist', 'sexist', 'hate', 'offensive', 'insulting', 'degrading', 'humiliating', 'threatening',
    
    // Drugs
    'drug', 'cocaine', 'heroin', 'marijuana', 'cannabis', 'meth', 'ecstasy', 'lsd', 'alcohol abuse', 'drunk', 'intoxicated', 'overdose',
    
    // Self-harm
    'suicide', 'self-harm', 'cutting', 'depression', 'anxiety disorder', 'mental illness'
  ],
  
  indonesian: [
    // Kekerasan
    'bunuh', 'pembunuhan', 'kematian', 'darah', 'kekerasan', 'senjata', 'pistol', 'pisau', 'pedang', 'bom', 'ledakan', 'berkelahi', 'perang', 'pertempuran', 'penyiksaan', 'pelecehan', 'penyerangan', 'serangan', 'menyakiti', 'sakit', 'luka', 'cedera', 'mayat', 'tubuh mati',
    
    // Konten seksual
    'seks', 'seksual', 'porno', 'pornografi', 'telanjang', 'bugil', 'payudara', 'kelamin', 'penis', 'vagina', 'erotis', 'menggoda', 'gairah', 'orgasme', 'masturbasi', 'hubungan intim', 'fetish', 'dewasa',
    
    // Pelecehan/Bullying
    'pelecehan', 'intimidasi', 'diskriminasi', 'rasis', 'seksis', 'kebencian', 'menyinggung', 'menghina', 'merendahkan', 'mempermalukan', 'mengancam',
    
    // Narkoba
    'narkoba', 'kokain', 'heroin', 'ganja', 'sabu', 'ekstasi', 'mabuk', 'overdosis',
    
    // Menyakiti diri sendiri
    'bunuh diri', 'menyakiti diri', 'depresi', 'gangguan mental'
  ]
};

export const filterContent = (text: string, language: 'english' | 'indonesian' = 'english'): ContentFilterResult => {
  const normalizedText = text.toLowerCase().trim();
  
  if (!normalizedText) {
    return { isAppropriate: true };
  }
  
  // Check for inappropriate keywords based on language
  const keywordsToCheck = [
    ...inappropriateKeywords.english,
    ...inappropriateKeywords.indonesian
  ];
  
  for (const keyword of keywordsToCheck) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian' 
          ? 'Konten tidak pantas terdeteksi. Silakan gunakan bahasa yang lebih sopan.'
          : 'Inappropriate content detected. Please use more appropriate language.'
      };
    }
  }
  
  // Additional pattern checks
  const inappropriatePatterns = [
    /\b(xxx|18\+|adult only|nsfw)\b/i,
    /\b(kill.*child|hurt.*child|abuse.*child)\b/i,
    /\b(anak.*bunuh|anak.*sakiti|anak.*leceh)\b/i
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(normalizedText)) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian'
          ? 'Konten tidak pantas terdeteksi. Silakan gunakan bahasa yang lebih sopan.'
          : 'Inappropriate content detected. Please use more appropriate language.'
      };
    }
  }
  
  return { isAppropriate: true };
};

// Validate story content by checking each paragraph
export const validateStoryContent = (story: string, separator: string = '\n\n', language: 'english' | 'indonesian' = 'english'): ContentFilterResult => {
  const paragraphs = story.split(separator).filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const result = filterContent(paragraph, language);
    if (!result.isAppropriate) {
      return result;
    }
  }
  
  return { isAppropriate: true };
};
