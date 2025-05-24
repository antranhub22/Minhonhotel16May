import en from './en.json';
import fr from './translations/fr';
import ko from './translations/ko';
import zh from './translations/zh';
import ru from './translations/ru';
import vi from './translations/vi';

export type Lang = 'en' | 'vi' | 'fr' | 'ko' | 'zh' | 'ru';

const translations: Record<Lang, any> = {
  en,
  vi,
  fr,
  ko,
  zh,
  ru,
};

export function t(key: string, lang: Lang = 'en') {
  return translations[lang]?.[key] || translations['en'][key] || key;
} 