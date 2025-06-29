import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getSpinnerClasses = () => {
    const baseClasses = `${sizeClasses[size]} animate-spin`;
    
    switch (variant) {
      case 'gradient':
        return `${baseClasses} text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text`;
      case 'pulse':
        return `${baseClasses} text-blue-600 animate-pulse`;
      default:
        return `${baseClasses} text-blue-600`;
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`} role="status" aria-live="polite">
      <div className="relative">
        <Loader2 className={getSpinnerClasses()} />
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-ping" />
        )}
      </div>
      {text && (
        <span className="text-gray-600 font-medium animate-pulse">{text}</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;