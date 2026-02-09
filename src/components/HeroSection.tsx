import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';
import { ArrowDown, Download, Eye, Sparkles, Briefcase } from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-3xl md:text-4xl font-bold gradient-text">
      {count}
      {suffix}
    </span>
  );
};

export const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  const { data } = usePortfolioData();
  const { personalData } = data;
  const [profileSrc, setProfileSrc] = useState(
    personalData.profileImageUrl || "/hero-portrait.png"
  );
  const [profileLoaded, setProfileLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const phrases = useMemo(
    () => (isRTL ? ["مطور ويب", "مهندس برمجيات", "واجهات حديثة", "تجربة سريعة"] : ["Web Developer", "Full-Stack", "Modern UI", "Fast Experience"]),
    [isRTL]
  );
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setTypedText('');
    setPhraseIndex(0);
    setCharIndex(0);
  }, [isRTL]);

  useEffect(() => {
    const nextSrc = personalData.profileImageUrl || "/hero-portrait.png";
    setProfileSrc(nextSrc);
    setProfileLoaded(false);
  }, [personalData.profileImageUrl]);

  useEffect(() => {
    if (reduceMotion) {
      setTypedText(Array.isArray(phrases) ? phrases[phraseIndex] : '');
      return;
    }

    if (!Array.isArray(phrases) || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex % phrases.length] ?? '';

    const shouldType = charIndex <= currentPhrase.length;
    const delay = shouldType ? 80 : 1600;
    const timeout = setTimeout(() => {
      if (shouldType) {
        setTypedText(currentPhrase.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      } else {
        setTypedText('');
        setCharIndex(0);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [charIndex, phraseIndex, phrases, reduceMotion]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className="container mx-auto px-6 py-14 lg:py-18"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-18 lg:gap-22 xl:gap-26 items-center justify-items-center lg:justify-items-start"
        >
          {/* Content */}
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`space-y-6 md:space-y-7 lg:space-y-8 max-w-[780px] text-center ${
              isRTL ? 'lg:text-right lg:order-1' : 'lg:text-left lg:order-1'
            }`}
          >
            {/* Badges */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap gap-2.5 md:gap-3 justify-center ${
                isRTL ? 'lg:justify-end' : 'lg:justify-start'
              }`}
            >
              <motion.div
                className="pill-badge"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{t('مهندس برمجيات', 'Software Engineer')}</span>
              </motion.div>
              <motion.div
                className="pill-badge"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Briefcase className="w-4 h-4 text-secondary" />
                <span>{t('Full-Stack', 'Full-Stack')}</span>
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className={`font-bold leading-[1.15] text-[clamp(1.9rem,1.9vw+1rem,2.9rem)] ${
                isRTL ? 'text-right' : ''
              }`}
            >
              {t(personalData.heroHeadline, personalData.heroHeadlineEn)}
            </motion.h1>

            {/* Typing line */}
            <motion.div
              variants={itemVariants}
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`flex items-center gap-2 text-primary text-[clamp(1rem,0.8vw+0.8rem,1.25rem)] font-semibold justify-center ${
                isRTL ? 'flex-row-reverse lg:justify-end' : 'lg:justify-start'
              }`}
              aria-live="polite"
            >
              <span className="min-h-[1.5em]">{typedText}</span>
              {!reduceMotion && (
                <span className="w-1.5 h-6 bg-primary animate-pulse rounded-sm" />
              )}
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className={`text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed ${
                isRTL ? 'text-right' : 'hidden sm:block'
              }`}
            >
              {t(personalData.heroDescription, personalData.heroDescriptionEn)}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap gap-3 md:gap-4 justify-center ${
                isRTL ? 'flex-row-reverse lg:justify-end' : 'lg:justify-start'
              }`}
            >
              <motion.a
                href="#portfolio"
                className="btn-primary btn-shine inline-flex items-center gap-2 text-[clamp(0.95rem,0.6vw+0.75rem,1.05rem)] px-7 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-5 h-5" />
                {t('عرض الأعمال', 'View Projects')}
              </motion.a>
            <motion.a
              href={personalData.cvLink}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary inline-flex items-center gap-2 text-[clamp(0.95rem,0.6vw+0.75rem,1.05rem)] px-7 py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
                <Download className="w-5 h-5" />
                {t('تحميل السيرة', 'Download CV')}
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap gap-4 md:gap-6 pt-3 md:pt-4 justify-center ${
                isRTL ? 'flex-row-reverse lg:justify-end' : 'lg:justify-start'
              }`}
            >
              <div className="stats-card">
                <div className="text-center">
                  <Counter value={personalData.stats.yearsExperience} suffix="+" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('سنوات خبرة', 'Years Exp.')}
                  </p>
                </div>
              </div>
              <div className="stats-card">
                <div className="text-center">
                  <Counter value={personalData.stats.projectsCompleted} suffix="+" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('مشروع', 'Projects')}
                  </p>
                </div>
              </div>
              <div className="stats-card">
                <div className="text-center">
                  <Counter value={personalData.stats.happyClients} suffix="+" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('عميل سعيد', 'Happy Clients')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Profile Image */}
          <motion.div
            variants={itemVariants}
            className={`relative flex items-center justify-center lg:justify-self-end ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div
              className={`relative w-[200px] sm:w-[250px] md:w-[280px] lg:w-[330px] xl:w-[360px] 2xl:w-[390px] -translate-y-4 sm:-translate-y-6 lg:-translate-y-8 ${
                isRTL
                  ? 'lg:-translate-x-12 xl:-translate-x-16'
                  : 'lg:-translate-x-6 xl:-translate-x-10'
              }`}
            >
              <div className="relative aspect-square">
                {/* Animated Background Blob */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--glow-cyan) / 0.2), hsl(var(--glow-purple) / 0.2))',
                    filter: 'blur(50px)',
                  }}
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 140, 360],
                  }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Secondary glow */}
                <motion.div
                  className="absolute inset-[10%] rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 40% 30%, hsl(var(--glow-cyan) / 0.18), transparent 60%)',
                    filter: 'blur(26px)',
                  }}
                  animate={{
                    scale: [1.03, 0.97, 1.03],
                    opacity: [0.25, 0.55, 0.25],
                  }}
                  transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Profile Container - Raised position */}
                <motion.div
                  className="relative z-10 w-full h-full flex items-center justify-center"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Simplified glow frame */}
                  <div className="absolute inset-[5%] rounded-full overflow-hidden border border-white/12 bg-gradient-to-br from-white/12 via-white/6 to-transparent backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(0,0,0,0.55)]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-glow-cyan/12 via-glow-purple/10 to-glow-pink/12 opacity-70" />
                    <div className="absolute inset-[2px] rounded-full border border-white/10" />
                  </div>

                  {/* Portrait */}
                  <div className="relative w-[70%] sm:w-[72%] md:w-[74%] lg:w-[76%] aspect-square rounded-full overflow-hidden bg-gradient-to-br from-slate-900/40 via-slate-900/15 to-slate-900/0 border border-white/12 shadow-[0_32px_85px_-40px_rgba(0,0,0,0.65)]">
                    <motion.div
                      className="absolute inset-[-8%] rounded-full"
                      style={{
                        boxShadow: '0 0 35px rgba(99,102,241,0.35), 0 0 65px rgba(236,72,153,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.8, 0.35] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <img
                      src={profileSrc}
                      alt={t('الصورة الشخصية', 'Profile portrait')}
                      className={`relative z-10 w-full h-full object-cover rounded-full transition-opacity duration-500 ${
                        profileLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="eager"
                      onLoad={() => setProfileLoaded(true)}
                      onError={() => {
                        if (profileSrc !== "/hero-portrait.png") {
                          setProfileSrc("/hero-portrait.png");
                        }
                      }}
                    />
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/12" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-sm">{t('اسحب للأسفل', 'Scroll Down')}</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
