import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Star } from 'lucide-react';
import { Voice } from '../types/elevenlabs';
import { useElevenLabs } from '../hooks/useElevenLabs';

interface VoiceComparisonProps {
  voices: Voice[];
  sampleText: string;
  onVoiceSelect?: (voice: Voice) => void;
  className?: string;
}

interface ComparisonVoice extends Voice {
  audioUrl?: string;
  isPlaying?: boolean;
  isGenerating?: boolean;
  rating?: number;
}

const VoiceComparison: React.FC<VoiceComparisonProps> = ({
  voices,
  sampleText,
  onVoiceSelect,
  className = ''
}) => {
  const [comparisonVoices, setComparisonVoices] = useState<ComparisonVoice[]>(
    voices.slice(0, 4).map(voice => ({ ...voice, rating: 0 }))
  );
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const { generateSpeech } = useElevenLabs(localStorage.getItem('elevenlabs_api_key') || '');

  const generateAudioForVoice = async (voice: ComparisonVoice) => {
    if (!sampleText.trim()) return;

    setComparisonVoices(prev => prev.map(v => 
      v.voice_id === voice.voice_id 
        ? { ...v, isGenerating: true }
        : v
    ));

    try {
      const audioBlob = await generateSpeech({
        voice_id: voice.voice_id,
        text: sampleText,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      });

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        setComparisonVoices(prev => prev.map(v => 
          v.voice_id === voice.voice_id 
            ? { ...v, audioUrl, isGenerating: false }
            : v
        ));
      }
    } catch (error) {
      console.error('Failed to generate audio:', error);
      setComparisonVoices(prev => prev.map(v => 
        v.voice_id === voice.voice_id 
          ? { ...v, isGenerating: false }
          : v
      ));
    }
  };

  const playAudio = (voice: ComparisonVoice) => {
    if (!voice.audioUrl) {
      generateAudioForVoice(voice);
      return;
    }

    if (currentlyPlaying === voice.voice_id) {
      // Stop current audio
      setCurrentlyPlaying(null);
      setComparisonVoices(prev => prev.map(v => ({ ...v, isPlaying: false })));
      return;
    }

    // Stop any currently playing audio
    setCurrentlyPlaying(voice.voice_id);
    setComparisonVoices(prev => prev.map(v => ({
      ...v,
      isPlaying: v.voice_id === voice.voice_id
    })));

    const audio = new Audio(voice.audioUrl);
    audio.play();
    audio.onended = () => {
      setCurrentlyPlaying(null);
      setComparisonVoices(prev => prev.map(v => ({ ...v, isPlaying: false })));
    };
  };

  const rateVoice = (voiceId: string, rating: number) => {
    setComparisonVoices(prev => prev.map(v => 
      v.voice_id === voiceId 
        ? { ...v, rating }
        : v
    ));
  };

  const regenerateAll = () => {
    comparisonVoices.forEach(voice => {
      if (voice.audioUrl) {
        URL.revokeObjectURL(voice.audioUrl);
      }
    });
    
    setComparisonVoices(prev => prev.map(v => ({ 
      ...v, 
      audioUrl: undefined, 
      isPlaying: false, 
      isGenerating: false 
    })));
    setCurrentlyPlaying(null);
  };

  const replaceVoice = (index: number, newVoice: Voice) => {
    setComparisonVoices(prev => {
      const updated = [...prev];
      if (updated[index].audioUrl) {
        URL.revokeObjectURL(updated[index].audioUrl);
      }
      updated[index] = { ...newVoice, rating: 0 };
      return updated;
    });
  };

  const getBestVoice = () => {
    return comparisonVoices.reduce((best, current) => 
      (current.rating || 0) > (best.rating || 0) ? current : best
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Voice Comparison</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={regenerateAll}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate All
          </button>
        </div>
      </div>

      {/* Sample Text */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Text:</h4>
        <p className="text-sm text-gray-800">{sampleText}</p>
      </div>

      {/* Voice Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {comparisonVoices.map((voice, index) => (
          <div key={voice.voice_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-800">{voice.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{voice.category}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playAudio(voice)}
                  disabled={voice.isGenerating}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  {voice.isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : voice.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Rate this voice:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => rateVoice(voice.voice_id, rating)}
                    className={`p-1 ${
                      rating <= (voice.rating || 0)
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Details */}
            <div className="text-xs text-gray-500 space-y-1">
              {voice.labels?.language && (
                <div>Language: {voice.labels.language}</div>
              )}
              {voice.description && (
                <div className="line-clamp-2">{voice.description}</div>
              )}
            </div>

            {/* Replace Voice */}
            <div className="mt-3">
              <select
                onChange={(e) => {
                  const newVoice = voices.find(v => v.voice_id === e.target.value);
                  if (newVoice) replaceVoice(index, newVoice);
                }}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                value=""
              >
                <option value="">Replace with...</option>
                {voices
                  .filter(v => !comparisonVoices.some(cv => cv.voice_id === v.voice_id))
                  .map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Best Voice Recommendation */}
      {comparisonVoices.some(v => v.rating && v.rating > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800">Recommended Voice</h4>
              <p className="text-sm text-green-700">
                {getBestVoice().name} - Rated {getBestVoice().rating}/5 stars
              </p>
            </div>
            {onVoiceSelect && (
              <button
                onClick={() => onVoiceSelect(getBestVoice())}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Use This Voice
              </button>
            )}
          </div>
        </div>
      )}

      {!sampleText && (
        <div className="text-center py-8 text-gray-500">
          <Volume2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Enter sample text to compare voices</p>
        </div>
      )}
    </div>
  );
};

export default VoiceComparison;