/**
 * Rule-Based Story Input Validation Pipeline
 * Menjalankan semua validasi secara berurutan dan mengembalikan hasil gabungan.
 */

import { validateIndonesianSentence, type IndonesianValidationResult } from "./indonesianLanguageValidation";
import { detectBadwords, type BadwordResult } from "./badwordFilter";
import { detectStoryContext, type StoryContext } from "./storyContextDetection";

export interface StoryValidationResult {
  status: "valid" | "invalid" | "warning";
  /** Pesan utama */
  message: string;
  /** Pesan saran tambahan */
  suggestions: string[];
  /** Apakah cerita boleh diproses (valid/warning boleh, invalid tidak) */
  canProceed: boolean;
  /** Detail per-check */
  details: {
    empty: boolean;
    tooShort: boolean;
    indonesian: IndonesianValidationResult;
    badwords: BadwordResult;
    context: StoryContext;
  };
}

const MIN_WORD_COUNT = 10;
const MIN_CHAR_COUNT = 50;

export const validateStoryInput = (text: string): StoryValidationResult => {
  const trimmed = text.trim();
  const suggestions: string[] = [];

  // 1. Empty check
  if (!trimmed) {
    return {
      status: "invalid",
      message: "Cerita tidak boleh kosong. Silakan tulis ceritamu terlebih dahulu.",
      suggestions: [],
      canProceed: false,
      details: {
        empty: true,
        tooShort: false,
        indonesian: { isLikelyIndonesianSentence: false, score: 0, reasons: [] },
        badwords: { hasBadwords: false, count: 0, message: "", positions: [] },
        context: { tokoh: [], tempat: [], aksi: [], suasana: [], isContextClear: false, suggestions: [] },
      },
    };
  }

  // 2. Normalize for validation
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  // 3. Minimum length check
  const tooShort = wordCount < MIN_WORD_COUNT || trimmed.length < MIN_CHAR_COUNT;

  // 4. Indonesian language check
  const indonesian = validateIndonesianSentence(trimmed);

  // 5. Badword detection
  const badwords = detectBadwords(trimmed);

  // 6. Context detection
  const context = detectStoryContext(trimmed);

  // --- Determine result ---

  // Badwords → hard block
  if (badwords.hasBadwords) {
    return {
      status: "invalid",
      message: badwords.message,
      suggestions: ["Ganti kata-kata yang tidak pantas dengan kata yang lebih sopan dan sesuai untuk anak-anak."],
      canProceed: false,
      details: { empty: false, tooShort, indonesian, badwords, context },
    };
  }

  // Too short → hard block
  if (tooShort) {
    return {
      status: "invalid",
      message: `Ceritamu masih terlalu pendek (${wordCount} kata). Tulis minimal ${MIN_WORD_COUNT} kata agar cerita punya konteks yang cukup.`,
      suggestions: ["Tambahkan detail tokoh, tempat, dan kejadian dalam ceritamu."],
      canProceed: false,
      details: { empty: false, tooShort: true, indonesian, badwords, context },
    };
  }

  // Not Indonesian → hard block
  if (!indonesian.isLikelyIndonesianSentence) {
    return {
      status: "invalid",
      message: "Ceritamu sepertinya belum menggunakan Bahasa Indonesia. Mohon tulis cerita dalam Bahasa Indonesia.",
      suggestions: indonesian.reasons,
      canProceed: false,
      details: { empty: false, tooShort, indonesian, badwords, context },
    };
  }

  // Context unclear → warning (masih boleh lanjut)
  if (!context.isContextClear) {
    suggestions.push(...context.suggestions);
    return {
      status: "warning",
      message: "Ceritamu sudah cukup baik, tapi konteksnya bisa lebih jelas.",
      suggestions,
      canProceed: true,
      details: { empty: false, tooShort, indonesian, badwords, context },
    };
  }

  return {
    status: "valid",
    message: "Cerita valid dan siap diproses!",
    suggestions: [],
    canProceed: true,
    details: { empty: false, tooShort, indonesian, badwords, context },
  };
};