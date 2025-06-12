import React, { useState, useEffect } from 'react';
import { Globe, Zap, CheckCircle } from 'lucide-react';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

interface LanguageDetectorProps {
  text: string;
  onLanguageDetected: (language: { code: string; name: string }) => void;
  autoDetect?: boolean;
  className?: string;
}

const LanguageDetector: React.FC<LanguageDetectorProps> = ({
  text,
  onLanguageDetected,
  autoDetect = true,
  className = ''
}) => {
  const { detectedLanguage, isDetecting, detectLanguage } = useLanguageDetection();
  const [lastDetectedText, setLastDetectedText] = useState('');

  useEffect(() => {
    if (autoDetect && text && text !== lastDetectedText && text.length > 20) {
      detectLanguage(text);
      setLastDetectedText(text);
    }
  }, [text, autoDetect, detectLanguage, lastDetectedText]);

  useEffect(() => {
    if (detectedLanguage) {
      onLanguageDetected({
        code: detectedLanguage.code,
        name: detectedLanguage.name
      });
    }
  }, [detectedLanguage, onLanguageDetected]);

  const handleManualDetection = () => {
    if (text) {
      detectLanguage(text);
    }
  };

  if (!text) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-800">Language Detection</h3>
        </div>
        {!autoDetect && (
          <button
            onClick={handleManualDetection}
            disabled={isDetecting || !text}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Detect
          </button>
        )}
      </div>

      {isDetecting && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Detecting language...
        </div>
      )}

      {detectedLanguage && !isDetecting && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-800">
              Detected: {detectedLanguage.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${detectedLanguage.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {Math.round(detectedLanguage.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {autoDetect && (
        <p className="text-xs text-gray-500 mt-2">
          Language is automatically detected as you type
        </p>
      )}
    </div>
  );
};

export default LanguageDetector;