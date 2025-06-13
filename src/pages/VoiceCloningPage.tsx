import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Mic, Play, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useElevenLabs } from '../hooks/useElevenLabs';
import { VoiceCloneRequest } from '../types/elevenlabs';
import AudioPlayer from '../components/AudioPlayer';

interface AudioFile {
  file: File;
  url: string;
  duration?: number;
}

const VoiceCloningPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneResult, setCloneResult] = useState<any>(null);

  const { cloneVoice, error, clearError } = useElevenLabs(apiKey);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAudioFiles = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setAudioFiles(prev => [...prev, ...newAudioFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    maxFiles: 25,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setAudioFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleClone = async () => {
    if (!voiceName.trim() || audioFiles.length === 0) return;

    setIsCloning(true);
    setCloneResult(null);

    try {
      const request: VoiceCloneRequest = {
        name: voiceName,
        description: voiceDescription,
        files: audioFiles.map(af => af.file),
        labels: {
          language: 'en', // You might want to make this configurable
        }
      };

      const result = await cloneVoice(request);
      if (result) {
        setCloneResult(result);
        // Clear form
        setVoiceName('');
        setVoiceDescription('');
        setAudioFiles([]);
      }
    } catch (err) {
      console.error('Voice cloning failed:', err);
    } finally {
      setIsCloning(false);
    }
  };

  const requirements = [
    'Upload 1-25 audio samples',
    'Each file should be under 10MB',
    'Supported formats: MP3, WAV, M4A, FLAC, OGG',
    'Clear, high-quality audio works best',
    'Minimum 30 seconds of total audio',
    'Single speaker only (no background voices)',
    'Consistent audio quality across samples'
  ];

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
              <Mic className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">ElevenLabs API Key Required</h2>
              <p className="text-gray-600 mt-2">
                Enter your ElevenLabs API key to access voice cloning features
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Don't have an API key?</p>
                <a
                  href="https://elevenlabs.io/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:text-purple-600"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Voice Cloning Lab</h1>
          <p className="text-gray-600">
            Create custom AI voices from audio samples
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {cloneResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700">
                Voice "{cloneResult.name}" cloned successfully! You can now use it in the Text-to-Speech studio.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Name *
                  </label>
                  <input
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Enter a name for your voice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    placeholder="Describe the voice characteristics..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* Audio Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Audio Samples</h3>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-purple-600">Drop the audio files here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop audio files here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports MP3, WAV, M4A, FLAC, OGG (max 10MB each)
                    </p>
                  </div>
                )}
              </div>

              {/* Uploaded Files */}
              {audioFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-800">
                    Uploaded Files ({audioFiles.length}/25)
                  </h4>
                  {audioFiles.map((audioFile, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {audioFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(audioFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <AudioPlayer
                        audioUrl={audioFile.url}
                        className="flex-1 max-w-xs"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Clone Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleClone}
                  disabled={!voiceName.trim() || audioFiles.length === 0 || isCloning}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="h-5 w-5" />
                  {isCloning ? 'Cloning Voice...' : 'Clone Voice'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Use samples with different emotions and tones</li>
                <li>• Ensure consistent audio quality</li>
                <li>• Remove background noise if possible</li>
                <li>• Include varied sentence structures</li>
                <li>• Longer samples generally produce better results</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/text-to-speech')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Play className="h-4 w-4" />
                  Text-to-Speech
                </button>
                <button
                  onClick={() => navigate('/library')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  <Mic className="h-4 w-4" />
                  Voice Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCloningPage;