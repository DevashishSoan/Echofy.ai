import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Play, Download, Trash2, Edit, Volume2 } from 'lucide-react';
import { useElevenLabs } from '../hooks/useElevenLabs';
import { Voice } from '../types/elevenlabs';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import AudioPlayer from '../components/AudioPlayer';
import UsageStats from '../components/UsageStats';

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const {
    voices,
    loading,
    error,
    usageStats,
    deleteVoice,
    generateSpeech,
    clearError
  } = useElevenLabs(apiKey);

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || voice.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || 
                           voice.labels?.language === selectedLanguage ||
                           voice.fine_tuning?.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categories = ['all', ...Array.from(new Set(voices.map(v => v.category)))];
  const languages = ['all', ...Array.from(new Set(voices.map(v => v.labels?.language || v.fine_tuning?.language).filter(Boolean)))];

  const handlePreview = async (voice: Voice) => {
    if (previewingVoice === voice.voice_id) {
      setPreviewingVoice(null);
      return;
    }

    setPreviewingVoice(voice.voice_id);
    
    try {
      const sampleText = "Hello! This is a preview of how this voice sounds.";
      const audioBlob = await generateSpeech({
        voice_id: voice.voice_id,
        text: sampleText,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      });

      if (audioBlob) {
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
        audio.onended = () => setPreviewingVoice(null);
      }
    } catch (err) {
      console.error('Preview failed:', err);
      setPreviewingVoice(null);
    }
  };

  const handleDelete = async (voice: Voice) => {
    if (!window.confirm(`Are you sure you want to delete "${voice.name}"?`)) {
      return;
    }

    const success = await deleteVoice(voice.voice_id);
    if (success) {
      // Voice list will be automatically refreshed by the hook
    }
  };

  const handleUseVoice = (voice: Voice) => {
    // Navigate to TTS page with this voice pre-selected
    navigate('/text-to-speech', { state: { selectedVoice: voice } });
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
              <Volume2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">ElevenLabs API Key Required</h2>
              <p className="text-gray-600 mt-2">
                Enter your ElevenLabs API key to access your voice library
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Don't have an API key?</p>
                <a
                  href="https://elevenlabs.io/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-600"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Voice Library</h1>
          <p className="text-gray-600">
            Manage your collection of AI voices
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

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            {usageStats && (
              <UsageStats stats={usageStats} />
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>
                        {SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name || lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/voice-cloning')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                >
                  <Volume2 className="h-4 w-4" />
                  Clone New Voice
                </button>
                <button
                  onClick={() => navigate('/text-to-speech')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Play className="h-4 w-4" />
                  Text-to-Speech
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search voices..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {filteredVoices.length} of {voices.length} voices
                </div>
              </div>
            </div>

            {/* Voice Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600">Loading voices...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVoices.map((voice) => (
                  <div key={voice.voice_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{voice.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{voice.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePreview(voice)}
                          disabled={previewingVoice === voice.voice_id}
                          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        {voice.category === 'cloned' && (
                          <>
                            <button
                              onClick={() => handleDelete(voice)}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {voice.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {voice.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {voice.labels?.language && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {SUPPORTED_LANGUAGES.find(l => l.code === voice.labels?.language)?.name || voice.labels.language}
                        </span>
                      )}
                      <span>{voice.samples?.length || 0} samples</span>
                    </div>

                    <button
                      onClick={() => handleUseVoice(voice)}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Use Voice
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filteredVoices.length === 0 && !loading && (
              <div className="text-center py-12">
                <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No voices found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by cloning your first voice'}
                </p>
                <button
                  onClick={() => navigate('/voice-cloning')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Clone Voice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;