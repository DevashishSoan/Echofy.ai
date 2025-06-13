import React from 'react';
import { UsageStats as UsageStatsType } from '../types/elevenlabs';
import { BarChart3, Clock, Mic, Zap } from 'lucide-react';

interface UsageStatsProps {
  stats: UsageStatsType;
  className?: string;
}

const UsageStats: React.FC<UsageStatsProps> = ({ stats, className = '' }) => {
  const characterUsagePercentage = (stats.character_count / stats.character_limit) * 100;
  const voiceUsagePercentage = (stats.voice_count / stats.voice_limit) * 100;
  
  const resetDate = new Date(stats.next_character_count_reset_unix * 1000);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Usage Statistics</h3>
      </div>

      <div className="space-y-6">
        {/* Character Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Characters</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatNumber(stats.character_count)} / {formatNumber(stats.character_limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                characterUsagePercentage > 90 
                  ? 'bg-red-500' 
                  : characterUsagePercentage > 70 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(characterUsagePercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{characterUsagePercentage.toFixed(1)}% used</span>
            <span>{formatNumber(stats.character_limit - stats.character_count)} remaining</span>
          </div>
        </div>

        {/* Voice Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Voices</span>
            </div>
            <span className="text-sm text-gray-600">
              {stats.voice_count} / {stats.voice_limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                voiceUsagePercentage > 90 
                  ? 'bg-red-500' 
                  : voiceUsagePercentage > 70 
                  ? 'bg-yellow-500' 
                  : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min(voiceUsagePercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{voiceUsagePercentage.toFixed(1)}% used</span>
            <span>{stats.voice_limit - stats.voice_count} remaining</span>
          </div>
        </div>

        {/* Reset Information */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Next Reset</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>{resetDate.toLocaleDateString()} ({daysUntilReset} days)</p>
            <p className="text-xs text-gray-500 mt-1">
              Character limit resets monthly
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Account Status</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              stats.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {stats.status}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Features</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Instant Voice Cloning</span>
              <span className={stats.can_use_instant_voice_cloning ? 'text-green-600' : 'text-red-600'}>
                {stats.can_use_instant_voice_cloning ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Professional Voice Cloning</span>
              <span className={stats.can_use_professional_voice_cloning ? 'text-green-600' : 'text-red-600'}>
                {stats.can_use_professional_voice_cloning ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Extend Character Limit</span>
              <span className={stats.can_extend_character_limit ? 'text-green-600' : 'text-red-600'}>
                {stats.can_extend_character_limit ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;