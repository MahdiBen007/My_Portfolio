import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Rocket,
  Star,
  FolderOpen,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { supabase } from '@/integrations/supabase/client';

interface PricingPlan {
  id: string;
  name_ar: string;
  name_en: string;
  price_ar: string;
  price_en: string;
  currency_ar: string;
  currency_en: string;
  desc_ar: string;
  desc_en: string;
  icon: string;
  badge_ar: string | null;
  badge_en: string | null;
  featured: boolean;
  features_ar: string[];
  features_en: string[];
  cta_ar: string;
  cta_en: string;
  cta_link: string | null;
  sort_order: number;
  visible: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Sparkles,
  Crown,
  Star,
};

const INCLUDED_ITEMS_AR = [
  'لوحة تحكم إدارية كاملة',
  'منتجات غير محدودة',
  'تصميم متجاوب',
  'جاهز للترقية المستقبلية',
];

const INCLUDED_ITEMS_EN = [
  'Complete Admin Dashboard',
  'Unlimited Products',
  'Responsive Design',
  'Future Upgrade Ready',
];

export const PricingSection = () => {
  const { t, isRTL } = useLanguage();
  const { setSectionVisible } = useSectionVisibility();
  const { data: portfolioData } = usePortfolioData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = { starter: 0, business: 0, premium: 0 };
    (portfolioData.projects ?? []).forEach((p) => {
      const pkg = (p.packageType ?? 'other').toLowerCase();
      if (pkg in counts) counts[pkg]++;
    });
    return counts;
  }, [portfolioData.projects]);

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) {
        setPlans(data);
        setSectionVisible('pricing', data.length > 0);
      }
    } catch (err) {
      console.error('PricingSection fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setSectionVisible]);

  useEffect(() => {
    fetchPlans();

    const handleFocus = () => fetchPlans();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchPlans]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToSlide = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const inner = container.querySelector('.flex') as HTMLElement;
    if (!inner) return;
    const child = inner.children[index] as HTMLElement;
    if (!child) return;
    const scrollLeft = child.offsetLeft - (container.clientWidth - child.offsetWidth) / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setActiveSlide(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveSlide((prev) => {
      const next = (prev + 1) % plans.length;
      scrollToSlide(next);
      return next;
    });
  }, [scrollToSlide, plans.length]);

  const goPrev = useCallback(() => {
    setActiveSlide((prev) => {
      const next = (prev - 1 + plans.length) % plans.length;
      scrollToSlide(next);
      return next;
    });
  }, [scrollToSlide, plans.length]);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(goNext, 2000);
  }, [goNext]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isInView) return;
    startAutoPlay();
    return stopAutoPlay;
  }, [isInView, startAutoPlay, stopAutoPlay]);

  const handleInteraction = () => {
    stopAutoPlay();
    setTimeout(startAutoPlay, 4000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: EASE_OUT },
    },
  };

  const renderCard = (plan: PricingPlan, isMobile = false) => {
    const Icon = iconMap[plan.icon] || Rocket;
    const isFeatured = plan.featured;

    return (
      <div
        key={plan.id}
        className={`relative overflow-hidden transition-all duration-500 ${
          isFeatured ? 'lg:scale-[1.04] lg:-my-2 z-10' : ''
        }`}
      >
        {isFeatured && (
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/30 via-secondary/20 to-primary/10 blur-sm opacity-60" />
        )}

        <div
          className={`relative h-full flex flex-col rounded-2xl ${isMobile ? 'p-4' : 'p-4 md:p-5 lg:p-7'} ${
            isFeatured
              ? 'glass-card border border-primary/30 shadow-[0_0_50px_hsl(var(--glow-cyan)/0.12),0_0_80px_hsl(var(--glow-purple)/0.08)]'
              : 'glass-card border border-white/[0.06]'
          }`}
        >
          {(plan.badge_ar || plan.badge_en) && (
            <div className="absolute top-0 right-0 left-0">
              <div className="mx-auto w-fit px-3 md:px-4 py-1 md:py-1.5 rounded-b-lg text-[10px] md:text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-primary to-secondary text-background">
                {t(plan.badge_ar || plan.badge_en || '', plan.badge_en || plan.badge_ar || '')}
              </div>
            </div>
          )}

          <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 lg:mb-5 ${
            isFeatured
              ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/25'
              : 'bg-white/[0.04] border border-white/[0.06]'
          }`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${isFeatured ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          <h3 className="text-base md:text-lg lg:text-xl font-bold mb-1.5 md:mb-2">{t(plan.name_ar, plan.name_en)}</h3>

          <div className="flex items-baseline gap-1 md:gap-1.5 mb-2 md:mb-3">
            <span className={`text-2xl md:text-3xl lg:text-4xl font-extrabold ${isFeatured ? 'gradient-text' : ''}`}>
              {t(plan.price_ar, plan.price_en)}
            </span>
            <span className="text-xs md:text-sm lg:text-base text-muted-foreground font-medium">{plan.currency_en}</span>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 md:mb-5">
            {t(plan.desc_ar, plan.desc_en)}
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 md:mb-5" />

          <ul className="flex flex-col gap-2 md:gap-2.5 lg:gap-3 mb-5 md:mb-6 lg:mb-8 flex-1">
            {(isRTL ? plan.features_ar : plan.features_en).map((feature, i) => (
              <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[12px] md:text-[13px] lg:text-sm">
                <span className="shrink-0 mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded-md bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                </span>
                <span className="text-foreground/90">{t(feature, feature)}</span>
              </li>
            ))}
          </ul>

          <motion.a
            href={plan.cta_link || '#contact'}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`group/btn relative flex items-center justify-center gap-2 w-full py-2.5 md:py-3 lg:py-3.5 rounded-xl font-semibold text-xs md:text-sm lg:text-base transition-all duration-300 overflow-hidden ${
              isFeatured
                ? 'btn-primary btn-shine text-background'
                : 'bg-white/[0.06] border border-white/10 text-foreground hover:bg-white/[0.1] hover:border-white/20'
            }`}
          >
            <span>{t(plan.cta_ar, plan.cta_en)}</span>
            <ArrowRight className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
          </motion.a>

          {(() => {
            const planNameLower = plan.name_en.toLowerCase();
            const matchedPackage = ['starter', 'business', 'premium'].find((p) => planNameLower.includes(p));
            if (!matchedPackage) return null;
            const count = projectCounts[matchedPackage] ?? 0;
            return (
              <button
                onClick={() => {
                  window.location.hash = `portfolio?package=${matchedPackage}`;
                  const el = document.getElementById('portfolio');
                  if (el) {
                    setTimeout(() => {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }
                }}
                className="group/link w-full flex items-center justify-center gap-1.5 mt-2.5 py-1 text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <FolderOpen className="w-3 h-3 group-hover/link:text-primary transition-colors duration-300" />
                <span>{t('عرض', 'View')} {count} {t('مشاريع', 'Projects')}</span>
                <ArrowRight className={`w-2.5 h-2.5 transition-transform duration-300 ${isRTL ? 'rotate-180 group-hover/link:-translate-x-0.5' : 'group-hover/link:translate-x-0.5'}`} />
              </button>
            );
          })()}
        </div>
      </div>
    );
  };

  if (!loading && plans.length === 0) return null;

  return (
    <section id="pricing" className="relative py-[clamp(48px,8vw,112px)] overflow-hidden" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-6 md:mb-10 lg:mb-14"
        >
          <h2 className="section-title text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            {t('اختر الخطة المثالية لعملك', 'Choose the Perfect Plan for Your Business')}
          </h2>
        </motion.div>

        {/* Included Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
          className="flex justify-center mb-6 md:mb-10 lg:mb-14"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 md:gap-5 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 rounded-2xl glass-card border border-white/10">
            <span className="text-xs md:text-sm lg:text-base font-semibold gradient-text whitespace-nowrap">
              {t('✓ كل خطة تشمل:', '✓ Every plan includes:')}
            </span>
            <div className="hidden sm:block w-px h-5 bg-white/10" />
            <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-1">
              {(isRTL ? INCLUDED_ITEMS_AR : INCLUDED_ITEMS_EN).map((item, i) => (
                <span key={i} className="flex items-center gap-1 md:gap-1.5 text-[11px] md:text-xs lg:text-sm text-muted-foreground">
                  <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-sm bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />
                  </span>
                  {t(item, item)}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="relative"
          >
            {/* Arrows */}
            <div className="absolute -left-2 -right-2 top-0 bottom-0 flex items-center justify-between z-20 pointer-events-none">
              <motion.button
                onClick={() => { handleInteraction(); goPrev(); }}
                className="pointer-events-auto glass-card w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </motion.button>
              <motion.button
                onClick={() => { handleInteraction(); goNext(); }}
                className="pointer-events-auto glass-card w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>

            <div
              ref={scrollRef}
              className="overflow-x-hidden snap-x snap-mandatory pb-6 scrollbar-hide"
              onTouchStart={handleInteraction}
              onMouseEnter={stopAutoPlay}
              onMouseLeave={startAutoPlay}
            >
              <div className="flex" style={{ scrollSnapType: 'x mandatory' }}>
                {plans.map((plan) => (
                  <div key={plan.id} className="shrink-0 w-full snap-center px-4">
                    <div className="max-w-[340px] mx-auto">
                      {renderCard(plan, true)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {plans.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { handleInteraction(); scrollToSlide(index); }}
                  className={`rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Desktop/Tablet Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 max-w-5xl lg:max-w-6xl mx-auto items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={plan.featured ? { y: -10, scale: 1.02 } : { y: -6, scale: 1.015 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {renderCard(plan)}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};
