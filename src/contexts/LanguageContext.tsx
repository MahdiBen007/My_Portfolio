import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'portfolio_language';

const resolveStoredLanguage = () => {
  if (typeof window === 'undefined') {
    return { language: undefined, hasStoredPreference: false };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') {
    return { language: stored as Language, hasStoredPreference: true };
  }

  return { language: undefined, hasStoredPreference: false };
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  defaultLanguage?: Language;
}> = ({ children, defaultLanguage = 'ar' }) => {
  const stored = useMemo(() => resolveStoredLanguage(), []);
  const [language, setLanguage] = useState<Language>(stored.language ?? defaultLanguage);
  const [hasStoredPreference, setHasStoredPreference] = useState(stored.hasStoredPreference);

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    if (hasStoredPreference) return;
    if (defaultLanguage === language) return;
    setLanguage(defaultLanguage);
  }, [defaultLanguage, hasStoredPreference, language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    setHasStoredPreference(true);
  };

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
