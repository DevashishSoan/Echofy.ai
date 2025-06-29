import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Download, 
  Trash2, 
  FileText, 
  Play, 
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Volume2,
  RefreshCw,
  Save,
  Upload
} from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      prototype: SpeechRecognition;
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      prototype: SpeechRecognition;
      new(): SpeechRecognition;
    };
  }
}

interface TranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  speaker?: string;
  isFinal: boolean;
}

interface RecordingSession {
  id: string;
  startTime: number;
  endTime?: number;
  segments: TranscriptionSegment[];
  language: string;
  totalDuration: number;
}

const EnhancedVoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sessionRestarts, setSessionRestarts] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRestart, setAutoRestart] = useState(true);
  const [maxSessionDuration] = useState(4 * 60 * 1000); // 4 minutes to avoid 5-minute limit
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [enableSpeakerDetection, setEnableSpeakerDetection] = useState(false);
  const [enablePunctuation, setEnablePunctuation] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [maxRetries] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for cleanup and session management
  const isComponentMounted = useRef(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSegmentRef = useRef<string>('');

  // Browser compatibility check
  useEffect(() => {
    const checkCompatibility = () => {
      setIsClipboardSupported(
        typeof navigator !== 'undefined' && 
        'clipboard' in navigator && 
        typeof navigator.clipboard.writeText === 'function'
      );

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Your browser doesn\'t support voice recognition. Please use Chrome, Edge, or Safari.');
        return false;
      }

      // Check for additional browser features
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('firefox')) {
        setError('Firefox has limited speech recognition support. For best experience, use Chrome or Edge.');
      }

      return true;
    };

    checkCompatibility();

    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = currentLanguage;

      recognitionInstance.onstart = () => {
        if (!isComponentMounted.current) return;
        setIsRecording(true);
        setIsPaused(false);
        setError('');
        setRetryAttempts(0);
        
        // Start session timer for automatic restart
        if (autoRestart) {
          sessionTimerRef.current = setTimeout(() => {
            if (isComponentMounted.current && isRecording) {
              restartSession();
            }
          }, maxSessionDuration);
        }
      };

      recognitionInstance.onend = () => {
        if (!isComponentMounted.current) return;
        setIsRecording(false);
        
        // Clear session timer
        if (sessionTimerRef.current) {
          clearTimeout(sessionTimerRef.current);
          sessionTimerRef.current = null;
        }

        // Auto-restart if needed and not manually stopped
        if (autoRestart && !isPaused && retryAttempts < maxRetries) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isComponentMounted.current) {
              startRecording();
            }
          }, 1000);
        }
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        if (!isComponentMounted.current) return;

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;

          if (result.isFinal) {
            if (confidence >= confidenceThreshold) {
              finalTranscript += transcript;
            }
          } else {
            interimTranscript += transcript;
          }
        }

        // Process final transcript
        if (finalTranscript) {
          const newSegment: TranscriptionSegment = {
            id: Date.now().toString() + Math.random(),
            text: enablePunctuation ? addPunctuation(finalTranscript) : finalTranscript,
            timestamp: Date.now(),
            confidence: event.results[event.resultIndex]?.[0]?.confidence || 0.8,
            speaker: enableSpeakerDetection ? detectSpeaker(finalTranscript) : undefined,
            isFinal: true
          };

          setSegments(prev => [...prev, newSegment]);
          currentSegmentRef.current = '';
        }

        // Update interim results
        if (interimTranscript) {
          currentSegmentRef.current = interimTranscript;
          // Trigger re-render for interim results
          setIsProcessing(prev => !prev);
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!isComponentMounted.current) return;
        
        setIsRecording(false);
        
        let errorMessage = '';
        let shouldRetry = false;
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permission and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking closer to your microphone.';
            shouldRetry = true;
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please ensure your microphone is connected.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection.';
            shouldRetry = true;
            break;
          case 'aborted':
            return; // Don't show error for intentional aborts
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
            shouldRetry = true;
        }
        
        setError(errorMessage);

        // Implement retry logic
        if (shouldRetry && retryAttempts < maxRetries && autoRestart) {
          setRetryAttempts(prev => prev + 1);
          restartTimeoutRef.current = setTimeout(() => {
            if (isComponentMounted.current) {
              startRecording();
            }
          }, 2000 * (retryAttempts + 1)); // Exponential backoff
        }
      };

      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setError('Failed to initialize speech recognition. Please refresh the page and try again.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('Error aborting speech recognition:', error);
        }
        recognitionRef.current = null;
      }
    };
  }, [currentLanguage, autoRestart, maxSessionDuration, confidenceThreshold, enablePunctuation, enableSpeakerDetection, retryAttempts, maxRetries, isRecording, isPaused]);

  // Duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      [sessionTimerRef, durationTimerRef, copyTimeoutRef, restartTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, []);

  // Helper functions
  const addPunctuation = (text: string): string => {
    // Simple punctuation rules - in production, use AI-based punctuation
    let result = text.trim();
    
    // Add periods at natural pauses
    result = result.replace(/\b(and then|so|but|however|therefore)\b/gi, '. $1');
    
    // Add commas for natural pauses
    result = result.replace(/\b(well|um|uh|you know)\b/gi, ', $1,');
    
    // Capitalize first letter and after periods
    result = result.charAt(0).toUpperCase() + result.slice(1);
    result = result.replace(/\.\s+([a-z])/g, '. $1'.toUpperCase());
    
    // Add final punctuation if missing
    if (!/[.!?]$/.test(result)) {
      result += '.';
    }
    
    return result;
  };

  const detectSpeaker = (text: string): string => {
    // Simple speaker detection - in production, use voice biometrics
    const textLength = text.length;
    const wordCount = text.split(' ').length;
    
    // Mock speaker detection based on text characteristics
    if (wordCount > 10 && textLength > 50) {
      return 'Speaker A';
    } else {
      return 'Speaker B';
    }
  };

  const restartSession = useCallback(() => {
    if (!recognition || !isComponentMounted.current) return;

    try {
      setSessionRestarts(prev => prev + 1);
      recognition.stop();
      
      setTimeout(() => {
        if (isComponentMounted.current && recognition) {
          recognition.start();
        }
      }, 500);
    } catch (error) {
      console.error('Failed to restart session:', error);
      setError('Failed to restart recording session. Please try again.');
    }
  }, [recognition]);

  const startRecording = useCallback(() => {
    if (!recognition || !isComponentMounted.current) return;

    try {
      // Create new session
      const newSession: RecordingSession = {
        id: Date.now().toString(),
        startTime: Date.now(),
        segments: [],
        language: currentLanguage,
        totalDuration: 0
      };
      
      setCurrentSession(newSession);
      setRecordingDuration(0);
      setSessionRestarts(0);
      setRetryAttempts(0);
      currentSegmentRef.current = '';
      
      recognition.lang = currentLanguage;
      recognition.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  }, [recognition, currentLanguage]);

  const stopRecording = useCallback(() => {
    if (!recognition || !isComponentMounted.current) return;

    try {
      setIsPaused(true);
      recognition.stop();
      
      // Clear all timers
      [sessionTimerRef, durationTimerRef, restartTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });

      // Update current session
      if (currentSession) {
        const updatedSession: RecordingSession = {
          ...currentSession,
          endTime: Date.now(),
          segments: segments,
          totalDuration: recordingDuration
        };
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      console.warn('Error stopping recognition:', error);
    }
  }, [recognition, currentSession, segments, recordingDuration]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const copyToClipboard = useCallback(async () => {
    const fullText = segments.map(segment => segment.text).join(' ') + 
                    (currentSegmentRef.current ? ' ' + currentSegmentRef.current : '');
    
    if (!fullText.trim()) return;

    try {
      if (isClipboardSupported) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          throw new Error('Copy command failed');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      if (isComponentMounted.current) {
        setCopySuccess(true);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          if (isComponentMounted.current) {
            setCopySuccess(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      setError('Failed to copy text to clipboard. Please select and copy manually.');
    }
  }, [segments, isClipboardSupported]);

  const downloadTranscript = useCallback((format: 'txt' | 'srt' | 'vtt' | 'json' = 'txt') => {
    const fullText = segments.map(segment => segment.text).join(' ');
    
    if (!fullText.trim()) return;

    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    switch (format) {
      case 'srt':
        content = segments.map((segment, index) => {
          const startTime = new Date(segment.timestamp).toISOString().substr(11, 12);
          const endTime = new Date(segment.timestamp + 3000).toISOString().substr(11, 12); // Assume 3s duration
          return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
        }).join('\n');
        mimeType = 'text/srt';
        extension = 'srt';
        break;
      
      case 'vtt':
        content = 'WEBVTT\n\n' + segments.map((segment, index) => {
          const startTime = new Date(segment.timestamp).toISOString().substr(11, 12);
          const endTime = new Date(segment.timestamp + 3000).toISOString().substr(11, 12);
          return `${startTime} --> ${endTime}\n${segment.text}\n`;
        }).join('\n');
        mimeType = 'text/vtt';
        extension = 'vtt';
        break;
      
      case 'json':
        content = JSON.stringify({
          session: currentSession,
          segments: segments,
          metadata: {
            language: currentLanguage,
            duration: recordingDuration,
            sessionRestarts: sessionRestarts,
            exportedAt: new Date().toISOString()
          }
        }, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      
      default:
        content = fullText;
    }

    try {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echofy-transcript-${new Date().toISOString().split('T')[0]}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file. Please try again.');
    }
  }, [segments, currentSession, currentLanguage, recordingDuration, sessionRestarts]);

  const clearTranscript = useCallback(() => {
    setSegments([]);
    setCurrentSession(null);
    setRecordingDuration(0);
    setSessionRestarts(0);
    setRetryAttempts(0);
    currentSegmentRef.current = '';
    setError('');
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getFullText = () => {
    return segments.map(segment => segment.text).join(' ') + 
           (currentSegmentRef.current ? ' ' + currentSegmentRef.current : '');
  };

  const wordCount = getFullText().trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = getFullText().length;

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MicOff className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Browser Not Supported</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500">
            <p>Supported browsers:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Voice Transcription</h1>
          <p className="text-gray-600 mt-1">Professional speech-to-text with advanced features</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
          </button>
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="es-ES">🇪🇸 Spanish</option>
            <option value="fr-FR">🇫🇷 French</option>
            <option value="de-DE">🇩🇪 German</option>
            <option value="it-IT">🇮🇹 Italian</option>
            <option value="pt-PT">🇵🇹 Portuguese</option>
            <option value="ja-JP">🇯🇵 Japanese</option>
            <option value="ko-KR">🇰🇷 Korean</option>
            <option value="zh-CN">🇨🇳 Chinese</option>
          </select>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={autoRestart}
                  onChange={(e) => setAutoRestart(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto-restart sessions</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Automatically restart every 4 minutes</p>
            </div>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enablePunctuation}
                  onChange={(e) => setEnablePunctuation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Smart punctuation</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Automatically add punctuation</p>
            </div>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enableSpeakerDetection}
                  onChange={(e) => setEnableSpeakerDetection(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Speaker detection</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Identify different speakers</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence threshold: {confidenceThreshold}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum confidence for transcription</p>
            </div>
          </div>
        </div>
      )}

      {/* Recording Status */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleRecording}
              disabled={!recognition}
              className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
              )}
            </button>
            
            <div>
              <div className="flex items-center space-x-2">
                {isRecording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <span className={`font-medium ${isRecording ? 'text-red-600' : 'text-gray-600'}`}>
                  {isRecording ? 'Recording...' : isPaused ? 'Paused' : 'Ready to record'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Duration: {formatDuration(recordingDuration)}
                {sessionRestarts > 0 && ` • Restarts: ${sessionRestarts}`}
                {retryAttempts > 0 && ` • Retries: ${retryAttempts}/${maxRetries}`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {autoRestart && isRecording && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" />
                <span>Auto-restart enabled</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {retryAttempts > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Retry attempt {retryAttempts} of {maxRetries}
                  </p>
                )}
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {isRecording && autoRestart && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Session progress</span>
              <span>{Math.round((recordingDuration / (maxSessionDuration / 1000)) * 100)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((recordingDuration / (maxSessionDuration / 1000)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transcription Display */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Transcription</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>{segments.length} segments</span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
          {segments.length === 0 && !currentSegmentRef.current ? (
            <p className="text-gray-500 text-center py-8">
              Start recording to see your transcription appear here...
            </p>
          ) : (
            <div className="space-y-3">
              {segments.map((segment) => (
                <div key={segment.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {enableSpeakerDetection && segment.speaker && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">{segment.speaker}</span>
                        </div>
                      )}
                      <p className="text-gray-900 leading-relaxed">{segment.text}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(segment.timestamp).toLocaleTimeString()}</span>
                        <span>Confidence: {Math.round(segment.confidence * 100)}%</span>
                        {segment.isFinal && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Interim results */}
              {currentSegmentRef.current && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Speaking...</span>
                  </div>
                  <p className="text-gray-700 italic">{currentSegmentRef.current}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={copyToClipboard}
            disabled={segments.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <Copy className="w-5 h-5" />
            <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => downloadTranscript('txt')}
              disabled={segments.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>

          <button
            onClick={() => downloadTranscript('srt')}
            disabled={segments.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            <span>SRT</span>
          </button>

          <button
            onClick={() => downloadTranscript('json')}
            disabled={segments.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <Save className="w-5 h-5" />
            <span>JSON</span>
          </button>

          <button
            onClick={clearTranscript}
            disabled={segments.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="flex items-center justify-center space-x-8 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{wordCount}</div>
            <div className="text-sm text-gray-500">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{charCount}</div>
            <div className="text-sm text-gray-500">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{segments.length}</div>
            <div className="text-sm text-gray-500">Segments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatDuration(recordingDuration)}</div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
        </div>
      </div>

      {/* Browser Compatibility Notice */}
      {!isClipboardSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Limited Browser Support</p>
              <p className="text-yellow-700 text-sm">Some features may not work in your current browser. For the best experience, use Chrome or Edge.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceRecorder;