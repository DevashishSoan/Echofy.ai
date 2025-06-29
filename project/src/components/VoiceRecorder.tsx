import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Copy, Download, Trash2, FileText } from 'lucide-react';

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

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);

  // Use refs to track component state for cleanup
  const isComponentMounted = useRef(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser capabilities on mount
  useEffect(() => {
    // Check clipboard API support
    setIsClipboardSupported(
      typeof navigator !== 'undefined' && 
      'clipboard' in navigator && 
      typeof navigator.clipboard.writeText === 'function'
    );

    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Initialize speech recognition with proper cleanup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Your browser doesn\'t support voice recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        if (!isComponentMounted.current) return;
        setIsRecording(true);
        setError('');
      };

      recognitionInstance.onend = () => {
        if (!isComponentMounted.current) return;
        setIsRecording(false);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        if (!isComponentMounted.current) return;

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Update final transcript ref to avoid race conditions
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        setText(prevText => {
          const baseText = prevText.replace(/\s*\[Speaking...\]$/, '');
          return finalTranscriptRef.current + (interimTranscript ? ' [Speaking...]' : '');
        });
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!isComponentMounted.current) return;
        
        setIsRecording(false);
        let errorMessage = '';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permission and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking closer to your microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please ensure your microphone is connected.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection.';
            break;
          case 'aborted':
            // Don't show error for intentional aborts
            return;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
      };

      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setError('Failed to initialize speech recognition. Please refresh the page and try again.');
    }

    // Cleanup function
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
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('Error cleaning up speech recognition:', error);
        }
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!recognition || !isComponentMounted.current) return;

    try {
      finalTranscriptRef.current = '';
      recognition.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (!recognition || !isComponentMounted.current) return;

    try {
      recognition.stop();
    } catch (error) {
      console.warn('Error stopping recognition:', error);
    }
  }, [recognition]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const copyToClipboard = useCallback(async () => {
    const cleanText = text.replace(/\s*\[Speaking...\]$/, '');
    
    if (!cleanText) return;

    try {
      if (isClipboardSupported) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = cleanText;
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
  }, [text, isClipboardSupported]);

  const downloadText = useCallback(() => {
    const cleanText = text.replace(/\s*\[Speaking...\]$/, '');
    
    if (!cleanText) return;

    try {
      const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echofy-transcript-${new Date().toISOString().split('T')[0]}.txt`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file. Please try again.');
    }
  }, [text]);

  const clearText = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
    setError('');
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    finalTranscriptRef.current = newText.replace(/\s*\[Speaking...\]$/, '');
  }, []);

  // Calculate word and character counts
  const cleanText = text.replace(/\s*\[Speaking...\]$/, '');
  const wordCount = cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;
  const charCount = cleanText.length;

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MicOff className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Browser Not Supported</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echofy.ai
              </h1>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm mt-1">Real-time Voice to Text Transcription</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Recording Button */}
        <div className="text-center mb-8">
          <button
            onClick={toggleRecording}
            disabled={!recognition}
            className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300 animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-300'
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-8 h-8 mr-2" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 mr-2" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            )}
          </button>
          
          <div className="mt-4">
            {isRecording ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording in progress...</span>
              </div>
            ) : (
              <span className="text-gray-600">Click to start recording</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Text Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Your transcribed text will appear here... Click the microphone button above to start recording."
              className="w-full h-96 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg leading-relaxed"
              style={{ minHeight: '384px' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <button
              onClick={copyToClipboard}
              disabled={!cleanText}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <Copy className="w-5 h-5" />
              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={downloadText}
              disabled={!cleanText}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={clearText}
              disabled={!text}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Words: <strong>{wordCount}</strong></span>
            </div>
            <div className="text-gray-600">
              <span className="text-sm">Characters: <strong>{charCount}</strong></span>
            </div>
            {!isClipboardSupported && (
              <div className="text-yellow-600 text-xs">
                ⚠️ Limited clipboard support
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-3">How to use Echofy.ai:</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Click the large microphone button to start recording your voice</li>
            <li>• Speak clearly and watch your words appear in real-time</li>
            <li>• Click anywhere in the text area to edit your transcription</li>
            <li>• Use Copy to clipboard or Download to save your text</li>
            <li>• Works best in Chrome, Edge, or Safari browsers</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default VoiceRecorder;