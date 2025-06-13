import { useState, useCallback } from 'react';

interface AudioProcessingOptions {
  noiseReduction?: boolean;
  volumeNormalization?: boolean;
  speedAdjustment?: number;
  pitchAdjustment?: number;
}

interface ProcessedAudio {
  originalBlob: Blob;
  processedBlob: Blob;
  duration: number;
  sampleRate: number;
  channels: number;
}

interface SpeakerSegment {
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

interface AudioProcessingHook {
  isProcessing: boolean;
  processAudio: (audioBlob: Blob, options?: AudioProcessingOptions) => Promise<ProcessedAudio | null>;
  identifySpeakers: (audioBlob: Blob) => Promise<SpeakerSegment[]>;
  extractAudioFeatures: (audioBlob: Blob) => Promise<AudioFeatures | null>;
  generateSubtitles: (segments: SpeakerSegment[], format: 'srt' | 'vtt') => string;
}

interface AudioFeatures {
  duration: number;
  sampleRate: number;
  channels: number;
  bitRate: number;
  format: string;
  loudness: number;
  speechRatio: number;
  silenceRatio: number;
}

export const useAudioProcessing = (): AudioProcessingHook => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAudio = useCallback(async (
    audioBlob: Blob, 
    options: AudioProcessingOptions = {}
  ): Promise<ProcessedAudio | null> => {
    setIsProcessing(true);
    
    try {
      // Create audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Apply processing options
      let processedBuffer = audioBuffer;

      if (options.noiseReduction) {
        processedBuffer = await applyNoiseReduction(processedBuffer, audioContext);
      }

      if (options.volumeNormalization) {
        processedBuffer = await normalizeVolume(processedBuffer, audioContext);
      }

      if (options.speedAdjustment && options.speedAdjustment !== 1) {
        processedBuffer = await adjustSpeed(processedBuffer, audioContext, options.speedAdjustment);
      }

      // Convert back to blob
      const processedBlob = await audioBufferToBlob(processedBuffer, audioContext);

      return {
        originalBlob: audioBlob,
        processedBlob,
        duration: processedBuffer.duration,
        sampleRate: processedBuffer.sampleRate,
        channels: processedBuffer.numberOfChannels,
      };
    } catch (error) {
      console.error('Audio processing failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
      setIsProcessing(false);
    }
  }, []);

  const identifySpeakers = useCallback(async (audioBlob: Blob): Promise<SpeakerSegment[]> => {
    setIsProcessing(true);
    
    try {
      // Simulate speaker identification processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock speaker segments
      const segments: SpeakerSegment[] = [
        {
          speakerId: 'speaker_1',
          speakerName: 'Speaker 1',
          startTime: 0,
          endTime: 15.5,
          text: 'Hello, welcome to our meeting today. I\'d like to start by discussing the quarterly results.',
          confidence: 0.92
        },
        {
          speakerId: 'speaker_2',
          speakerName: 'Speaker 2',
          startTime: 15.5,
          endTime: 28.3,
          text: 'Thank you for having me. I\'m excited to share the progress we\'ve made this quarter.',
          confidence: 0.88
        },
        {
          speakerId: 'speaker_1',
          speakerName: 'Speaker 1',
          startTime: 28.3,
          endTime: 42.1,
          text: 'That sounds great. Could you walk us through the key metrics and achievements?',
          confidence: 0.95
        }
      ];

      return segments;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const extractAudioFeatures = useCallback(async (audioBlob: Blob): Promise<AudioFeatures | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate basic features
      const channelData = audioBuffer.getChannelData(0);
      let sum = 0;
      let silentSamples = 0;
      const threshold = 0.01;

      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample;
        if (sample < threshold) {
          silentSamples++;
        }
      }

      const averageAmplitude = sum / channelData.length;
      const silenceRatio = silentSamples / channelData.length;
      const speechRatio = 1 - silenceRatio;

      return {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        bitRate: audioBlob.size * 8 / audioBuffer.duration,
        format: audioBlob.type,
        loudness: averageAmplitude,
        speechRatio,
        silenceRatio,
      };
    } catch (error) {
      console.error('Feature extraction failed:', error);
      return null;
    }
  }, []);

  const generateSubtitles = useCallback((segments: SpeakerSegment[], format: 'srt' | 'vtt'): string => {
    if (format === 'srt') {
      return segments.map((segment, index) => {
        const startTime = formatSRTTime(segment.startTime);
        const endTime = formatSRTTime(segment.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.speakerName}: ${segment.text}\n`;
      }).join('\n');
    } else {
      const header = 'WEBVTT\n\n';
      const content = segments.map(segment => {
        const startTime = formatVTTTime(segment.startTime);
        const endTime = formatVTTTime(segment.endTime);
        return `${startTime} --> ${endTime}\n<v ${segment.speakerName}>${segment.text}\n`;
      }).join('\n');
      return header + content;
    }
  }, []);

  return {
    isProcessing,
    processAudio,
    identifySpeakers,
    extractAudioFeatures,
    generateSubtitles,
  };
};

// Helper functions
const applyNoiseReduction = async (audioBuffer: AudioBuffer, audioContext: AudioContext): Promise<AudioBuffer> => {
  // Simple noise gate implementation
  const outputBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    
    const threshold = 0.02;
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = Math.abs(inputData[i]) > threshold ? inputData[i] : 0;
    }
  }

  return outputBuffer;
};

const normalizeVolume = async (audioBuffer: AudioBuffer, audioContext: AudioContext): Promise<AudioBuffer> => {
  const outputBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    
    // Find peak
    let peak = 0;
    for (let i = 0; i < inputData.length; i++) {
      peak = Math.max(peak, Math.abs(inputData[i]));
    }
    
    // Normalize to 0.8 to prevent clipping
    const gain = peak > 0 ? 0.8 / peak : 1;
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * gain;
    }
  }

  return outputBuffer;
};

const adjustSpeed = async (audioBuffer: AudioBuffer, audioContext: AudioContext, speed: number): Promise<AudioBuffer> => {
  const newLength = Math.floor(audioBuffer.length / speed);
  const outputBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    newLength,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    
    for (let i = 0; i < newLength; i++) {
      const sourceIndex = Math.floor(i * speed);
      outputData[i] = sourceIndex < inputData.length ? inputData[sourceIndex] : 0;
    }
  }

  return outputBuffer;
};

const audioBufferToBlob = async (audioBuffer: AudioBuffer, audioContext: AudioContext): Promise<Blob> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  
  // Convert audio data
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i];
      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
};

const formatSRTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
};

const formatVTTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};