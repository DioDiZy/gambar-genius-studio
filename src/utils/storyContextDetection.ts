/**
 * Rule-based context detection untuk cerita bahasa Indonesia.
 * Mengidentifikasi tokoh, tempat, aksi, suasana, dan konflik.
 */

const TOKOH_KEYWORDS = new Set([
  "anak", "ibu", "ayah", "kakak", "adik", "nenek", "kakek", "raja", "ratu",
  "putri", "pangeran", "teman", "guru", "petani", "nelayan", "pedagang",
  "prajurit", "penyihir", "pahlawan", "penjahat", "binatang", "kucing",
  "anjing", "burung", "kelinci", "kura-kura", "singa", "gajah", "monyet",
  "ikan", "naga", "peri", "jin", "hantu", "robot", "alien",
]);

const TEMPAT_KEYWORDS = new Set([
  "rumah", "sekolah", "hutan", "desa", "kota", "istana", "gua", "gunung",
  "sungai", "laut", "pantai", "danau", "taman", "pasar", "jalan", "pulau",
  "kerajaan", "dunia", "langit", "bulan", "bintang", "ladang", "sawah",
  "perpustakaan", "museum", "kebun", "halaman",
]);

const AKSI_KEYWORDS = new Set([
  "berjalan", "berlari", "terbang", "berenang", "melompat", "memanjat",
  "mencari", "menemukan", "membuka", "menutup", "membawa", "mengambil",
  "memberikan", "menolong", "melawan", "bertarung", "bermain", "belajar",
  "menyanyi", "menari", "memasak", "membangun", "menanam", "menulis",
  "membaca", "bercerita", "berpetualang", "menjelajah", "pergi", "datang",
  "pulang", "kembali", "bertemu", "berpisah",
]);

const SUASANA_KEYWORDS = new Set([
  "sedih", "senang", "gembira", "bahagia", "takut", "berani", "marah",
  "gelap", "cerah", "tenang", "ramai", "sunyi", "sepi", "dingin", "panas",
  "indah", "cantik", "menakutkan", "misterius", "ajaib", "magis",
  "menyenangkan", "menegangkan", "lucu", "kocak", "haru", "terharu",
  "kagum", "heran", "terkejut", "cemas", "khawatir",
]);

export interface StoryContext {
  tokoh: string[];
  tempat: string[];
  aksi: string[];
  suasana: string[];
  isContextClear: boolean;
  suggestions: string[];
}

export const detectStoryContext = (text: string): StoryContext => {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = new Set(normalized.split(" ").filter(Boolean));

  const tokoh = [...tokens].filter((t) => TOKOH_KEYWORDS.has(t));
  const tempat = [...tokens].filter((t) => TEMPAT_KEYWORDS.has(t));
  const aksi = [...tokens].filter((t) => AKSI_KEYWORDS.has(t));
  const suasana = [...tokens].filter((t) => SUASANA_KEYWORDS.has(t));

  const suggestions: string[] = [];
  if (tokoh.length === 0) suggestions.push("Tambahkan tokoh/karakter dalam ceritamu (contoh: anak, putri, raja).");
  if (tempat.length === 0) suggestions.push("Tambahkan tempat/lokasi cerita (contoh: hutan, sekolah, istana).");
  if (aksi.length === 0) suggestions.push("Tambahkan aksi/kejadian dalam cerita (contoh: berjalan, menemukan, melawan).");
  if (suasana.length === 0) suggestions.push("Tambahkan suasana cerita (contoh: senang, misterius, gelap).");

  const isContextClear = tokoh.length > 0 && tempat.length > 0 && (aksi.length > 0 || suasana.length > 0);

  return { tokoh, tempat, aksi, suasana, isContextClear, suggestions };
};