
// Enhanced content filtering utility with improved Indonesian language support
export interface ContentFilterResult {
  isAppropriate: boolean;
  reason?: string;
}

// Comprehensive inappropriate keywords in English and Indonesian
const inappropriateKeywords = {
  english: [
    // Violence
    'kill', 'murder', 'death', 'blood', 'violence', 'weapon', 'gun', 'knife', 'sword', 'bomb', 'explosion', 'fight', 'war', 'battle', 'torture', 'abuse', 'assault', 'attack', 'harm', 'hurt', 'pain', 'wound', 'injury', 'corpse', 'dead body', 'shoot', 'stab', 'beat', 'punch', 'kick',
    
    // Sexual content
    'sex', 'sexual', 'porn', 'pornography', 'nude', 'naked', 'breast', 'genital', 'penis', 'vagina', 'erotic', 'seductive', 'arousal', 'orgasm', 'masturbation', 'intercourse', 'fetish', 'kinky', 'bdsm', 'adult content', 'xxx', 'nsfw', 'horny', 'sexy', 'hot', 'boobs', 'ass', 'butt', 'dick', 'cock', 'pussy', 'anal', 'oral', 'cum', 'climax',
    
    // Harassment/Bullying
    'harassment', 'bullying', 'discrimination', 'racist', 'sexist', 'hate', 'offensive', 'insulting', 'degrading', 'humiliating', 'threatening', 'bully', 'tease', 'mock', 'ridicule',
    
    // Drugs & Alcohol
    'drug', 'cocaine', 'heroin', 'marijuana', 'cannabis', 'meth', 'ecstasy', 'lsd', 'alcohol abuse', 'drunk', 'intoxicated', 'overdose', 'weed', 'crack', 'pills', 'beer', 'wine', 'vodka', 'whiskey',
    
    // Self-harm & Mental Health
    'suicide', 'self-harm', 'cutting', 'depression', 'anxiety disorder', 'mental illness', 'kill myself', 'end my life', 'hurt myself'
  ],
  
  indonesian: [
    // Kekerasan
    'bunuh', 'pembunuhan', 'kematian', 'darah', 'kekerasan', 'senjata', 'pistol', 'pisau', 'pedang', 'bom', 'ledakan', 'berkelahi', 'perang', 'pertempuran', 'penyiksaan', 'pelecehan', 'penyerangan', 'serangan', 'menyakiti', 'sakit', 'luka', 'cedera', 'mayat', 'tubuh mati', 'menembak', 'menikam', 'memukul', 'meninju', 'menendang', 'membunuh', 'membantai', 'menganiaya', 'menyiksa', 'melukai', 'mencederai',
    
    // Konten seksual
    'seks', 'seksual', 'porno', 'pornografi', 'telanjang', 'bugil', 'payudara', 'kelamin', 'penis', 'vagina', 'erotis', 'menggoda', 'gairah', 'orgasme', 'masturbasi', 'hubungan intim', 'fetish', 'dewasa', 'xxx', 'bokep', 'birahi', 'seksi', 'panas', 'toket', 'memek', 'kontol', 'titit', 'pantat', 'bokong', 'anal', 'oral', 'crot', 'klimaks', 'ngentot', 'ngewe', 'ml', 'making love', 'bercinta', 'bersetubuh',
    
    // Pelecehan/Bullying
    'pelecehan', 'intimidasi', 'diskriminasi', 'rasis', 'seksis', 'kebencian', 'menyinggung', 'menghina', 'merendahkan', 'mempermalukan', 'mengancam', 'mem-bully', 'mengejek', 'mencemooh', 'meremehkan', 'melecehkan', 'mengganggu', 'mengusik',
    
    // Narkoba & Alkohol
    'narkoba', 'kokain', 'heroin', 'ganja', 'sabu', 'ekstasi', 'mabuk', 'overdosis', 'alkohol', 'bir', 'anggur', 'vodka', 'whisky', 'miras', 'minuman keras', 'obat terlarang', 'dadah', 'cimeng', 'pil koplo',
    
    // Menyakiti diri sendiri & Kesehatan Mental
    'bunuh diri', 'menyakiti diri', 'depresi', 'gangguan mental', 'ingin mati', 'mengakhiri hidup', 'menyakiti diri sendiri', 'potong nadi', 'gantung diri'
  ]
};

// Enhanced pattern matching for Indonesian context
const inappropriatePatterns = [
  // General adult content markers
  /\b(xxx|18\+|adult only|nsfw|21\+|dewasa saja)\b/i,
  
  // Violence patterns
  /\b(kill.*child|hurt.*child|abuse.*child|bunuh.*anak|sakiti.*anak|aniaya.*anak)\b/i,
  /\b(membunuh|menyakiti|menganiaya).*(anak|bocah|kecil)\b/i,
  
  // Sexual content patterns
  /\b(naked|telanjang|bugil).*(child|anak|bocah)\b/i,
  /\b(seks|sex|ngentot|ngewe|ml|bercinta).*(anak|bocah|kecil|minor)\b/i,
  
  // Drug/alcohol patterns
  /\b(minum|konsumsi|pakai).*(alkohol|miras|narkoba|obat)\b/i,
  /\b(drinking|using|taking).*(alcohol|drugs|pills)\b/i,
  
  // Self-harm patterns
  /\b(bunuh|kill).*(diri|myself|sendiri)\b/i,
  /\b(potong|cut).*(nadi|wrist|tangan)\b/i,
  
  // Indonesian slang and inappropriate terms
  /\b(kontol|memek|ngentot|ngewe|bokep|crot|colmek|coli|onani)\b/i,
  /\b(anjing|bangsat|brengsek|kampret|sialan).*(lu|kamu|anda)\b/i,
];

// Additional Indonesian-specific inappropriate words
const indonesianSlang = [
  'anjing', 'bangsat', 'brengsek', 'kampret', 'sialan', 'bajingan', 'babi', 'monyet', 'goblok', 'tolol', 'bodoh banget', 'idiot', 'stupid', 'kontol', 'memek', 'titit', 'toket', 'bokong', 'pantat', 'bokep', 'ngentot', 'ngewe', 'crot', 'colmek', 'coli', 'onani', 'masturbasi', 'birahi', 'nafsu', 'horny'
];

export const filterContent = (text: string, language: 'english' | 'indonesian' = 'indonesian'): ContentFilterResult => {
  const normalizedText = text.toLowerCase().trim();
  
  if (!normalizedText) {
    return { isAppropriate: true };
  }
  
  // Check for inappropriate keywords based on language priority
  const keywordsToCheck = language === 'indonesian' 
    ? [...inappropriateKeywords.indonesian, ...indonesianSlang, ...inappropriateKeywords.english]
    : [...inappropriateKeywords.english, ...inappropriateKeywords.indonesian];
  
  for (const keyword of keywordsToCheck) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian' 
          ? 'Kata-kata tidak pantas terdeteksi. Aplikasi ini untuk anak-anak, gunakan bahasa yang sopan dan sesuai.'
          : 'Inappropriate content detected. This app is for children, please use appropriate language.'
      };
    }
  }
  
  // Check against patterns
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(normalizedText)) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian'
          ? 'Konten tidak pantas terdeteksi. Aplikasi ini dirancang untuk anak-anak, mohon gunakan bahasa yang sesuai.'
          : 'Inappropriate content detected. This app is designed for children, please use appropriate language.'
      };
    }
  }
  
  // Additional checks for subtle inappropriate content
  const subtlePatterns = [
    /\b(ciuman|kiss|peluk|hug).*(bibir|lips|passionate|bergairah)\b/i,
    /\b(pacar|boyfriend|girlfriend).*(kamar|bedroom|tidur|sleep)\b/i,
    /\b(malam|night).*(hot|panas|passionate|bergairah)\b/i,
  ];
  
  for (const pattern of subtlePatterns) {
    if (pattern.test(normalizedText)) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian'
          ? 'Konten dewasa terdeteksi. Mohon gunakan tema yang sesuai untuk anak-anak.'
          : 'Adult content detected. Please use child-appropriate themes.'
      };
    }
  }
  
  return { isAppropriate: true };
};

// Enhanced story content validation with better Indonesian support
export const validateStoryContent = (story: string, separator: string = '\n\n', language: 'english' | 'indonesian' = 'indonesian'): ContentFilterResult => {
  const paragraphs = story.split(separator).filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const result = filterContent(paragraph, language);
    if (!result.isAppropriate) {
      return result;
    }
  }
  
  // Additional validation for story context
  const storyText = story.toLowerCase();
  
  // Check for inappropriate story themes
  const storyPatterns = [
    /\b(cerita|story).*(dewasa|adult|18\+|panas|hot)\b/i,
    /\b(dongeng|tale).*(menakutkan|scary|horor|horror)\b/i,
    /\b(prince|princess|pangeran|putri).*(kiss|ciuman|wedding night|malam pengantin)\b/i,
  ];
  
  for (const pattern of storyPatterns) {
    if (pattern.test(storyText)) {
      return {
        isAppropriate: false,
        reason: language === 'indonesian'
          ? 'Tema cerita tidak sesuai untuk anak-anak. Gunakan tema yang ramah anak seperti petualangan, persahabatan, atau pembelajaran.'
          : 'Story theme is not suitable for children. Use child-friendly themes like adventure, friendship, or learning.'
      };
    }
  }
  
  return { isAppropriate: true };
};

// Function to suggest child-friendly alternatives
export const getChildFriendlyAlternatives = (language: 'english' | 'indonesian' = 'indonesian'): string[] => {
  return language === 'indonesian' ? [
    'Petualangan di hutan ajaib',
    'Persahabatan dengan hewan-hewan lucu',
    'Belajar tentang alam dan lingkungan',
    'Cerita tentang keluarga yang bahagia',
    'Permainan dan olahraga yang menyenangkan',
    'Makanan sehat dan lezat',
    'Sekolah dan teman-teman',
    'Liburan yang menyenangkan'
  ] : [
    'Magical forest adventures',
    'Friendship with cute animals',
    'Learning about nature and environment',
    'Happy family stories',
    'Fun games and sports',
    'Healthy and delicious food',
    'School and friends',
    'Fun vacations'
  ];
};
