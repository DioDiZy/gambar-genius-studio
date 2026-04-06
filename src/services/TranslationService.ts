
// Translation service using MyMemory API with chunking for long texts

export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  detectedLanguage?: string;
}

const MAX_QUERY_LENGTH = 480; // Stay under 500 char limit

async function translateChunk(text: string, targetLanguage: string): Promise<string> {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|${targetLanguage}`
  );

  if (!response.ok) {
    throw new Error("Translation service unavailable");
  }

  const data = await response.json();

  // responseStatus can be number 200 or string "200"
  if (String(data.responseStatus) === "200" && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  // If quota/limit error, return original
  console.warn("Translation chunk failed:", data.responseDetails || data.responseStatus);
  return text;
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // If any chunk is still too long, hard-split it
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxLen) {
      result.push(chunk);
    } else {
      for (let i = 0; i < chunk.length; i += maxLen) {
        result.push(chunk.substring(i, i + maxLen));
      }
    }
  }
  return result;
}

export async function translateText(text: string, targetLanguage: string = "en"): Promise<TranslationResponse> {
  try {
    const chunks = splitIntoChunks(text, MAX_QUERY_LENGTH);
    const translatedChunks = await Promise.all(
      chunks.map((chunk) => translateChunk(chunk, targetLanguage))
    );

    return {
      translatedText: translatedChunks.join(" "),
      originalText: text,
      detectedLanguage: "id",
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { translatedText: text, originalText: text };
  }
}

export function isIndonesianText(text: string): boolean {
  const indonesianWords = [
    "adalah", "dengan", "untuk", "dari", "yang", "dalam", "akan", "pada", "atau", "juga",
    "tidak", "dapat", "telah", "ini", "itu", "mereka", "kita", "dia", "saya", "kami",
    "dan", "ke", "di", "sebuah", "suatu", "bisa", "harus", "sudah", "belum", "sedang",
    "bagaimana", "dimana", "kapan", "mengapa", "siapa", "apa", "mana", "berapa",
  ];

  const words = text.toLowerCase().split(/\s+/);
  const indonesianWordCount = words.filter((word) =>
    indonesianWords.some((indoWord) => word.includes(indoWord))
  ).length;

  return indonesianWordCount / words.length > 0.2;
}

export async function translateForImageGeneration(text: string): Promise<string> {
  if (isIndonesianText(text)) {
    const translation = await translateText(text, "en");
    console.log("Translated Indonesian text:", {
      original: text.substring(0, 100),
      translated: translation.translatedText.substring(0, 100),
    });
    return translation.translatedText;
  }
  return text;
}
