import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { elevenLabsApiKey, setElevenLabsApiKey, usage } = useApi();
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(elevenLabsApiKey || '');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    transcriptionComplete: true,
    voiceCloneReady: false,
    weeklyReport: true
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'language', name: 'Language', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    try {
      await updateUser(profileData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveApiKey = async () => {
    setSaveStatus('saving');
    try {
      setElevenLabsApiKey(apiKeyInput);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Saved!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </div>
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Plan</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{user?.plan} Plan</p>
                    <p className="text-sm text-gray-600">
                      {usage.charactersUsed.toLocaleString()} / {usage.charactersLimit.toLocaleString()} characters used
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min((usage.charactersUsed / usage.charactersLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saveStatus === 'saving'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {getSaveButtonContent()}
            </button>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ElevenLabs API Key</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      Your API key is required to use Text-to-Speech and Voice Cloning features. 
                      Get your API key from the <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs dashboard</a>.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your ElevenLabs API key..."
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {elevenLabsApiKey && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>API key configured</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Characters Used</p>
                  <p className="text-2xl font-bold text-gray-900">{usage.charactersUsed.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Characters Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(usage.charactersLimit - usage.charactersUsed).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Usage Percentage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((usage.charactersUsed / usage.charactersLimit) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={saveStatus === 'saving' || !apiKeyInput}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {getSaveButtonContent()}
            </button>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Language</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select your preferred language for voice transcription and text-to-speech.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <div
                    key={language.code}
                    onClick={() => setCurrentLanguage(language)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      currentLanguage.code === language.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <p className="font-medium text-gray-900">{language.name}</p>
                        <p className="text-sm text-gray-600">{language.nativeName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {key === 'emailUpdates' && 'Email Updates'}
                        {key === 'transcriptionComplete' && 'Transcription Complete'}
                        {key === 'voiceCloneReady' && 'Voice Clone Ready'}
                        {key === 'weeklyReport' && 'Weekly Report'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'emailUpdates' && 'Receive updates about new features and improvements'}
                        {key === 'transcriptionComplete' && 'Get notified when transcription is finished'}
                        {key === 'voiceCloneReady' && 'Alert when voice cloning is complete'}
                        {key === 'weeklyReport' && 'Weekly summary of your usage and activity'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Data Security</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Your audio data is processed securely and never stored on our servers. 
                        All transcriptions and voice generations are processed in real-time and deleted immediately after processing.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Data Collection</p>
                      <p className="text-sm text-gray-600">Allow collection of usage analytics to improve the service</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Communications</p>
                      <p className="text-sm text-gray-600">Receive promotional emails and product updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300">
                  <div className="w-full h-20 bg-white border border-gray-200 rounded mb-3"></div>
                  <p className="font-medium text-gray-900">Light</p>
                  <p className="text-sm text-gray-600">Clean and bright interface</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 opacity-50">
                  <div className="w-full h-20 bg-gray-800 rounded mb-3"></div>
                  <p className="font-medium text-gray-900">Dark</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 opacity-50">
                  <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-3"></div>
                  <p className="font-medium text-gray-900">Auto</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            {renderTabContent()}
          </div>
        </div>
      </div>

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

export default Settings;