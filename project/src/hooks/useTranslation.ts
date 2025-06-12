import { useState, useCallback } from 'react';

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

interface TranslationHook {
  translations: TranslationResult[];
  isTranslating: boolean;
  translate: (text: string, targetLanguage: string, sourceLanguage?: string) => Promise<TranslationResult | null>;
  batchTranslate: (texts: string[], targetLanguage: string, sourceLanguage?: string) => Promise<TranslationResult[]>;
  clearTranslations: () => void;
}

export const useTranslation = (): TranslationHook => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<TranslationResult | null> => {
    if (!text.trim()) return null;

    setIsTranslating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock translation - in production, this would call a translation API
      const mockTranslations: Record<string, Record<string, string>> = {
        'en-US': {
          'es-ES': 'Hola, este es un texto traducido.',
          'fr-FR': 'Bonjour, ceci est un texte traduit.',
          'de-DE': 'Hallo, das ist ein übersetzter Text.',
          'it-IT': 'Ciao, questo è un testo tradotto.',
          'pt-BR': 'Olá, este é um texto traduzido.',
          'ja-JP': 'こんにちは、これは翻訳されたテキストです。',
          'ko-KR': '안녕하세요, 이것은 번역된 텍스트입니다.',
          'zh-CN': '你好，这是翻译的文本。',
        }
      };

      const translatedText = mockTranslations[sourceLanguage || 'en-US']?.[targetLanguage] || 
                           `[Translated to ${targetLanguage}] ${text}`;

      const result: TranslationResult = {
        originalText: text,
        translatedText,
        sourceLanguage: sourceLanguage || 'en-US',
        targetLanguage,
        confidence: 0.92
      };

      setTranslations(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const batchTranslate = useCallback(async (
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<TranslationResult[]> => {
    setIsTranslating(true);
    
    try {
      const results: TranslationResult[] = [];
      
      for (const text of texts) {
        const result = await translate(text, targetLanguage, sourceLanguage);
        if (result) {
          results.push(result);
        }
      }
      
      return results;
    } finally {
      setIsTranslating(false);
    }
  }, [translate]);

  const clearTranslations = useCallback(() => {
    setTranslations([]);
  }, []);

  return {
    translations,
    isTranslating,
    translate,
    batchTranslate,
    clearTranslations,
  };
};