import { useState, useCallback } from 'react';

interface DetectedLanguage {
  code: string;
  name: string;
  confidence: number;
}

interface LanguageDetectionResult {
  detectedLanguage: DetectedLanguage | null;
  isDetecting: boolean;
  detectLanguage: (text: string) => Promise<DetectedLanguage | null>;
  autoDetectFromAudio: (audioBlob: Blob) => Promise<DetectedLanguage | null>;
}

export const useLanguageDetection = (): LanguageDetectionResult => {
  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Simple language detection based on character patterns
  const detectLanguage = useCallback(async (text: string): Promise<DetectedLanguage | null> => {
    if (!text.trim()) return null;

    setIsDetecting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Basic language detection patterns
      const patterns = {
        'zh-CN': /[\u4e00-\u9fff]/,
        'ja-JP': /[\u3040-\u309f\u30a0-\u30ff]/,
        'ko-KR': /[\uac00-\ud7af]/,
        'ar-SA': /[\u0600-\u06ff]/,
        'hi-IN': /[\u0900-\u097f]/,
        'ru-RU': /[\u0400-\u04ff]/,
        'es-ES': /\b(el|la|de|en|y|a|que|es|se|no|te|lo|le|da|su|por|son|con|para|una|ser|al|todo|esta|muy|hasta|desde|cuando|donde|como|quien|cual|porque|pero|sin|sobre|entre|durante|antes|después|mientras|aunque|sino|ni|tampoco|también|además|incluso|excepto|salvo|menos|más|tanto|tan|así|ahí|aquí|allí|ahora|entonces|luego|después|antes|siempre|nunca|jamás|todavía|ya|aún|apenas|casi|bastante|demasiado|mucho|poco|nada|algo|todo|cada|otro|mismo|propio|único|solo|sólo|ambos|varios|algunos|muchos|pocos|todos|ningún|algún|cualquier|cierto|verdadero|falso|bueno|malo|grande|pequeño|nuevo|viejo|joven|mayor|menor|mejor|peor|primero|último|siguiente|anterior|próximo|pasado|presente|futuro)\b/gi,
        'fr-FR': /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|par|grand|en|même|et|où|comme|temps|très|sans|deux|me|état|entre|trois|aussi|jusqu|sans|sous|peut|encore|après|monde|tout|pendant|contre|tous|homme|fait|elle|depuis|autre|bien|première|lors|loin|cette|mieux|voici|tout|ceux|moins|ici|cela|être|grand|pourquoi|quoi|dont|donc|faire|leur|si|deux|même|dire|elle|prendre|vous|nôtre|faire|aller|pouvoir|falloir|devoir|savoir|vouloir|venir|voir|donner|prendre|parler|aimer|porter|laisser|suivre|trouver|donner|porter|demander|rester|passer|regarder|sortir|entrer|monter|descendre|arriver|partir|revenir|retourner|aller|venir|être|avoir|faire|dire|aller|voir|savoir|pouvoir|falloir|vouloir|devoir|croire|paraître|connaître|prendre|venir|tenir|devenir|porter|partir|sortir|ouvrir|mourir|naître|vivre|suivre|servir|courir|dormir|mentir|sentir|partir|sortir|venir|tenir|acquérir|bouillir|cueillir|défaillir|faillir|gésir|ouïr|saillir|tressaillir|assaillir|défaillir)\b/gi,
        'de-DE': /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|um|am|sind|noch|wie|einem|über|einen|so|zum|war|haben|nur|oder|aber|vor|zur|bis|unter|während|ohne|durch|gegen|vom|beim|seit|zwischen|sowie|wegen|trotz|statt|anstatt|außer|binnen|dank|entlang|entsprechend|gegenüber|gemäß|infolge|inmitten|innerhalb|jenseits|kraft|längs|laut|mangels|mittels|nebst|oberhalb|seitens|unbeschadet|unfern|unterhalb|unweit|vermöge|vorbehaltlich|zufolge|zugunsten|zulasten|zuzüglich|zwecks)\b/gi,
        'it-IT': /\b(il|di|che|e|la|per|un|in|con|del|da|una|su|le|dei|come|si|nel|non|alla|delle|gli|lo|delle|dalla|nelle|ai|agli|alle|della|dello|nell|dall|all|col|coi)\b/gi,
        'pt-BR': /\b(o|de|a|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|suas|numa|pelos|pelas|esse|esses|essa|essas|dele|dela|deles|delas|este|esta|estes|estas|aquele|aquela|aqueles|aquelas|isto|isso|aquilo)\b/gi,
      };

      for (const [langCode, pattern] of Object.entries(patterns)) {
        const matches = text.match(pattern);
        if (matches && matches.length > 3) {
          const confidence = Math.min(0.95, matches.length / text.split(' ').length);
          const result = {
            code: langCode,
            name: getLanguageName(langCode),
            confidence
          };
          setDetectedLanguage(result);
          return result;
        }
      }

      // Default to English if no pattern matches
      const result = {
        code: 'en-US',
        name: 'English (US)',
        confidence: 0.7
      };
      setDetectedLanguage(result);
      return result;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const autoDetectFromAudio = useCallback(async (audioBlob: Blob): Promise<DetectedLanguage | null> => {
    // This would integrate with a speech-to-text service that supports language detection
    // For now, we'll return a mock result
    setIsDetecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        code: 'en-US',
        name: 'English (US)',
        confidence: 0.85
      };
      setDetectedLanguage(result);
      return result;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    detectedLanguage,
    isDetecting,
    detectLanguage,
    autoDetectFromAudio,
  };
};

const getLanguageName = (code: string): string => {
  const names: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'pt-BR': 'Portuguese (Brazil)',
    'zh-CN': 'Chinese (Simplified)',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'ar-SA': 'Arabic',
    'hi-IN': 'Hindi',
    'ru-RU': 'Russian',
  };
  return names[code] || code;
};