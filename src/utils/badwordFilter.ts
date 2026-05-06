/**
 * Daftar badword bahasa Indonesia untuk filtering konten anak-anak (10-11 tahun).
 * Disimpan sebagai array terpisah agar mudah diperluas.
 */

const BADWORDS: string[] = [
  // Kata kasar umum
  "anjing", "asu", "bajingan", "bangsat", "brengsek", "bedebah", "keparat",
  "kampret", "jancuk", "jancok", "cuk", "kontol", "memek", "pepek",
  "ngentot", "entot", "ngewe", "ewe", "tolol", "goblok", "goblog",
  "idiot", "bego", "babi", "monyet", "setan", "iblis", "laknat",
  // Kata hinaan
  "bodoh", "dungu", "pandir", "bebal", "sontoloyo", "pecundang",
  "bejat", "biadab", "jahanam", "terkutuk",
  // Kata seksual eksplisit
  "bokep", "porno", "cabul", "mesum", "zina", "pelacur", "sundal",
  "lonte", "lacur", "bugil", "telanjang",
  // Kata rasis/diskriminatif
  "kafir", "negro",
  // Kata kekerasan ekstrem
  "bunuh", "mutilasi", "sembelih", "bantai", "pembantaian",
  "siksa", "perkosa", "pemerkosaan",
  // Variasi singkatan populer
  "wtf", "stfu", "gtfo", "fck", "fuck", "shit", "damn", "ass",
  "bitch", "bastard", "dick", "pussy",
];

/**
 * Normalisasi teks untuk deteksi badword:
 * - lowercase
 * - hapus tanda baca
 * - collapse huruf berulang (baaangsat → bangsat)
 * - ganti angka/simbol umum ke huruf (4→a, 3→e, 1→i, 0→o, 5→s)
 */
const normalizeBadwordToken = (token: string): string => {
  let t = token.toLowerCase().trim();
  // Hapus tanda baca
  t = t.replace(/[^\p{L}\p{N}]/gu, "");
  // Ganti angka/simbol ke huruf
  t = t.replace(/4/g, "a").replace(/3/g, "e").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s");
  // Collapse huruf berulang (3+ → 1)
  t = t.replace(/(.)\1{2,}/g, "$1");
  // Collapse huruf berulang (2 → 1) untuk kata pendek
  if (t.length <= 8) {
    t = t.replace(/(.)\1+/g, "$1");
  }
  return t;
};

// Pre-compute normalized badword set
const NORMALIZED_BADWORDS = new Set(BADWORDS.map(normalizeBadwordToken));

export interface BadwordResult {
  hasBadwords: boolean;
  /** Jumlah kata tidak pantas yang ditemukan */
  count: number;
  /** Pesan feedback (tidak menampilkan ulang kata kasar) */
  message: string;
  /** Indeks posisi [start, end] dari setiap badword di teks asli */
  positions: Array<[number, number]>;
}

/**
 * Deteksi badword dalam teks menggunakan rule-based matching.
 */
export const detectBadwords = (text: string): BadwordResult => {
  if (!text.trim()) return { hasBadwords: false, count: 0, message: "", positions: [] };

  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  let count = 0;
  const positions: Array<[number, number]> = [];

  // Build positions by scanning original text
  const lowerText = text.toLowerCase();
  let searchFrom = 0;
  for (const token of tokens) {
    const normalized = normalizeBadwordToken(token);
    if (NORMALIZED_BADWORDS.has(normalized)) {
      count++;
      // Find this token's position in original text
      const idx = lowerText.indexOf(token, searchFrom);
      if (idx !== -1) {
        positions.push([idx, idx + token.length]);
      }
    }
    // Advance search cursor
    const idx = lowerText.indexOf(token, searchFrom);
    if (idx !== -1) searchFrom = idx + token.length;
  }

  if (count > 0) {
    return {
      hasBadwords: true,
      count,
      message: `Ceritamu mengandung ${count} kata yang tidak pantas. Mohon perbaiki dengan bahasa yang lebih sopan agar cerita dapat diproses.`,
      positions,
    };
  }

  return { hasBadwords: false, count: 0, message: "", positions: [] };
};