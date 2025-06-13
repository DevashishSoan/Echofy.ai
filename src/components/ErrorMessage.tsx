import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  isSupported: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ isSupported }) => {
  if (isSupported) {
    return null;
  }

  return (
    <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
      <AlertCircle className="w-5 h-5 mr-2" />
      <span>
        Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari for the
        best experience.
      </span>
    </div>
  );
};

export default ErrorMessage;