import React from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Lang } from '@/i18n';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'fr', label: 'Français' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useAssistant();

  return (
    <div className="relative inline-block text-left">
      <select
        value={language}
        onChange={e => setLanguage(e.target.value as Lang)}
        className="px-3 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
}; 