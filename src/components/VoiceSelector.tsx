import React from 'react';
import { Voice } from '../types/elevenlabs';
import { Volume2, Play, Pause } from 'lucide-react';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onVoiceSelect: (voice: Voice) => void;
  onPreview?: (voice: Voice) => void;
  isPlaying?: string | null;
  loading?: boolean;
  language?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onVoiceSelect,
  onPreview,
  isPlaying,
  loading,
  language
}) => {
  // Filter voices by language if specified
  const filteredVoices = language 
    ? voices.filter(voice => 
        voice.labels?.language === language || 
        voice.fine_tuning?.language === language
      )
    : voices;

  const categorizedVoices = filteredVoices.reduce((acc, voice) => {
    const category = voice.category || 'generated';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(voice);
    return acc;
  }, {} as Record<string, Voice[]>);

  const categoryLabels = {
    premade: 'Professional Voices',
    cloned: 'Cloned Voices',
    generated: 'Generated Voices',
    professional: 'Professional Clones'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading voices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(categorizedVoices).map(([category, categoryVoices]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {categoryLabels[category as keyof typeof categoryLabels] || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryVoices.map((voice) => (
              <div
                key={voice.voice_id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedVoice?.voice_id === voice.voice_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onVoiceSelect(voice)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{voice.name}</h4>
                  {onPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(voice);
                      }}
                      className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                      disabled={isPlaying === voice.voice_id}
                    >
                      {isPlaying === voice.voice_id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {voice.description && (
                  <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Volume2 className="h-3 w-3 mr-1" />
                    {voice.category}
                  </span>
                  {voice.labels?.language && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {voice.labels.language}
                    </span>
                  )}
                </div>
                
                {voice.labels && Object.keys(voice.labels).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(voice.labels).map(([key, value]) => (
                      key !== 'language' && (
                        <span
                          key={key}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {value}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {filteredVoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No voices available for the selected language.
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;