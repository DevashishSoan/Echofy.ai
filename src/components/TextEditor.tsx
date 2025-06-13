import React, { useRef, useEffect } from 'react';

interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
  isRecording: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, setText, isRecording }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new text is added during recording
  useEffect(() => {
    if (isRecording && textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [text, isRecording]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="w-full">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleChange}
        className="w-full min-h-[300px] p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
        placeholder="Your transcribed text will appear here..."
        aria-label="Transcribed text"
      ></textarea>
    </div>
  );
};

export default TextEditor;