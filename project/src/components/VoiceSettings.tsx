import React from 'react';
import { VoiceSettings as VoiceSettingsType } from '../types/elevenlabs';
import { Settings, Volume2, Zap, Palette } from 'lucide-react';

interface VoiceSettingsProps {
  settings: VoiceSettingsType;
  onChange: (settings: VoiceSettingsType) => void;
  disabled?: boolean;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  settings,
  onChange,
  disabled = false
}) => {
  const handleChange = (key: keyof VoiceSettingsType, value: number | boolean) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Voice Settings</h3>
      </div>
      
      <div className="space-y-6">
        {/* Stability */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="h-4 w-4 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">
              Stability: {settings.stability.toFixed(2)}
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.stability}
            onChange={(e) => handleChange('stability', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Variable</span>
            <span>More Stable</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Higher values make the voice more consistent but less expressive
          </p>
        </div>

        {/* Similarity Boost */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-500" />
            <label className="text-sm font-medium text-gray-700">
              Clarity + Similarity: {settings.similarity_boost.toFixed(2)}
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.similarity_boost}
            onChange={(e) => handleChange('similarity_boost', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Enhances clarity and similarity to the original voice
          </p>
        </div>

        {/* Style (if available) */}
        {typeof settings.style !== 'undefined' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-purple-500" />
              <label className="text-sm font-medium text-gray-700">
                Style: {settings.style.toFixed(2)}
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.style}
              onChange={(e) => handleChange('style', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Natural</span>
              <span>Expressive</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Controls the expressiveness and style of the voice
            </p>
          </div>
        )}

        {/* Speaker Boost */}
        {typeof settings.use_speaker_boost !== 'undefined' && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.use_speaker_boost}
                onChange={(e) => handleChange('use_speaker_boost', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Speaker Boost</span>
            </label>
            <p className="text-xs text-gray-600 mt-1 ml-6">
              Enhances the similarity to the original speaker (recommended for cloned voices)
            </p>
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChange({
              stability: 0.3,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            })}
            disabled={disabled}
            className="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            Expressive
          </button>
          <button
            onClick={() => onChange({
              stability: 0.7,
              similarity_boost: 0.6,
              style: 0.0,
              use_speaker_boost: true
            })}
            disabled={disabled}
            className="px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            Balanced
          </button>
          <button
            onClick={() => onChange({
              stability: 0.9,
              similarity_boost: 0.4,
              style: 0.0,
              use_speaker_boost: false
            })}
            disabled={disabled}
            className="px-3 py-2 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            Stable
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;