const COMMON_INDONESIAN_WORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "adalah", "itu",
  "ini", "saya", "kamu", "dia", "mereka", "kami", "kita", "akan", "sudah", "belum",
  "tidak", "bukan", "karena", "agar", "seperti", "dalam", "oleh", "sebuah", "para", "saat",
  "setelah", "sebelum", "jika", "ketika", "namun", "tetapi", "lalu", "kemudian", "hingga", "masih",
  "bisa", "dapat", "harus", "ingin", "melihat", "berjalan", "berkata", "rumah", "jalan", "hutan",
  "malam", "pagi", "hari", "orang", "anak", "teman", "cerita", "perjalanan", "misterius", "cahaya",
  "aku", "kita", "makan", "minum", "pergi", "pulang", "datang", "sekolah", "kantor", "pasar",
  "besar", "kecil", "baik", "buruk", "cepat", "lambat", "indah", "bahagia", "sedih", "takut",
  "air", "api", "angin", "tanah", "langit", "laut", "gunung", "kota", "desa", "keluarga"
]);

const STRUCTURE_MARKERS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "karena", "ketika", "jika", "tidak", "bukan"
]);

const INDONESIAN_PREFIXES = ["me", "mem", "men", "meng", "meny", "ber", "ter", "se", "ke", "pe", "per", "di"];
const INDONESIAN_SUFFIXES = ["kan", "an", "i", "nya", "lah", "kah", "pun"];

export interface IndonesianValidationResult {
  isLikelyIndonesianSentence: boolean;
  score: number;
  reasons: string[];
}

export interface IndonesianWordValidationResult {
  totalWords: number;
  knownWords: number;
  unknownWords: string[];
  unknownWordRatio: number;
}

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (text: string): string[] => {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean);
};

const hasSuspiciousPattern = (token: string): boolean => {
  const noVowel = !/[aiueo]/.test(token) && token.length >= 5;
  const tooManyRepeats = /(.)\1{3,}/.test(token);
  const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/.test(token);
  return noVowel || tooManyRepeats || consonantCluster;
};

const isKnownWord = (token: string): boolean => {
  if (COMMON_INDONESIAN_WORDS.has(token)) {
    return true;
  }

  const matchingPrefix = INDONESIAN_PREFIXES.find((prefix) => token.startsWith(prefix) && token.length > prefix.length + 2);
  const withoutPrefix = matchingPrefix ? token.slice(matchingPrefix.length) : token;

  if (COMMON_INDONESIAN_WORDS.has(withoutPrefix)) {
    return true;
  }

  const matchingSuffix = INDONESIAN_SUFFIXES.find((suffix) => token.endsWith(suffix) && token.length > suffix.length + 2);
  const withoutSuffix = matchingSuffix ? token.slice(0, -matchingSuffix.length) : token;

  if (COMMON_INDONESIAN_WORDS.has(withoutSuffix)) {
    return true;
  }

  return token.length <= 2;
};

export const validateIndonesianWords = (text: string): IndonesianWordValidationResult => {
  const tokens = tokenize(text);
  const uniqueTokens = [...new Set(tokens)];

  const unknownWords = uniqueTokens.filter((token) => !isKnownWord(token) && !/^\d+$/.test(token));
  const knownWords = tokens.length - tokens.filter((token) => unknownWords.includes(token)).length;

  return {
    totalWords: tokens.length,
    knownWords,
    unknownWords,
    unknownWordRatio: tokens.length > 0 ? (tokens.length - knownWords) / tokens.length : 0,
  };
};

export const validateIndonesianSentence = (text: string): IndonesianValidationResult => {
  const reasons: string[] = [];
  const tokens = tokenize(text);

  if (tokens.length < 3) {
    return {
      isLikelyIndonesianSentence: false,
      score: 0,
      reasons: ["Teks terlalu pendek, minimal 3 kata"],
    };
  }

  const wordValidation = validateIndonesianWords(text);
  const markerCount = tokens.filter((token) => STRUCTURE_MARKERS.has(token)).length;
  const suspiciousCount = tokens.filter(hasSuspiciousPattern).length;

  const dictionaryRatio = tokens.length > 0 ? wordValidation.knownWords / tokens.length : 0;
  const structureRatio = markerCount / tokens.length;
  const suspiciousRatio = suspiciousCount / tokens.length;

  let score = 0;
  score += Math.min(dictionaryRatio / 0.6, 1) * 0.55;
  score += Math.min(structureRatio / 0.15, 1) * 0.3;
  score += Math.max(0, 1 - suspiciousRatio / 0.3) * 0.15;

  if (wordValidation.unknownWordRatio > 0.35) {
    reasons.push("Terlalu banyak kata yang tidak dikenali sebagai kata Indonesia");
  }

  if (markerCount === 0) {
    reasons.push("Struktur kalimat kurang jelas (tidak ada kata penghubung/keterangan umum)");
  }

  if (suspiciousRatio > 0.3) {
    reasons.push("Terlalu banyak pola kata acak atau tidak natural");
  }

  return {
    isLikelyIndonesianSentence: score >= 0.55,
    score: Number(score.toFixed(2)),
    reasons,
  };
};
