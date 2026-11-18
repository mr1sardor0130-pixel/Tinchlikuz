import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Language = 'uz' | 'ru' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const STORAGE_KEY = 'tinchlik_lang';

const PAGE_TITLES: Record<Language, string> = {
  uz: 'Tinchlik Oilaviy Restorani — Samarqand | Milliy va Yevropa taomlari',
  ru: 'Семейный ресторан Tinchlik — Самарканд | Национальная и европейская кухня',
  en: 'Tinchlik Family Restaurant — Samarkand | Uzbek & European Cuisine',
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'uz',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'uz';
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'uz' || saved === 'ru' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore storage restriction
    }
    return 'uz';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = PAGE_TITLES[lang];
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage restriction
    }
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
