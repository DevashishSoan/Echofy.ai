import React from 'react';
import Select from 'react-select';
import { Language, SUPPORTED_LANGUAGES } from '../hooks/useLanguageSelection';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const options = SUPPORTED_LANGUAGES.map(lang => ({
    value: lang.code,
    label: lang.name
  }));

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-gray-500" />
      <Select
        className="w-48"
        value={{ value: selectedLanguage.code, label: selectedLanguage.name }}
        options={options}
        onChange={(option) => {
          if (option) {
            const language = SUPPORTED_LANGUAGES.find(lang => lang.code === option.value);
            if (language) {
              onLanguageChange(language);
            }
          }
        }}
        isSearchable={true}
        placeholder="Select language..."
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default LanguageSelector;