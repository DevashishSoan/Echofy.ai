import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Volume2, 
  Users, 
  Library, 
  Globe, 
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Play,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';

interface ActivityItem {
  id: string;
  type: 'transcription' | 'tts' | 'clone';
  title: string;
  time: string;
  status: 'completed' | 'processing' | 'failed';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { usage, elevenLabsApiKey } = useApi();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock recent activity data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'transcription',
          title: 'Meeting Notes Transcription',
          time: '2 hours ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'tts',
          title: 'Product Demo Narration',
          time: '5 hours ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'clone',
          title: 'Custom Voice Training',
          time: '1 day ago',
          status: 'processing'
        }
      ];
      
      setRecentActivity(mockActivity);
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Voice Transcription',
      description: 'Convert speech to text in real-time',
      icon: Mic,
      href: '/app/transcription',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Text-to-Speech Studio',
      description: 'Generate professional speech from text',
      icon: Volume2,
      href: '/app/tts-studio',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Voice Cloning Lab',
      description: 'Create custom voices from samples',
      icon: Users,
      href: '/app/voice-cloning',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      gradient: 'from-green-50 to-green-100'
    },
    {
      title: 'Language Center',
      description: 'Explore multi-language features',
      icon: Globe,
      href: '/app/languages',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      gradient: 'from-orange-50 to-orange-100'
    }
  ];

  const stats = [
    {
      name: 'Characters Used',
      value: usage.charactersUsed.toLocaleString(),
      limit: usage.charactersLimit.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      percentage: (usage.charactersUsed / usage.charactersLimit) * 100
    },
    {
      name: 'Voices Available',
      value: '100+',
      icon: Volume2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Languages Supported',
      value: '20+',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Processing Speed',
      value: '<1s',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transcription':
        return <Mic className="w-5 h-5 text-blue-600" />;
      case 'tts':
        return <Volume2 className="w-5 h-5 text-purple-600" />;
      case 'clone':
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'transcription':
        return 'bg-blue-100';
      case 'tts':
        return 'bg-purple-100';
      case 'clone':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" />
            failed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-gray-200 rounded-2xl h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="relative flex items-center justify-between">
          <div className="animate-in slide-up duration-700">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to create amazing voice experiences today?
            </p>
          </div>
          <div className="hidden md:block animate-in scale-in duration-500 delay-300">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Mic className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-up duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                    {stat.limit && <span className="text-sm text-gray-500">/{stat.limit}</span>}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center transform transition-transform hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.percentage !== undefined && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(stat.percentage)}% used</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-up duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      Get started
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg animate-in slide-up duration-500 delay-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-in slide-up duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBgColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))}
          </div>
          <Link
            to="/app/library"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all activity →
          </Link>
        </div>

        {/* Quick Library Access */}
        <div className="bg-white rounded-xl p-6 shadow-lg animate-in slide-up duration-500 delay-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Library</h3>
            <Library className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Library className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Your voice projects will appear here</p>
            <Link
              to="/app/library"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Library className="w-4 h-4 mr-2" />
              Go to Library
            </Link>
          </div>
        </div>
      </div>

      {/* API Key Status */}
      {!elevenLabsApiKey && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 animate-in bounce-in duration-600">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Setup</h3>
              <p className="text-yellow-800 text-sm mb-4">
                Add your ElevenLabs API key to unlock Text-to-Speech and Voice Cloning features.
              </p>
              <Link
                to="/app/settings"
                className="inline-flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors transform hover:scale-105"
              >
                Configure API Key
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      )}

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

export default Dashboard;