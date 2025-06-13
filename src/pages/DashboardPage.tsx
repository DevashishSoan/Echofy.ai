import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Mic, 
  FileText, 
  Settings, 
  LogOut, 
  Volume2, 
  Wand2, 
  Library, 
  Globe,
  BarChart3,
  Clock,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalTranscriptions: number;
  totalWords: number;
  recentTranscriptions: any[];
  languagesUsed: string[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTranscriptions: 0,
    totalWords: 0,
    recentTranscriptions: [],
    languagesUsed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: transcriptions, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalWords = transcriptions?.reduce((sum, t) => sum + (t.word_count || 0), 0) || 0;
      const languagesUsed = [...new Set(transcriptions?.map(t => t.language).filter(Boolean))] || [];
      const recentTranscriptions = transcriptions?.slice(0, 5) || [];

      setStats({
        totalTranscriptions: transcriptions?.length || 0,
        totalWords,
        recentTranscriptions,
        languagesUsed
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Unable to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickActions = [
    {
      title: 'Voice Transcription',
      description: 'Convert speech to text in real-time',
      icon: Mic,
      color: 'blue',
      path: '/recorder'
    },
    {
      title: 'Text-to-Speech Studio',
      description: 'Generate high-quality AI speech',
      icon: Volume2,
      color: 'green',
      path: '/text-to-speech'
    },
    {
      title: 'Voice Cloning Lab',
      description: 'Create custom AI voices',
      icon: Wand2,
      color: 'purple',
      path: '/voice-cloning'
    },
    {
      title: 'Voice Library',
      description: 'Manage your AI voices',
      icon: Library,
      color: 'orange',
      path: '/library'
    },
    {
      title: 'Language Center',
      description: 'Explore 20+ languages',
      icon: Globe,
      color: 'indigo',
      path: '/language-center'
    },
    {
      title: 'My Transcriptions',
      description: 'View and manage transcriptions',
      icon: FileText,
      color: 'teal',
      path: '/transcriptions'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-100',
      green: 'bg-green-500 text-green-500 bg-green-50 hover:bg-green-100',
      purple: 'bg-purple-500 text-purple-500 bg-purple-50 hover:bg-purple-100',
      orange: 'bg-orange-500 text-orange-500 bg-orange-50 hover:bg-orange-100',
      indigo: 'bg-indigo-500 text-indigo-500 bg-indigo-50 hover:bg-indigo-100',
      teal: 'bg-teal-500 text-teal-500 bg-teal-50 hover:bg-teal-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Mic className="h-8 w-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-800">Echofy.ai</span>
              </div>
              <span className="text-sm text-gray-500 hidden sm:block">Voice AI Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome back, {user?.name}!
              </span>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to your Voice AI Dashboard
          </h1>
          <p className="text-gray-600">
            Transform speech to text, generate AI voices, and explore multilingual capabilities
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transcriptions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : stats.totalTranscriptions}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Words Transcribed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : stats.totalWords.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Languages Used</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : stats.languagesUsed.length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : stats.recentTranscriptions.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const colorClasses = getColorClasses(action.color).split(' ');
              const iconBg = colorClasses[0];
              const textColor = colorClasses[1];
              const cardBg = colorClasses[2];
              const hoverBg = colorClasses[3];
              
              return (
                <div
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`${cardBg} ${hoverBg} p-6 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${iconBg} rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Transcriptions</h3>
              <button
                onClick={() => navigate('/transcriptions')}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View All
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentTranscriptions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTranscriptions.map((transcription) => (
                  <div key={transcription.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-800">{transcription.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {transcription.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(transcription.created_at).toLocaleDateString()}</span>
                      <span>{transcription.word_count} words</span>
                      {transcription.language && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {transcription.language}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transcriptions yet</p>
                <button
                  onClick={() => navigate('/recorder')}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Create your first transcription
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Start with Voice Transcription</h4>
                  <p className="text-sm text-gray-600">
                    Convert your speech to text in real-time with our advanced AI
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Explore Text-to-Speech</h4>
                  <p className="text-sm text-gray-600">
                    Generate natural-sounding speech from text using AI voices
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Clone Your Voice</h4>
                  <p className="text-sm text-gray-600">
                    Create custom AI voices from audio samples
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Go Multilingual</h4>
                  <p className="text-sm text-gray-600">
                    Work with 20+ languages and regional accents
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;