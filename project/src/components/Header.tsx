import React from 'react';
import { Mic } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center py-6 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Mic className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-800">Echofy.ai</h1>
      </div>
    </header>
  );
};

export default Header;