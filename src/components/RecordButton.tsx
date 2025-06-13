import React from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isSupported: boolean;
  status: 'ready' | 'listening' | 'processing' | 'error';
  onToggleRecording: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isSupported,
  status,
  onToggleRecording,
}) => {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onToggleRecording}
        disabled={!isSupported || status === 'error'}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full text-white transition-all transform hover:scale-105 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } ${!isSupported || status === 'error' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
        
        {isRecording && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </button>
      <span className="mt-2 text-sm font-medium">
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </span>
    </div>
  );
};

export default RecordButton;