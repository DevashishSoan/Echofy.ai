import React, { useState } from 'react';
import { Upload, Play, Download, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface BatchItem {
  id: string;
  type: 'text' | 'audio';
  content: string;
  file?: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string; // URL for generated audio or processed text
  error?: string;
}

interface BatchProcessorProps {
  mode: 'tts' | 'transcription';
  onProcess: (items: BatchItem[]) => Promise<void>;
  className?: string;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({
  mode,
  onProcess,
  className = ''
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const newItems: BatchItem[] = acceptedFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      type: mode === 'tts' ? 'text' : 'audio',
      content: file.name,
      file,
      status: 'pending'
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mode === 'tts' 
      ? { 'text/*': ['.txt', '.md'] }
      : { 'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg'] },
    maxFiles: 50
  });

  const addTextItem = () => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      status: 'pending'
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, content: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleProcess = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    
    // Update all items to processing status
    setItems(prev => prev.map(item => ({ ...item, status: 'processing' as const })));

    try {
      await onProcess(items);
      
      // Simulate processing completion
      setItems(prev => prev.map(item => ({ 
        ...item, 
        status: 'completed' as const,
        result: `processed-${item.id}.mp3` // Mock result
      })));
    } catch (error) {
      setItems(prev => prev.map(item => ({ 
        ...item, 
        status: 'error' as const,
        error: 'Processing failed'
      })));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = () => {
    const completedItems = items.filter(item => item.status === 'completed' && item.result);
    completedItems.forEach((item, index) => {
      setTimeout(() => {
        // In a real implementation, this would download the actual files
        console.log(`Downloading ${item.result}`);
      }, index * 500);
    });
  };

  const clearAll = () => {
    setItems([]);
  };

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const errorCount = items.filter(item => item.status === 'error').length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Batch {mode === 'tts' ? 'Text-to-Speech' : 'Transcription'}
          </h3>
          <p className="text-sm text-gray-600">
            Process multiple {mode === 'tts' ? 'texts' : 'audio files'} simultaneously
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {mode === 'tts' && (
            <button
              onClick={addTextItem}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Add Text
            </button>
          )}
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-6 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              Drag & drop {mode === 'tts' ? 'text files' : 'audio files'} here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              {mode === 'tts' 
                ? 'Supports TXT, MD files (max 50 files)'
                : 'Supports MP3, WAV, M4A, FLAC, OGG (max 50 files)'
              }
            </p>
          </div>
        )}
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">
              Items ({items.length})
            </h4>
            {completedCount > 0 && (
              <div className="text-sm text-gray-600">
                {completedCount} completed
                {errorCount > 0 && `, ${errorCount} failed`}
              </div>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 border rounded-lg ${getStatusColor(item.status)}`}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {item.type === 'text' && !item.file ? (
                    <textarea
                      value={item.content}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      placeholder={`Text ${index + 1}...`}
                      className="w-full h-16 px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={item.status === 'processing'}
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.file?.name || item.content}
                      </p>
                      {item.file && (
                        <p className="text-xs text-gray-500">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  )}
                  
                  {item.error && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={item.status === 'processing'}
                  className="p-1 text-gray-500 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {items.length} items ready for processing
          </div>
          
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Download className="h-4 w-4" />
                Download All ({completedCount})
              </button>
            )}
            
            <button
              onClick={handleProcess}
              disabled={isProcessing || items.every(item => !item.content.trim())}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Process All'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No items added yet</p>
          <p className="text-sm mt-1">
            Upload files or add text to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchProcessor;