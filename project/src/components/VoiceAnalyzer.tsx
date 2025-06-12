import React, { useState, useEffect } from 'react';
import { BarChart3, Mic, Volume2, Zap, TrendingUp } from 'lucide-react';

interface VoiceAnalysis {
  pitch: {
    average: number;
    range: number;
    stability: number;
  };
  tone: {
    warmth: number;
    clarity: number;
    energy: number;
  };
  characteristics: string[];
  recommendations: string[];
  quality: number;
}

interface VoiceAnalyzerProps {
  audioBlob: Blob | null;
  onAnalysisComplete?: (analysis: VoiceAnalysis) => void;
  className?: string;
}

const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({
  audioBlob,
  onAnalysisComplete,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVoice = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate voice analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis results - in production, this would use actual audio analysis
      const mockAnalysis: VoiceAnalysis = {
        pitch: {
          average: 180 + Math.random() * 100, // Hz
          range: 50 + Math.random() * 100,
          stability: 0.7 + Math.random() * 0.3
        },
        tone: {
          warmth: 0.6 + Math.random() * 0.4,
          clarity: 0.7 + Math.random() * 0.3,
          energy: 0.5 + Math.random() * 0.5
        },
        characteristics: [
          'Clear articulation',
          'Moderate pace',
          'Professional tone',
          'Good vocal control'
        ],
        recommendations: [
          'Increase stability for more consistent results',
          'Consider using speaker boost for better similarity',
          'Adjust clarity settings for optimal output'
        ],
        quality: 0.8 + Math.random() * 0.2
      };

      setAnalysis(mockAnalysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(mockAnalysis);
      }
    } catch (error) {
      console.error('Voice analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 0.9) return 'Excellent';
    if (quality >= 0.8) return 'Very Good';
    if (quality >= 0.7) return 'Good';
    if (quality >= 0.6) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Voice Analysis</h3>
        </div>
        
        {audioBlob && (
          <button
            onClick={analyzeVoice}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Voice'}
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing voice characteristics...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Overall Quality */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Overall Quality</h4>
              <span className={`font-bold ${getQualityColor(analysis.quality)}`}>
                {getQualityLabel(analysis.quality)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${analysis.quality * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Math.round(analysis.quality * 100)}% quality score
            </div>
          </div>

          {/* Pitch Analysis */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-500" />
              Pitch Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(analysis.pitch.average)}Hz
                </div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(analysis.pitch.range)}Hz
                </div>
                <div className="text-xs text-gray-600">Range</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(analysis.pitch.stability * 100)}%
                </div>
                <div className="text-xs text-gray-600">Stability</div>
              </div>
            </div>
          </div>

          {/* Tone Characteristics */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-green-500" />
              Tone Characteristics
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warmth</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${analysis.tone.warmth * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(analysis.tone.warmth * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clarity</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${analysis.tone.clarity * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(analysis.tone.clarity * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Energy</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysis.tone.energy * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(analysis.tone.energy * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Voice Characteristics</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.characteristics.map((characteristic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {characteristic}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              Optimization Recommendations
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!audioBlob && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Upload or record audio to analyze voice characteristics</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAnalyzer;