import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioWaveformProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  onTimeUpdate,
  onDurationChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);

  useEffect(() => {
    if (audioUrl) {
      loadAudioData();
    }
  }, [audioUrl]);

  const loadAudioData = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of bars in waveform
      const blockSize = Math.floor(channelData.length / samples);
      const filteredData = [];
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      setAudioData(filteredData);
      setDuration(audioBuffer.duration);
      if (onDurationChange) onDurationChange(audioBuffer.duration);
    } catch (error) {
      console.error('Error loading audio data:', error);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || audioData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / audioData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    audioData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Color bars based on playback progress
      ctx.fillStyle = index / audioData.length <= progress ? '#3B82F6' : '#E5E7EB';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  useEffect(() => {
    drawWaveform();
  }, [audioData, currentTime]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    if (onTimeUpdate) onTimeUpdate(audio.currentTime);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / canvas.width;
    const newTime = clickProgress * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio) {
            setDuration(audio.duration);
            if (onDurationChange) onDurationChange(audio.duration);
          }
        }}
      />
      
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={togglePlayback}
          className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        <button
          onClick={restart}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-20 cursor-pointer border border-gray-200 rounded"
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default AudioWaveform;