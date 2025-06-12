import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Header from '../components/Header';
import RecordButton from '../components/RecordButton';
import TextEditor from '../components/TextEditor';
import ActionButtons from '../components/ActionButtons';
import ErrorMessage from '../components/ErrorMessage';
import LanguageSelector from '../components/LanguageSelector';
import LanguageDetector from '../components/LanguageDetector';
import TranslationPanel from '../components/TranslationPanel';
import SpeakerIdentification from '../components/SpeakerIdentification';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useLanguageSelection } from '../hooks/useLanguageSelection';
import { useAudioProcessing } from '../hooks/useAudioProcessing';
import { countWords, countCharacters } from '../utils/textUtils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const RecorderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedLanguage, changeLanguage } = useLanguageSelection();
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<Blob | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<any>(null);
  const [speakerSegments, setSpeakerSegments] = useState<any[]>([]);
  
  const {
    text,
    isRecording,
    isSupported,
    status,
    toggleRecording,
    resetText,
    setCustomText
  } = useSpeechRecognition(selectedLanguage.code);

  const { extractAudioFeatures, processAudio } = useAudioProcessing();

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setWordCount(countWords(text));
    setCharCount(countCharacters(text));
  }, [text]);

  const onDrop = async (acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0];
    if (audioFile) {
      setUploadedAudio(audioFile);
      
      // Extract audio features
      const features = await extractAudioFeatures(audioFile);
      setAudioFeatures(features);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const handleLanguageDetected = (language: { code: string; name: string }) => {
    changeLanguage(language);
  };

  const handleSaveTranscription = async () => {
    if (!user || !text.trim()) return;

    try {
      const transcriptionData = {
        user_id: user.id,
        content: text,
        word_count: wordCount,
        language: selectedLanguage.code,
        title: `Transcription ${new Date().toLocaleDateString()}`,
        timestamps: speakerSegments.length > 0 ? JSON.stringify(speakerSegments) : null,
      };

      const { error } = await supabase
        .from('transcriptions')
        .insert([transcriptionData]);

      if (error) throw error;
      alert('Transcription saved successfully!');
    } catch (error) {
      console.error('Error saving transcription:', error);
      alert('Failed to save transcription. Please try again.');
    }
  };

  const handleSpeakersIdentified = (segments: any[]) => {
    setSpeakerSegments(segments);
    
    // Update text with speaker labels if segments are available
    if (segments.length > 0) {
      const formattedText = segments
        .map(segment => `${segment.speakerName}: ${segment.text}`)
        .join('\n\n');
      setCustomText(formattedText);
    }
  };

  const exportWithTimestamps = () => {
    if (speakerSegments.length === 0) {
      alert('No speaker segments available. Please identify speakers first.');
      return;
    }

    const content = speakerSegments
      .map(segment => 
        `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}] ${segment.speakerName}: ${segment.text}`
      )
      .join('\n\n');

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription-with-timestamps-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

        <Header />
        
        <div className="mt-8 space-y-6">
          <ErrorMessage isSupported={isSupported} />
          
          {/* Main Recording Interface */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Language and Recording Controls */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center space-y-4">
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={changeLanguage}
                  />
                  
                  <RecordButton
                    isRecording={isRecording}
                    isSupported={isSupported}
                    status={status}
                    onToggleRecording={toggleRecording}
                  />
                  
                  <p className="text-sm text-gray-600">
                    {status === 'ready' && 'Ready to record'}
                    {status === 'listening' && 'Listening...'}
                    {status === 'processing' && 'Processing...'}
                    {status === 'error' && 'Error occurred'}
                  </p>
                </div>
              </div>

              {/* Audio Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Or Upload Audio File</h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the audio file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-1">
                        Drag & drop an audio file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports MP3, WAV, M4A, FLAC, OGG (max 100MB)
                      </p>
                    </div>
                  )}
                </div>

                {audioFeatures && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Audio Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>Duration: {Math.round(audioFeatures.duration)}s</div>
                      <div>Sample Rate: {audioFeatures.sampleRate}Hz</div>
                      <div>Channels: {audioFeatures.channels}</div>
                      <div>Format: {audioFeatures.format}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Editor */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Transcription</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced
                    </button>
                    {speakerSegments.length > 0 && (
                      <button
                        onClick={exportWithTimestamps}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <Download className="h-4 w-4" />
                        Export with Timestamps
                      </button>
                    )}
                  </div>
                </div>
                
                <TextEditor
                  text={text}
                  setText={setCustomText}
                  isRecording={isRecording}
                />
                
                <div className="mt-4">
                  <ActionButtons
                    text={text}
                    onClear={resetText}
                    onSave={handleSaveTranscription}
                    wordCount={wordCount}
                    charCount={charCount}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Language Detection */}
              <LanguageDetector
                text={text}
                onLanguageDetected={handleLanguageDetected}
                autoDetect={true}
              />

              {/* Advanced Features */}
              {showAdvancedFeatures && (
                <>
                  {/* Speaker Identification */}
                  <SpeakerIdentification
                    audioBlob={uploadedAudio}
                    onSegmentsIdentified={handleSpeakersIdentified}
                  />

                  {/* Translation Panel */}
                  <TranslationPanel
                    sourceText={text}
                    sourceLanguage={selectedLanguage.code}
                  />
                </>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters:</span>
                    <span className="font-medium">{charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{selectedLanguage.name}</span>
                  </div>
                  {speakerSegments.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speakers:</span>
                      <span className="font-medium">
                        {new Set(speakerSegments.map(s => s.speakerId)).size}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecorderPage;