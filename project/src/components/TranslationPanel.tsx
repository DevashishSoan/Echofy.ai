import React, { useState } from 'react';
import { Languages, ArrowRight, Copy, Download, Trash2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface TranslationPanelProps {
  sourceText: string;
  sourceLanguage: string;
  onTranslationComplete?: (translation: any) => void;
  className?: string;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  sourceText,
  sourceLanguage,
  onTranslationComplete,
  className = ''
}) => {
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [showTranslations, setShowTranslations] = useState(false);
  const { translations, isTranslating, translate, clearTranslations } = useTranslation();

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    const result = await translate(sourceText, targetLanguage, sourceLanguage);
    if (result && onTranslationComplete) {
      onTranslationComplete(result);
    }
    setShowTranslations(true);
  };

  const copyTranslation = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadTranslation = (translation: any) => {
    const content = `Original (${translation.sourceLanguage}): ${translation.originalText}\n\nTranslated (${translation.targetLanguage}): ${translation.translatedText}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `translation-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const availableLanguages = SUPPORTED_LANGUAGES.filter(lang => lang.code !== sourceLanguage);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Languages className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-800">Real-time Translation</h3>
      </div>

      {/* Translation Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translate to:
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Translate
            </button>
          </div>
        </div>

        {/* Source Preview */}
        {sourceText && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Source:</span>
              <span className="text-sm text-gray-600">
                {SUPPORTED_LANGUAGES.find(l => l.code === sourceLanguage)?.name || sourceLanguage}
              </span>
            </div>
            <p className="text-sm text-gray-800 line-clamp-3">{sourceText}</p>
          </div>
        )}
      </div>

      {/* Translation Results */}
      {showTranslations && translations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Translations</h4>
            <button
              onClick={clearTranslations}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {translations.map((translation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {SUPPORTED_LANGUAGES.find(l => l.code === translation.targetLanguage)?.name}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {Math.round(translation.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyTranslation(translation.translatedText)}
                      className="p-1 text-gray-500 hover:text-blue-500"
                      title="Copy translation"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadTranslation(translation)}
                      className="p-1 text-gray-500 hover:text-green-500"
                      title="Download translation"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-800">{translation.translatedText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!sourceText && (
        <div className="text-center py-8 text-gray-500">
          <Languages className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Start transcribing to enable real-time translation</p>
        </div>
      )}
    </div>
  );
};

export default TranslationPanel;