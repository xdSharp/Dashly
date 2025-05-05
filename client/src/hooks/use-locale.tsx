import { useI18n } from '../lib/i18n.tsx';

export function useLocale() {
  const { locale, setLocale, t } = useI18n();
  
  // Toggle between English and Russian
  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ru' : 'en');
  };
  
  return { locale, setLocale, toggleLocale, t };
}
