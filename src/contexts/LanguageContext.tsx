
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "english" | "indonesian";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English and Indonesian translations
const translations: Record<Language, Record<string, string>> = {
  english: {
    // Common
    "app.language": "Language",
    "app.english": "English",
    "app.indonesian": "Indonesian",
    
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    "nav.signin": "Sign In",
    "nav.signup": "Sign Up",
    "nav.signout": "Sign Out",
    
    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signin": "Sign In",
    "auth.signup": "Sign Up",
    "auth.forgotPassword": "Forgot Password?",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.dontHaveAccount": "Don't have an account?",
    
    // Story Generator
    "story.title": "Story to Images",
    "story.description": "Write a story and generate consistent storyboard images for each paragraph",
    "story.language": "Story Language",
    "story.paragraphSeparator": "Paragraph Separator",
    "story.separatorHint": "Default is double line break. Enter custom separators like \"***\" or \"###\" if needed.",
    "story.style": "Style",
    "story.characters": "Characters",
    "story.charactersHint": "No characters added yet. Add characters for consistency across images.",
    "story.characterName": "Character name",
    "story.characterAppearance": "Character appearance",
    "story.characterTip": "Add key characters with their specific appearances for consistency across images.",
    "story.additionalLabel": "Additional Image Instructions",
    "story.additionalPlaceholder": "Add any additional instructions for image generation (background, setting, atmosphere, lighting, etc.)",
    "story.additionalHint": "These instructions will be applied to all generated images for consistency.",
    "story.yourStory": "Your Story",
    "story.paragraphsDetected": "{count} paragraphs detected",
    "story.generating": "Generating...",
    "story.generate": "Generate Images",
    "story.storyboardCreating": "Creating your storyboard...",
    "story.storyboardWillAppear": "Your storyboard will appear here",
    "story.scene": "Scene",
  },
  indonesian: {
    // Common
    "app.language": "Bahasa",
    "app.english": "Inggris",
    "app.indonesian": "Indonesia",
    
    // Navigation
    "nav.home": "Beranda",
    "nav.dashboard": "Dasbor",
    "nav.settings": "Pengaturan",
    "nav.profile": "Profil",
    "nav.signin": "Masuk",
    "nav.signup": "Daftar",
    "nav.signout": "Keluar",
    
    // Auth
    "auth.email": "Surel",
    "auth.password": "Kata Sandi",
    "auth.signin": "Masuk",
    "auth.signup": "Daftar",
    "auth.forgotPassword": "Lupa Kata Sandi?",
    "auth.alreadyHaveAccount": "Sudah punya akun?",
    "auth.dontHaveAccount": "Belum punya akun?",
    
    // Story Generator
    "story.title": "Cerita ke Gambar",
    "story.description": "Tulis cerita dan hasilkan gambar storyboard yang konsisten untuk setiap paragraf",
    "story.language": "Bahasa Cerita",
    "story.paragraphSeparator": "Pemisah Paragraf",
    "story.separatorHint": "Default adalah jeda baris ganda. Masukkan pemisah kustom seperti \"***\" atau \"###\" jika diperlukan.",
    "story.style": "Gaya",
    "story.characters": "Karakter",
    "story.charactersHint": "Belum ada karakter yang ditambahkan. Tambahkan karakter untuk konsistensi antar gambar.",
    "story.characterName": "Nama karakter",
    "story.characterAppearance": "Penampilan karakter",
    "story.characterTip": "Tambahkan karakter utama dengan penampilan spesifik mereka untuk konsistensi antar gambar.",
    "story.additionalLabel": "Instruksi Gambar Tambahan",
    "story.additionalPlaceholder": "Tambahkan instruksi tambahan untuk pembuatan gambar (latar belakang, setting, suasana, pencahayaan, dll.)",
    "story.additionalHint": "Instruksi ini akan diterapkan pada semua gambar yang dihasilkan untuk konsistensi.",
    "story.yourStory": "Cerita Anda",
    "story.paragraphsDetected": "{count} paragraf terdeteksi",
    "story.generating": "Menghasilkan...",
    "story.generate": "Hasilkan Gambar",
    "story.storyboardCreating": "Membuat storyboard Anda...",
    "story.storyboardWillAppear": "Storyboard Anda akan muncul di sini",
    "story.scene": "Adegan",
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem("appLanguage");
    return (savedLanguage as Language) || "english";
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("appLanguage", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Missing translation for key "${key}" in language "${language}"`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
