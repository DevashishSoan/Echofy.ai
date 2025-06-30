import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Settings, 
  Mic,
  Globe,
  Sliders,
  Save,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useApi } from '../contexts/ApiContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';

const TextToSpeechStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const { voices, loadVoices, generateSpeech, elevenLabsApiKey, error, clearError } = useApi();
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (elevenLabsApiKey) {
      loadVoices();
    }
  }, [elevenLabsApiKey, loadVoices]);

  // Auto-select first voice when voices load
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].voice_id);
    }
  }, [voices, selectedVoice]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [currentAudio, audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice || !elevenLabsApiKey) return;

    setIsGenerating(true);
    clearError();
    
    try {
      const audioBlob = await generateSpeech(text, selectedVoice, voiceSettings);
      
      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to generate speech:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!audioUrl) return;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
      console.error('Audio playback error');
    };
    
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Audio play failed:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    });
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `echofy-tts-${selectedVoice}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sampleTexts = [
    "Welcome to Echofy.ai, your premier voice AI platform.",
    "The quick brown fox jumps over the lazy dog.",
    "In a hole in the ground there lived a hobbit.",
    "To be or not to be, that is the question.",
    "The future belongs to those who believe in the beauty of their dreams."
  ];

  if (!elevenLabsApiKey) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Text-to-Speech Studio</h1>
          <p className="text-gray-600 mt-1">Generate professional-quality speech from text</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Volume2 className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ElevenLabs API Key Required</h3>
          <p className="text-gray-600 mb-6">
            To use the Text-to-Speech Studio, you need to configure your ElevenLabs API key in Settings.
          </p>
          <a
            href="/app/settings"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Settings className="w-5 h-5 mr-2" />
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Text-to-Speech Studio</h1>
          <p className="text-gray-600 mt-1">Generate professional-quality speech from text</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <select
              value={currentLanguage.code}
              onChange={(e) => {
                const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === e.target.value);
                if (selectedLang) setCurrentLanguage(selectedLang);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Text Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Text Input</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Sliders className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg leading-relaxed"
              maxLength={5000}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {text.length}/5000 characters
              </div>
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => setText(e.target.value)}
                  value=""
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sample texts...</option>
                  {sampleTexts.map((sample, index) => (
                    <option key={index} value={sample}>
                      Sample {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          {showSettings && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stability: {voiceSettings.stability.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.stability}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher values make the voice more stable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Similarity Boost: {voiceSettings.similarity_boost.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.similarity_boost}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, similarity_boost: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enhances similarity to the original voice</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style: {voiceSettings.style.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.style}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, style: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Adds more style and emotion</p>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={voiceSettings.use_speaker_boost}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, use_speaker_boost: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Speaker Boost</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Enhances speaker characteristics</p>
                </div>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Audio</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlay}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-0"></div>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Selection</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {voices.map((voice) => (
                <div
                  key={voice.voice_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVoice === voice.voice_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVoice(voice.voice_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{voice.name}</h4>
                      <p className="text-sm text-gray-600">{voice.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {voice.labels.gender && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {voice.labels.gender}
                          </span>
                        )}
                        {voice.labels.accent && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {voice.labels.accent}
                          </span>
                        )}
                        {voice.labels.age && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {voice.labels.age}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedVoice === voice.voice_id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {voices.length === 0 && (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading voices...</p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || !selectedVoice || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Generate Speech</span>
              </div>
            )}
          </button>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Import from Transcription</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Save className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Save to Library</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-2xl font-bold">Echofy.ai</span>
          </div>
          <div className="text-center text-gray-400 mb-4">
            <p>&copy; 2024 Echofy.ai. All rights reserved.</p>
          </div>
          <div className="flex justify-center">
            <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/logotext_poweredby_360w.png"
                alt="Built with Bolt.new"
                style={{ maxWidth: '150px', display: 'block', margin: '0 auto' }}
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TextToSpeechStudio;