import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Volume2, Mic, FileText, Play } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { useLanguageSelection } from '../hooks/useLanguageSelection';

const LanguageCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLanguage, changeLanguage } = useLanguageSelection();
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { code: 'all', name: 'All Languages', flag: '🌍' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  const filteredLanguages = selectedRegion === 'all' 
    ? SUPPORTED_LANGUAGES 
    : SUPPORTED_LANGUAGES.filter(lang => lang.code.startsWith(selectedRegion));

  const getLanguageStats = (languageCode: string) => {
    // Mock stats - in a real app, these would come from your analytics
    const baseStats = {
      transcriptions: Math.floor(Math.random() * 1000) + 100,
      audioGenerated: Math.floor(Math.random() * 500) + 50,
      voicesAvailable: Math.floor(Math.random() * 20) + 5,
    };
    return baseStats;
  };

  const handleLanguageSelect = (language: any) => {
    changeLanguage(language);
    // You could navigate to a specific page or show language-specific content
  };

  const navigateToFeature = (feature: string, language?: any) => {
    const state = language ? { selectedLanguage: language } : {};
    
    switch (feature) {
      case 'transcription':
        navigate('/recorder', { state });
        break;
      case 'tts':
        navigate('/text-to-speech', { state });
        break;
      case 'cloning':
        navigate('/voice-cloning', { state });
        break;
      case 'library':
        navigate('/library', { state });
        break;
      default:
        navigate('/dashboard');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Language Center</h1>
          <p className="text-gray-600">
            Explore voice AI features across 20+ languages
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Language */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Language</h3>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">{selectedLanguage.flag}</span>
                <div>
                  <p className="font-medium text-gray-800">{selectedLanguage.name}</p>
                  <p className="text-sm text-gray-600">{selectedLanguage.nativeName}</p>
                </div>
              </div>
            </div>

            {/* Region Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Region</h3>
              <div className="space-y-2">
                {regions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => setSelectedRegion(region.code)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedRegion === region.code
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{region.flag}</span>
                    <span className="text-sm font-medium">{region.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigateToFeature('transcription')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Mic className="h-4 w-4" />
                  Start Transcription
                </button>
                <button
                  onClick={() => navigateToFeature('tts')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  <Volume2 className="h-4 w-4" />
                  Text-to-Speech
                </button>
                <button
                  onClick={() => navigateToFeature('cloning')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                >
                  <Play className="h-4 w-4" />
                  Clone Voice
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Language Grid */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Available Languages</h3>
                <span className="text-sm text-gray-600">
                  {filteredLanguages.length} languages
                </span>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLanguages.map((language) => {
                  const stats = getLanguageStats(language.code);
                  return (
                    <div
                      key={language.code}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedLanguage.code === language.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLanguageSelect(language)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{language.name}</h4>
                          <p className="text-sm text-gray-600">{language.nativeName}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Voices Available:</span>
                          <span className="font-medium">{language.voices.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transcriptions:</span>
                          <span className="font-medium">{stats.transcriptions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Audio Generated:</span>
                          <span className="font-medium">{stats.audioGenerated}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToFeature('transcription', language);
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            <Mic className="h-3 w-3 inline mr-1" />
                            Record
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToFeature('tts', language);
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            <Volume2 className="h-3 w-3 inline mr-1" />
                            TTS
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcription Features</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-500" />
                    Real-time speech recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Auto language detection
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Multi-speaker identification
                  </li>
                  <li className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-blue-500" />
                    Timestamp generation
                  </li>
                </ul>
                <button
                  onClick={() => navigateToFeature('transcription')}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Start Transcribing
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Generation</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-green-500" />
                    High-quality TTS
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-green-500" />
                    Voice cloning
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    Native accent support
                  </li>
                  <li className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-green-500" />
                    Emotion control
                  </li>
                </ul>
                <button
                  onClick={() => navigateToFeature('tts')}
                  className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Generate Speech
                </button>
              </div>
            </div>

            {/* Popular Languages */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Popular Languages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SUPPORTED_LANGUAGES.slice(0, 8).map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-sm font-medium text-gray-800">{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageCenterPage;