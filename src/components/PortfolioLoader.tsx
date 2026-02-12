import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const PortfolioLoader = () => {
  const { t } = useLanguage();
  const fullText = useMemo(() => t('أنا مطور ويب', "I'm Web Developer"), [t]);
  const [typedText, setTypedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setTypedText('');
    setIndex(0);
  }, [fullText]);

  useEffect(() => {
    if (index >= fullText.length) return;
    const timeout = setTimeout(() => {
      setTypedText(fullText.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, 80);
    return () => clearTimeout(timeout);
  }, [index, fullText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <img
            src="/favicon.svg"
            alt="Mahdi logo"
            className="absolute inset-0 m-auto h-6 w-6 object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-base font-semibold text-white">
          <span className="min-h-[1.6em]">{typedText}</span>
          <span className="h-5 w-[2px] bg-primary animate-pulse rounded-sm" />
        </div>
        <p className="text-xs text-slate-400">
          {t('جارٍ تحميل البرتفوليو...', 'Loading portfolio...')}
        </p>
      </div>
    </div>
  );
};
