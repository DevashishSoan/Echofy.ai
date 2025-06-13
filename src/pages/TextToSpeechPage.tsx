import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Volume2, Download, Play, Settings, Wand2, RotateCcw } from 'lucide-react';
import { useElevenLabs } from '../hooks/useElevenLabs';
import { Voice, VoiceSettings as VoiceSettingsType } from '../types/elevenlabs';
import VoiceSelector from '../components/VoiceSelector';
import VoiceSettings from '../components/VoiceSettings';
import VoiceComparison from '../components/VoiceComparison';
import AudioPlayer from '../components/AudioPlayer';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguageSelection } from '../hooks/useLanguageSelection';
import { saveAs } from 'file-saver';

const TextToSpeechPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedLanguage, changeLanguage } = useLanguageSelection();
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true,
  });
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);
  const [showBatchMode, setShowBatchMode] = useState(false);

  const {
    voices,
    loading: voicesLoading,
    error,
    generateSpeech,
    clearError
  } = useElevenLabs(apiKey);

  // Handle pre-selected voice from navigation state
  useEffect(() => {
    if (location.state?.selectedVoice) {
      setSelectedVoice(location.state.selectedVoice);
    }
    if (location.state?.selectedLanguage) {
      changeLanguage(location.state.selectedLanguage);
    }
  }, [location.state, changeLanguage]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('elevenlabs_api_key', apiKey);
    }
  }, [apiKey]);

  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) return;

    setIsGenerating(true);
    try {
      const audioBlob = await generateSpeech({
        voice_id: selectedVoice.voice_id,
        text: text,
        voice_settings: voiceSettings,
      });

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        setGeneratedAudio(audioUrl);
        
        // Add to history
        const historyItem = {
          id: Date.now(),
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          voiceName: selectedVoice.name,
          audioUrl,
          timestamp: new Date().toLocaleString(),
          settings: { ...voiceSettings }
        };
        setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!selectedVoice || batchTexts.every(t => !t.trim())) return;

    setIsGenerating(true);
    const results = [];

    try {
      for (const [index, batchText] of batchTexts.entries()) {
        if (!batchText.trim()) continue;

        const audioBlob = await generateSpeech({
          voice_id: selectedVoice.voice_id,
          text: batchText,
          voice_settings: voiceSettings,
        });

        if (audioBlob) {
          const audioUrl = URL.createObjectURL(audioBlob);
          results.push({
            index,
            text: batchText,
            audioUrl,
            blob: audioBlob
          });
        }
      }

      // Download all as zip would require additional library
      // For now, download individually
      results.forEach((result, i) => {
        setTimeout(() => {
          saveAs(result.blob, `batch-audio-${i + 1}-${selectedVoice.name}.mp3`);
        }, i * 1000);
      });

    } catch (err) {
      console.error('Batch generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio || !selectedVoice) return;

    fetch(generatedAudio)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, `${selectedVoice.name}-${Date.now()}.mp3`);
      });
  };

  const addBatchText = () => {
    setBatchTexts(prev => [...prev, '']);
  };

  const updateBatchText = (index: number, value: string) => {
    setBatchTexts(prev => prev.map((text, i) => i === index ? value : text));
  };

  const removeBatchText = (index: number) => {
    setBatchTexts(prev => prev.filter((_, i) => i !== index));
  };

  const sampleTexts = {
    'en-US': 'Hello! This is a sample of how this voice sounds. You can use this to test different voices and settings.',
    'es-ES': 'Hola! Esta es una muestra de cómo suena esta voz. Puedes usar esto para probar diferentes voces y configuraciones.',
    'fr-FR': 'Bonjour! Ceci est un échantillon de la façon dont cette voix sonne. Vous pouvez utiliser ceci pour tester différentes voix et paramètres.',
    'de-DE': 'Hallo! Dies ist eine Probe davon, wie diese Stimme klingt. Sie können dies verwenden, um verschiedene Stimmen und Einstellungen zu testen.',
    'it-IT': 'Ciao! Questo è un campione di come suona questa voce. Puoi usarlo per testare diverse voci e impostazioni.',
    'pt-BR': 'Olá! Esta é uma amostra de como esta voz soa. Você pode usar isso para testar diferentes vozes e configurações.',
    'ja-JP': 'こんにちは！これはこの声がどのように聞こえるかのサンプルです。これを使用して、さまざまな音声と設定をテストできます。',
    'ko-KR': '안녕하세요! 이것은 이 목소리가 어떻게 들리는지에 대한 샘플입니다. 이것을 사용하여 다양한 음성과 설정을 테스트할 수 있습니다.',
    'zh-CN': '你好！这是这个声音听起来如何的样本。您可以使用它来测试不同的声音和设置。',
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <Volume2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">ElevenLabs API Key Required</h2>
              <p className="text-gray-600 mt-2">
                Enter your ElevenLabs API key to access text-to-speech features
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your ElevenLabs API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Don't have an API key?</p>
                <a
                  href="https://elevenlabs.io/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Get one from ElevenLabs →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Text-to-Speech Studio</h1>
          <p className="text-gray-600">
            Generate high-quality speech from text using AI voices
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Language</h3>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={changeLanguage}
              />
            </div>

            {/* Text Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Text Input</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setText(sampleTexts[selectedLanguage.code as keyof typeof sampleTexts] || sampleTexts['en-US'])}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Wand2 className="h-4 w-4" />
                    Sample Text
                  </button>
                  <button
                    onClick={() => setShowBatchMode(!showBatchMode)}
                    className={`px-3 py-1 text-sm rounded ${
                      showBatchMode 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Batch Mode
                  </button>
                </div>
              </div>

              {showBatchMode ? (
                <div className="space-y-3">
                  {batchTexts.map((batchText, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={batchText}
                        onChange={(e) => updateBatchText(index, e.target.value)}
                        placeholder={`Text ${index + 1}...`}
                        className="flex-1 h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        maxLength={1000}
                      />
                      {batchTexts.length > 1 && (
                        <button
                          onClick={() => removeBatchText(index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={addBatchText}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      + Add Text
                    </button>
                    <button
                      onClick={handleBatchGenerate}
                      disabled={!selectedVoice || batchTexts.every(t => !t.trim()) || isGenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate All'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{text.length} / 5000 characters</span>
                    <button
                      onClick={handleGenerate}
                      disabled={!selectedVoice || !text.trim() || isGenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate Speech'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Voice Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Voice Selection</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Compare
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
              </div>

              {showComparison ? (
                <VoiceComparison
                  voices={voices.filter(v => 
                    !selectedLanguage || 
                    v.labels?.language === selectedLanguage.code ||
                    v.fine_tuning?.language === selectedLanguage.code
                  )}
                  sampleText={text || sampleTexts[selectedLanguage.code as keyof typeof sampleTexts] || sampleTexts['en-US']}
                  onVoiceSelect={setSelectedVoice}
                />
              ) : (
                <VoiceSelector
                  voices={voices}
                  selectedVoice={selectedVoice}
                  onVoiceSelect={setSelectedVoice}
                  loading={voicesLoading}
                  language={selectedLanguage.code}
                />
              )}
            </div>

            {/* Generated Audio */}
            {generatedAudio && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Audio</h3>
                <AudioPlayer
                  audioUrl={generatedAudio}
                  title={selectedVoice?.name}
                  onDownload={handleDownload}
                  autoPlay={true}
                />
              </div>
            )}

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Generations</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.voiceName}</p>
                        <p className="text-xs text-gray-600">{item.text}</p>
                        <p className="text-xs text-gray-500">{item.timestamp}</p>
                      </div>
                      <AudioPlayer
                        audioUrl={item.audioUrl}
                        className="w-48"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Settings */}
            {showSettings && selectedVoice && (
              <VoiceSettings
                settings={voiceSettings}
                onChange={setVoiceSettings}
                disabled={isGenerating}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/voice-cloning')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                >
                  <Wand2 className="h-4 w-4" />
                  Clone Voice
                </button>
                <button
                  onClick={() => navigate('/library')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  <Volume2 className="h-4 w-4" />
                  Voice Library
                </button>
                <button
                  onClick={() => navigate('/transcriptions')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Download className="h-4 w-4" />
                  My Transcriptions
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Use punctuation for natural pauses</li>
                <li>• Adjust stability for consistency vs. expressiveness</li>
                <li>• Higher similarity boost for voice accuracy</li>
                <li>• Try different voices for various content types</li>
                <li>• Use batch mode for multiple texts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;