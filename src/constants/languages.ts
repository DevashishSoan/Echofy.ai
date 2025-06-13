import { LanguageInfo } from '../types/elevenlabs';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    voices: ['Rachel', 'Drew', 'Clyde', 'Paul', 'Domi', 'Dave', 'Fin', 'Sarah', 'Antoni']
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English',
    flag: '🇬🇧',
    voices: ['Alice', 'Brian', 'Charlie', 'George', 'Emily']
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    flag: '🇪🇸',
    voices: ['Mateo', 'Valentina', 'Liam', 'Mia']
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español',
    flag: '🇲🇽',
    voices: ['Diego', 'Sofia', 'Carlos', 'Isabella']
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    voices: ['Thomas', 'Charlotte', 'Antoine', 'Freya']
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    voices: ['Daniel', 'Gigi', 'Callum', 'Lily']
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    voices: ['Giovanni', 'Bianca', 'Marco', 'Chiara']
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    flag: '🇧🇷',
    voices: ['Adam', 'Nicole', 'Ethan', 'Grace']
  },
  {
    code: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português',
    flag: '🇵🇹',
    voices: ['Joao', 'Maria', 'Pedro', 'Ana']
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    voices: ['Takeshi', 'Akiko', 'Hiroshi', 'Yuki']
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    voices: ['Minho', 'Soyoung', 'Junho', 'Minji']
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文',
    flag: '🇨🇳',
    voices: ['Wei', 'Xiaoxiao', 'Yunyang', 'Xiaoyi']
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '中文',
    flag: '🇹🇼',
    voices: ['Zhiyu', 'Xiaoxuan', 'Yunxi', 'Xiaochen']
  },
  {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    voices: ['Omar', 'Fatima', 'Ahmed', 'Layla']
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voices: ['Aditi', 'Ravi', 'Kavya', 'Arjun']
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    voices: ['Maxim', 'Tatyana', 'Pavel', 'Elena']
  },
  {
    code: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    voices: ['Ruben', 'Lotte', 'Maarten', 'Emma']
  },
  {
    code: 'sv-SE',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    voices: ['Astrid', 'Karl', 'Elin', 'Oskar']
  },
  {
    code: 'da-DK',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    voices: ['Naja', 'Mads', 'Ida', 'Magnus']
  },
  {
    code: 'no-NO',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    voices: ['Liv', 'Erik', 'Ingrid', 'Lars']
  },
  {
    code: 'fi-FI',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    voices: ['Noora', 'Onni', 'Aino', 'Väinö']
  }
];

export const getLanguageByCode = (code: string): LanguageInfo | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getLanguagesByRegion = (region: string): LanguageInfo[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.code.includes(region));
};

export const getVoicesForLanguage = (languageCode: string): string[] => {
  const language = getLanguageByCode(languageCode);
  return language?.voices || [];
};