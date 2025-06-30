import React, { useState } from 'react';
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AudioSample {
  id: string;
  name: string;
  duration: number;
  file: File;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
}

interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  samples: number;
  status: 'training' | 'ready' | 'error';
  createdAt: Date;
}

const VoiceCloningLab: React.FC = () => {
  const [audioSamples, setAudioSamples] = useState<AudioSample[]>([]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
          const newSample: AudioSample = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            duration: audio.duration,
            file,
            status: 'uploaded'
          };
          setAudioSamples(prev => [...prev, newSample]);
        };
      }
    });
  };

  const removeSample = (id: string) => {
    setAudioSamples(prev => prev.filter(sample => sample.id !== id));
  };

  const startTraining = async () => {
    if (!voiceName || audioSamples.length === 0) return;

    setIsTraining(true);
    
    // Simulate training process
    const newVoice: ClonedVoice = {
      id: Date.now().toString(),
      name: voiceName,
      description: voiceDescription,
      samples: audioSamples.length,
      status: 'training',
      createdAt: new Date()
    };

    setClonedVoices(prev => [...prev, newVoice]);
    
    // Simulate training completion after 5 seconds
    setTimeout(() => {
      setClonedVoices(prev => 
        prev.map(voice => 
          voice.id === newVoice.id 
            ? { ...voice, status: 'ready' as const }
            : voice
        )
      );
      setIsTraining(false);
      setVoiceName('');
      setVoiceDescription('');
      setAudioSamples([]);
    }, 5000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
      case 'training':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voice Cloning Lab</h1>
        <p className="text-gray-600 mt-1">Create custom voices from audio samples</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Voice Cloning Guidelines</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Upload 3-10 high-quality audio samples (each 10-30 seconds)</li>
              <li>• Use clear, noise-free recordings with consistent audio quality</li>
              <li>• Ensure you have permission to clone the voice</li>
              <li>• Training typically takes 5-15 minutes depending on sample quality</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio Samples</h3>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop audio files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP3, WAV, M4A files up to 10MB each
                </p>
              </label>
            </div>

            {/* Recording Option */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Or record directly:</span>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRecording
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audio Samples List */}
          {audioSamples.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audio Samples ({audioSamples.length})
              </h3>
              <div className="space-y-3">
                {audioSamples.map((sample) => (
                  <div key={sample.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(sample.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sample.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {formatDuration(sample.duration)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeSample(sample.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Configuration */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Name *
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Enter a name for your cloned voice"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="Describe the voice characteristics..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <button
              onClick={startTraining}
              disabled={!voiceName || audioSamples.length === 0 || isTraining}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isTraining ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Training Voice...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Start Training</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Cloned Voices */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Cloned Voices</h3>
            
            {clonedVoices.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No cloned voices yet</p>
                <p className="text-sm text-gray-400">
                  Upload audio samples and start training to create your first cloned voice
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clonedVoices.map((voice) => (
                  <div key={voice.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{voice.name}</h4>
                          {getStatusIcon(voice.status)}
                        </div>
                        {voice.description && (
                          <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{voice.samples} samples</span>
                          <span>{voice.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {voice.status === 'ready' && (
                          <>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {voice.status === 'training' && (
                      <div className="mt-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Training in progress...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Tips */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use high-quality, noise-free audio recordings</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include varied speech patterns and emotions</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Maintain consistent audio quality across samples</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Avoid background music or multiple speakers</span>
              </div>
            </div>
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

export default VoiceCloningLab;