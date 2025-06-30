import React, { useState } from 'react';
import { 
  Globe, 
  Volume2, 
  Mic, 
  Play, 
  Download,
  TrendingUp,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';

const LanguageCenter: React.FC = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const languageStats = {
    'en': { popularity: 95, voices: 45, users: '2.1M' },
    'es': { popularity: 88, voices: 32, users: '1.8M' },
    'fr': { popularity: 82, voices: 28, users: '1.2M' },
    'de': { popularity: 79, voices: 25, users: '980K' },
    'it': { popularity: 75, voices: 22, users: '750K' },
    'pt': { popularity: 73, voices: 20, users: '680K' },
    'ja': { popularity: 85, voices: 18, users: '920K' },
    'ko': { popularity: 78, voices: 15, users: '540K' },
    'zh': { popularity: 90, voices: 35, users: '1.9M' },
    'ar': { popularity: 70, voices: 12, users: '420K' },
    'ru': { popularity: 76, voices: 16, users: '630K' },
    'hi': { popularity: 82, voices: 14, users: '890K' },
    'nl': { popularity: 68, voices: 10, users: '320K' },
    'pl': { popularity: 65, voices: 8, users: '280K' },
    'sv': { popularity: 62, voices: 6, users: '180K' }
  };

  const categories = [
    { id: 'all', name: 'All Languages', count: SUPPORTED_LANGUAGES.length },
    { id: 'popular', name: 'Most Popular', count: 8 },
    { id: 'european', name: 'European', count: 7 },
    { id: 'asian', name: 'Asian', count: 4 },
    { id: 'emerging', name: 'Emerging', count: 3 }
  ];

  const getFilteredLanguages = () => {
    switch (selectedCategory) {
      case 'popular':
        return SUPPORTED_LANGUAGES.filter(lang => 
          ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'hi'].includes(lang.code)
        );
      case 'european':
        return SUPPORTED_LANGUAGES.filter(lang => 
          ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'ru'].includes(lang.code)
        );
      case 'asian':
        return SUPPORTED_LANGUAGES.filter(lang => 
          ['ja', 'ko', 'zh', 'hi'].includes(lang.code)
        );
      case 'emerging':
        return SUPPORTED_LANGUAGES.filter(lang => 
          ['ar', 'nl', 'pl', 'sv'].includes(lang.code)
        );
      default:
        return SUPPORTED_LANGUAGES;
    }
  };

  const filteredLanguages = getFilteredLanguages();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Language Center</h1>
        <p className="text-gray-600 mt-1">Explore multi-language voice AI capabilities</p>
      </div>

      {/* Current Language */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Currently Using: {currentLanguage.flag} {currentLanguage.name}
            </h2>
            <p className="text-blue-100 mb-4">
              Native: {currentLanguage.nativeName}
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>{languageStats[currentLanguage.code as keyof typeof languageStats]?.voices || 0} voices</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{languageStats[currentLanguage.code as keyof typeof languageStats]?.users || '0'} users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{languageStats[currentLanguage.code as keyof typeof languageStats]?.popularity || 0}% popularity</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {currentLanguage.flag}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Categories</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLanguages.map((language) => {
          const stats = languageStats[language.code as keyof typeof languageStats];
          const isActive = currentLanguage.code === language.code;
          
          return (
            <div
              key={language.code}
              className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setCurrentLanguage(language)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{language.flag}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{language.name}</h3>
                    <p className="text-sm text-gray-600">{language.nativeName}</p>
                  </div>
                </div>
                {isActive && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                )}
              </div>

              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Popularity</span>
                    <span className="font-medium">{stats.popularity}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${stats.popularity}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.voices}</div>
                      <div className="text-xs text-gray-500">Voices</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.users}</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  {isActive ? 'Active' : 'Select'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Language Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Language Features</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Real-time Transcription</h4>
                <p className="text-sm text-gray-600">Convert speech to text in any supported language</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Native Voice Generation</h4>
                <p className="text-sm text-gray-600">Generate speech with native pronunciation and accents</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Auto Language Detection</h4>
                <p className="text-sm text-gray-600">Automatically detect the spoken language</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Languages</span>
              <span className="font-semibold text-gray-900">{SUPPORTED_LANGUAGES.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Voices</span>
              <span className="font-semibold text-gray-900">
                {Object.values(languageStats).reduce((sum, stat) => sum + stat.voices, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Most Popular</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-semibold text-gray-900">English</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fastest Growing</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🇮🇳</span>
                <span className="font-semibold text-gray-900">Hindi</span>
              </div>
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

export default LanguageCenter;