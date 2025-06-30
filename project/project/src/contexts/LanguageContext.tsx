import React, { createContext, useContext, useState } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  elevenLabsCode?: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US', elevenLabsCode: 'en' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES', elevenLabsCode: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR', elevenLabsCode: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE', elevenLabsCode: 'de' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT', elevenLabsCode: 'it' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT', elevenLabsCode: 'pt' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP', elevenLabsCode: 'ja' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR', elevenLabsCode: 'ko' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN', elevenLabsCode: 'zh' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', elevenLabsCode: 'ar' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU', elevenLabsCode: 'ru' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN', elevenLabsCode: 'hi' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL', elevenLabsCode: 'nl' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL', elevenLabsCode: 'pl' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE', elevenLabsCode: 'sv' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  translateText: (text: string, targetLang: string) => Promise<string>;
  detectLanguage: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    // Mock translation - in production, use Google Translate API or similar
    return `[Translated to ${targetLang}] ${text}`;
  };

  const detectLanguage = async (text: string): Promise<string> => {
    // Mock language detection - in production, use language detection API
    return 'en';
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setCurrentLanguage,
      translateText,
      detectLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};