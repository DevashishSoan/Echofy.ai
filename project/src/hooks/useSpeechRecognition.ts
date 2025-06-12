import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionResult {
  text: string;
  isRecording: boolean;
  isSupported: boolean;
  status: 'ready' | 'listening' | 'processing' | 'error';
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  resetText: () => void;
  setCustomText: (text: string) => void;
}

const useSpeechRecognition = (languageCode: string = 'en-US'): SpeechRecognitionResult => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'ready' | 'listening' | 'processing' | 'error'>('ready');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Check if browser supports Speech Recognition
  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!isSupported) return;

    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = languageCode;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setStatus('listening');
      setIsRecording(true);
    };

    recognitionInstance.onend = () => {
      setStatus('ready');
      setIsRecording(false);
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setText((prevText) => {
        const newText = prevText + finalTranscript;
        return interimTranscript ? `${newText} ${interimTranscript}` : newText;
      });
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setStatus('error');
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access to use this feature.');
      }
      
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.stop();
    };
  }, [isSupported, languageCode]);

  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setStatus('error');
      }
    }
  }, [recognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  }, [recognition, isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const resetText = useCallback(() => {
    setText('');
  }, []);

  const setCustomText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  return {
    text,
    isRecording,
    isSupported,
    status,
    startRecording,
    stopRecording,
    toggleRecording,
    resetText,
    setCustomText
  };
};

export default useSpeechRecognition;