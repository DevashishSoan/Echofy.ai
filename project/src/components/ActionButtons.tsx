import React from 'react';
import { Clipboard, Download, Trash2, Save } from 'lucide-react';

interface ActionButtonsProps {
  text: string;
  onClear: () => void;
  onSave: () => void;
  wordCount: number;
  charCount: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  text,
  onClear,
  onSave,
  wordCount,
  charCount,
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (err) {
      alert('Failed to copy text. Please try again.');
    }
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `echofy-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all text?')) {
      onClear();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          disabled={!text}
          className={`flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
            !text ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Clipboard className="h-4 w-4" />
          <span>Copy</span>
        </button>
        <button
          onClick={downloadAsText}
          disabled={!text}
          className={`flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
            !text ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        <button
          onClick={onSave}
          disabled={!text}
          className={`flex items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${
            !text ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </button>
        <button
          onClick={handleClear}
          disabled={!text}
          className={`flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
            !text ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear</span>
        </button>
      </div>
      <div className="text-sm text-gray-600">
        <span className="mr-3">Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
    </div>
  );
};

export default ActionButtons;