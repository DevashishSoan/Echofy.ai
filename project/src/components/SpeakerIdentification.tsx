import React, { useState, useEffect } from 'react';
import { Users, Play, Download, Edit3, Palette } from 'lucide-react';
import { useAudioProcessing } from '../hooks/useAudioProcessing';

interface SpeakerIdentificationProps {
  audioBlob: Blob | null;
  onSegmentsIdentified?: (segments: any[]) => void;
  className?: string;
}

const SpeakerIdentification: React.FC<SpeakerIdentificationProps> = ({
  audioBlob,
  onSegmentsIdentified,
  className = ''
}) => {
  const [segments, setSegments] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  
  const { identifySpeakers, generateSubtitles } = useAudioProcessing();

  const speakerColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
  ];

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    try {
      const identifiedSegments = await identifySpeakers(audioBlob);
      setSegments(identifiedSegments);
      if (onSegmentsIdentified) {
        onSegmentsIdentified(identifiedSegments);
      }
    } catch (error) {
      console.error('Speaker identification failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditSpeaker = (segmentId: string, currentName: string) => {
    setEditingSegment(segmentId);
    setEditedName(currentName);
  };

  const saveSpeakerName = (segmentId: string) => {
    setSegments(prev => prev.map(segment => 
      segment.speakerId === segmentId 
        ? { ...segment, speakerName: editedName }
        : segment
    ));
    setEditingSegment(null);
    setEditedName('');
  };

  const downloadSubtitles = (format: 'srt' | 'vtt') => {
    const subtitles = generateSubtitles(segments, format);
    const element = document.createElement('a');
    const file = new Blob([subtitles], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `subtitles-${Date.now()}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSpeakerColor = (speakerId: string): string => {
    const index = segments.findIndex(s => s.speakerId === speakerId);
    return speakerColors[index % speakerColors.length];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-800">Speaker Identification</h3>
        </div>
        
        {audioBlob && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Users className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Identify Speakers'}
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing audio for speaker identification...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {segments.length > 0 && !isAnalyzing && (
        <div className="space-y-4">
          {/* Speaker Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Identified Speakers</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(segments.map(s => s.speakerId))).map(speakerId => {
                const speaker = segments.find(s => s.speakerId === speakerId);
                const speakerSegments = segments.filter(s => s.speakerId === speakerId);
                const totalDuration = speakerSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
                
                return (
                  <div
                    key={speakerId}
                    className={`px-3 py-2 rounded-lg border ${getSpeakerColor(speakerId)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{speaker?.speakerName}</span>
                      <button
                        onClick={() => handleEditSpeaker(speakerId, speaker?.speakerName || '')}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-xs opacity-75">
                      {speakerSegments.length} segments • {formatTime(totalDuration)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadSubtitles('srt')}
              className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <Download className="h-4 w-4" />
              Export SRT
            </button>
            <button
              onClick={() => downloadSubtitles('vtt')}
              className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            >
              <Download className="h-4 w-4" />
              Export VTT
            </button>
          </div>

          {/* Segments Timeline */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-gray-800">Speech Segments</h4>
            {segments.map((segment, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSpeakerColor(segment.speakerId)} border-opacity-50`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {editingSegment === segment.speakerId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                          onKeyPress={(e) => e.key === 'Enter' && saveSpeakerName(segment.speakerId)}
                        />
                        <button
                          onClick={() => saveSpeakerName(segment.speakerId)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{segment.speakerName}</span>
                        <button
                          onClick={() => handleEditSpeaker(segment.speakerId, segment.speakerName)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{formatTime(segment.startTime)} - {formatTime(segment.endTime)}</span>
                    <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                      {Math.round(segment.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm">{segment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!audioBlob && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Upload or record audio to identify speakers</p>
        </div>
      )}
    </div>
  );
};

export default SpeakerIdentification;