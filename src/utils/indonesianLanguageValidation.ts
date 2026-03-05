const COMMON_INDONESIAN_WORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "adalah", "itu",
  "ini", "saya", "kamu", "dia", "mereka", "kami", "kita", "akan", "sudah", "belum",
  "tidak", "bukan", "karena", "agar", "seperti", "dalam", "oleh", "sebuah", "para", "saat",
  "setelah", "sebelum", "jika", "ketika", "namun", "tetapi", "lalu", "kemudian", "hingga", "masih",
  "bisa", "dapat", "harus", "ingin", "melihat", "berjalan", "berkata", "rumah", "jalan", "hutan",
  "malam", "pagi", "hari", "orang", "anak", "teman", "cerita", "perjalanan", "misterius", "cahaya"
]);

const STRUCTURE_MARKERS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "karena", "ketika", "jika", "tidak", "bukan"
]);

export interface IndonesianValidationResult {
  isLikelyIndonesianSentence: boolean;
  score: number;
  reasons: string[];
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

  const knownCount = tokens.filter((token) => COMMON_INDONESIAN_WORDS.has(token)).length;
  const markerCount = tokens.filter((token) => STRUCTURE_MARKERS.has(token)).length;
  const suspiciousCount = tokens.filter(hasSuspiciousPattern).length;

  const dictionaryRatio = knownCount / tokens.length;
  const structureRatio = markerCount / tokens.length;
  const suspiciousRatio = suspiciousCount / tokens.length;

  let score = 0;
  score += Math.min(dictionaryRatio / 0.45, 1) * 0.55;
  score += Math.min(structureRatio / 0.15, 1) * 0.3;
  score += Math.max(0, 1 - suspiciousRatio / 0.3) * 0.15;

  if (dictionaryRatio < 0.2) {
    reasons.push("Banyak kata tidak cocok dengan kosakata Indonesia umum");
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

