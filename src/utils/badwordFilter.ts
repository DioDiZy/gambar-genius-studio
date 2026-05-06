/**
 * Daftar badword bahasa Indonesia untuk filtering konten anak-anak (10-11 tahun).
 * Disimpan sebagai array terpisah agar mudah diperluas.
 */

const BADWORDS: string[] = [
  // Kata kasar umum
  "anjing",
  "asu",
  "bajingan",
  "bangsat",
  "brengsek",
  "bedebah",
  "keparat",
  "kampret",
  "jancuk",
  "jancok",
  "cuk",
  "kontol",
  "memek",
  "pepek",
  "ngentot",
  "entot",
  "ngewe",
  "ewe",
  "tolol",
  "goblok",
  "goblog",
  "idiot",
  "bego",
  "babi",
  "monyet",
  "setan",
  "iblis",
  "laknat",
  // Kata hinaan
  "bodoh",
  "dungu",
  "pandir",
  "bebal",
  "sontoloyo",
  "pecundang",
  "bejat",
  "biadab",
  "jahanam",
  "terkutuk",
  // Kata seksual eksplisit
  "bokep",
  "porno",
  "cabul",
  "mesum",
  "zina",
  "pelacur",
  "sundal",
  "lonte",
  "lacur",
  "bugil",
  "telanjang",
  // Kata rasis/diskriminatif
  "kafir",
  "negro",
  // Kata kekerasan ekstrem
  "bunuh",
  "mutilasi",
  "sembelih",
  "bantai",
  "pembantaian",
  "siksa",
  "perkosa",
  "pemerkosaan",
  // Variasi singkatan populer
  "wtf",
  "stfu",
  "gtfo",
  "fck",
  "fuck",
  "shit",
  "damn",
  "ass",
  "bitch",
  "bastard",
  "dick",
  "pussy",
];

// ---------------------------------------------------------------------------
// CONTEXT WINDOW — Neutral Indicator Words
// ---------------------------------------------------------------------------

/**
 * Radius pencarian kata penanda netral di sekitar kata ambigu (kiri & kanan).
 * Nilai 3 berarti melihat 3 kata sebelum dan 3 kata sesudah token yang dicurigai.
 */
const CONTEXT_WINDOW_SIZE = 3;

/**
 * Kata-kata yang mengindikasikan konteks netral untuk kata ambigu.
 *
 * Struktur:
 *   Key   → kata ambigu (sudah dinormalisasi, huruf kecil)
 *   Value → array kata penanda yang menunjukkan konteks netral/aman
 *
 * Cara kerja:
 *   Jika kata ambigu (mis. "anjing") ditemukan di teks, algoritma akan
 *   memeriksa CONTEXT_WINDOW_SIZE kata di kiri dan kanan token tersebut.
 *   Bila salah satu tetangga cocok dengan kata penanda di sini,
 *   token TIDAK akan di-flag sebagai badword.
 *
 * Tips penambahan:
 *   - Tambahkan kata ke Value jika kata itu hanya muncul saat konteks aman.
 *   - Hindari kata penanda yang terlalu umum (mis. "yang", "dan") karena
 *     bisa memunculkan false negative pada kalimat kasar.
 */
const CONTEXT_EXEMPTIONS: Record<string, string[]> = {
  anjing: [
    // Kata sifat/deskripsi fisik hewan
    "besar",
    "kecil",
    "lucu",
    "berbulu",
    "putih",
    "hitam",
    "coklat",
    "abu",
    "jinak",
    "liar",
    "gemuk",
    "kurus",
    "cantik",
    "imut",
    "sehat",
    "sakit",
    // Aktivitas hewan
    "berlari",
    "berjalan",
    "menggonggong",
    "tidur",
    "makan",
    "bermain",
    "melompat",
    "berenang",
    "melolong",
    "mengejar",
    "duduk",
    "berbaring",
    "menggigit",
    "menjilat",
    "mencium",
    "berlompat",
    // Konteks kepemilikan / kategori
    "peliharaan",
    "ras",
    "jenis",
    "kandang",
    "hewan",
    "binatang",
    "herder",
    "golden",
    "retriever",
    "pudel",
    "husky",
    "bulldog",
    "dalmatian",
    // Possesif & turunan kata
    "anjingku",
    "anjingnya",
    "anjingmu",
    "anjing-anjing",
    // Lokasi / situasi netral
    "tetangga",
    "pak",
    "bu",
    "milik",
    "punya",
    "merawat",
    "memelihara",
  ],

  babi: [
    // Jenis / konteks hewan
    "hutan",
    "rusa",
    "celeng",
    "ternak",
    "hewan",
    "binatang",
    "peliharaan",
    // Aktivitas hewan
    "berlari",
    "makan",
    "tidur",
    "berkubang",
    "lumpur",
    "mandi",
    // Sifat fisik
    "gemuk",
    "besar",
    "kecil",
    "merah muda",
    "berbulu",
    // Lokasi
    "kandang",
    "kebun",
    "ladang",
    "hutan",
  ],

  monyet: [
    // Konteks alam / kebun binatang
    "pohon",
    "hutan",
    "kebun",
    "binatang",
    "zoo",
    "rimba",
    "alam",
    // Aktivitas hewan
    "memanjat",
    "berlompat",
    "melompat",
    "berayun",
    "makan",
    "tidur",
    // Makanan khas
    "pisang",
    "buah",
    // Jenis
    "ekor",
    "panjang",
    "kecil",
    "besar",
    "lucu",
    // Kepemilikan
    "peliharaan",
    "merawat",
  ],

  setan: [
    // Konteks fiksi / cerita / budaya
    "dalam",
    "cerita",
    "film",
    "dongeng",
    "kisah",
    "seperti",
    "karakter",
    "novel",
    "buku",
    "legenda",
    "mitos",
    "tokoh",
  ],

  iblis: ["cerita", "film", "dongeng", "kisah", "seperti", "karakter", "novel", "buku", "legenda", "mitos", "tokoh", "dalam"],

  bunuh: [
    // Idiom aman yang umum dipakai anak-anak
    "waktu",
    "bosan",
    "kebosanan",
  ],

  telanjang: [
    // Konteks seni / pelajaran biologi / budaya
    "patung",
    "lukisan",
    "seni",
    "museum",
    "biologi",
    "pelajaran",
    "kaki",
    "tangan", // "kaki telanjang" / "tangan telanjang" = tanpa alas
  ],

  idiot: [
    // Konteks medis / akademik
    "savant",
    "medis",
    "klinis",
    "istilah",
    "literatur",
  ],
};

/**
 * Frasa yang secara eksplisit AMAN meskipun mengandung kata ambigu.
 * Matching dilakukan terhadap token yang sudah dinormalisasi.
 *
 * Gunakan ini untuk frasa dua kata atau lebih yang sudah pasti netral
 * dan tidak cukup ditangani oleh CONTEXT_EXEMPTIONS.
 */
const SAFE_PHRASES: string[] = [
  // Anjing
  "anjing besar",
  "anjing kecil",
  "anjing peliharaan",
  "anjing lucu",
  "anjing berbulu",
  "anjing berlari",
  "anjing berjalan",
  "anjing tidur",
  "anjing makan",
  "anak anjing",
  "anjing jantan",
  "anjing betina",
  "anjing ras",
  "anjing jinak",
  "anjing liar",
  "anjing herder",
  "anjing golden",
  "anjing husky",
  // Babi
  "babi hutan",
  "hewan babi",
  "ternak babi",
  "babi peliharaan",
  // Monyet
  "monyet pohon",
  "monyet hutan",
  "kebun binatang",
];

// ---------------------------------------------------------------------------
// Set kata ambigu yang perlu dicek konteksnya sebelum di-flag
// ---------------------------------------------------------------------------
const CONTEXT_DEPENDENT_WORDS = new Set(Object.keys(CONTEXT_EXEMPTIONS));

// ---------------------------------------------------------------------------
// Normalisasi & Pre-compute
// ---------------------------------------------------------------------------

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

// Pre-compute normalized safe phrases
const NORMALIZED_SAFE_PHRASES = new Set(SAFE_PHRASES.map((phrase) => phrase.split(" ").map(normalizeBadwordToken).join(" ")));

// ---------------------------------------------------------------------------
// Helper: Context Checkers
// ---------------------------------------------------------------------------

/**
 * Memeriksa apakah token pada `tokenIndex` berada di dalam frasa aman
 * yang sudah terdaftar di SAFE_PHRASES.
 *
 * Strategi: bentuk semua kombinasi sub-frasa dalam window di sekitar token,
 * lalu cocokkan dengan NORMALIZED_SAFE_PHRASES.
 */
const isInSafePhrase = (tokens: string[], tokenIndex: number): boolean => {
  const windowStart = Math.max(0, tokenIndex - 2);
  const windowEnd = Math.min(tokens.length - 1, tokenIndex + 2);

  for (let i = windowStart; i <= windowEnd - 1; i++) {
    for (let j = i + 1; j <= windowEnd; j++) {
      const phrase = tokens
        .slice(i, j + 1)
        .map(normalizeBadwordToken)
        .join(" ");
      if (NORMALIZED_SAFE_PHRASES.has(phrase)) return true;
    }
  }
  return false;
};

/**
 * Memeriksa apakah ada kata penanda netral dalam radius CONTEXT_WINDOW_SIZE
 * di sekitar token yang dicurigai.
 *
 * @param tokens        - Array token dari seluruh kalimat
 * @param tokenIndex    - Posisi token yang sedang diperiksa
 * @param normalizedBadword - Badword yang sudah dinormalisasi (key di CONTEXT_EXEMPTIONS)
 */
const hasNeutralContext = (tokens: string[], tokenIndex: number, normalizedBadword: string): boolean => {
  const exemptionWords = CONTEXT_EXEMPTIONS[normalizedBadword];
  if (!exemptionWords) return false;

  // Buat Set untuk O(1) lookup
  const exemptionSet = new Set(exemptionWords.map(normalizeBadwordToken));

  const start = Math.max(0, tokenIndex - CONTEXT_WINDOW_SIZE);
  const end = Math.min(tokens.length - 1, tokenIndex + CONTEXT_WINDOW_SIZE);

  for (let i = start; i <= end; i++) {
    if (i === tokenIndex) continue;
    const normalized = normalizeBadwordToken(tokens[i]);
    if (exemptionSet.has(normalized)) return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// Tipe & Fungsi Utama
// ---------------------------------------------------------------------------

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
 * Deteksi badword dalam teks menggunakan rule-based matching
 * dengan Context Window + Neutral Indicator Words.
 *
 * Alur pemeriksaan per token:
 *   1. Normalisasi token.
 *   2. Cek apakah token ada di NORMALIZED_BADWORDS.
 *   3. Bila kata termasuk CONTEXT_DEPENDENT_WORDS:
 *      a. Cek SAFE_PHRASES → jika cocok, skip (aman).
 *      b. Cek CONTEXT_EXEMPTIONS via context window → jika ada kata penanda
 *         netral di sekitarnya, skip (aman).
 *   4. Jika lolos semua cek di atas, flag sebagai badword.
 */
export const detectBadwords = (text: string): BadwordResult => {
  if (!text.trim()) return { hasBadwords: false, count: 0, message: "", positions: [] };

  // Tokenisasi: bersihkan teks dan pecah per spasi
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  let count = 0;
  const positions: Array<[number, number]> = [];
  const lowerText = text.toLowerCase();
  let searchFrom = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const normalized = normalizeBadwordToken(token);

    if (NORMALIZED_BADWORDS.has(normalized)) {
      let shouldFlag = true;

      // Hanya kata ambigu yang perlu dicek konteksnya
      if (CONTEXT_DEPENDENT_WORDS.has(normalized)) {
        // Prioritas 1: cek safe phrase (lebih presisi)
        if (isInSafePhrase(tokens, i)) {
          shouldFlag = false;
        }
        // Prioritas 2: cek context window dengan neutral indicator words
        else if (hasNeutralContext(tokens, i, normalized)) {
          shouldFlag = false;
        }
      }

      if (shouldFlag) {
        count++;
        const idx = lowerText.indexOf(token, searchFrom);
        if (idx !== -1) {
          positions.push([idx, idx + token.length]);
        }
      }
    }

    // Majukan kursor pencarian agar posisi token berikutnya lebih akurat
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
