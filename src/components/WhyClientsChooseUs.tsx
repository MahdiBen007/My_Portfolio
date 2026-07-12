import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Palette,
  LayoutDashboard,
  Zap,
  Smartphone,
  Headphones,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Award,
  Users,
  FolderCheck,
  Clock,
  Shield,
  Gem,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_name_ar: string;
  company: string;
  company_ar: string;
  review: string;
  review_ar: string;
  photo_url: string | null;
  stars: number;
  sort_order: number;
  visible: boolean;
}

const ADVANTAGES = [
  {
    icon: Palette,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    titleAr: 'تصميم مخصص',
    titleEn: 'Custom Design',
    descAr: 'كل موقع يُصمم بشكل فريد يناسب علامتك التجارية.',
    descEn: 'Every website is uniquely designed to fit your brand.',
  },
  {
    icon: LayoutDashboard,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    titleAr: 'لوحة تحكم متكاملة',
    titleEn: 'Complete Dashboard',
    descAr: 'أدر عملك بالكامل من لوحة تحكم واحدة أنيقة.',
    descEn: 'Manage your entire business from one beautiful dashboard.',
  },
  {
    icon: Zap,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10 border-yellow-500/20',
    titleAr: 'أداء سريع',
    titleEn: 'Fast Performance',
    descAr: 'مُحسّن للسرعة وأداء مستخدم ممتاز.',
    descEn: 'Optimized for speed and excellent user experience.',
  },
  {
    icon: Smartphone,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10 border-green-500/20',
    titleAr: 'متجاوب مع كل الأجهزة',
    titleEn: 'Responsive Everywhere',
    descAr: 'مثالي على الكمبيوتر والتابلت والهاتف.',
    descEn: 'Perfect on desktop, tablet and mobile.',
  },
  {
    icon: Headphones,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10 border-pink-500/20',
    titleAr: 'دعم احترافي',
    titleEn: 'Professional Support',
    descAr: 'دعم مستمر بعد التسليم لضمان نجاح مشروعك.',
    descEn: 'Continuous support after delivery for your success.',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    titleAr: 'حل قابل للتوسع',
    titleEn: 'Scalable Solution',
    descAr: 'مشروعك جاهز للنمو المستقبلي.',
    descEn: 'Your project is ready for future growth.',
  },
];

const TRUST_STATS = [
  { icon: FolderCheck, value: '27+', labelAr: 'مشروع منجز', labelEn: 'Completed Projects' },
  { icon: Users, value: '27+', labelAr: 'عميل سعيد', labelEn: 'Happy Clients' },
  { icon: Award, value: '98%', labelAr: 'رضا العملاء', labelEn: 'Satisfaction' },
  { icon: Clock, value: '3 يوم', labelAr: 'متوسط التسليم', labelEn: 'Avg Delivery' },
];

export const WhyClientsChooseUs = () => {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isSectionVisible = useInView(sectionRef, { once: false, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeAdv, setActiveAdv] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advAutoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const fetchTestimonials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();

    const handleFocus = () => fetchTestimonials();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchTestimonials]);

  useEffect(() => {
    if (!isSectionVisible) {
      if (advAutoPlayRef.current) clearInterval(advAutoPlayRef.current);
      return;
    }
    advAutoPlayRef.current = setInterval(() => {
      setActiveAdv((prev) => (prev + 1) % ADVANTAGES.length);
    }, 2000);
    return () => {
      if (advAutoPlayRef.current) clearInterval(advAutoPlayRef.current);
    };
  }, [isSectionVisible]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.96,
    }),
  };

  const paginate = useCallback((newDirection: number) => {
    if (testimonials.length <= 1) return;
    setDirection(newDirection);
    setActiveSlide((prev) => {
      const next = prev + newDirection;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    if (!isSectionVisible) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => paginate(1), 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [paginate, testimonials.length, isSectionVisible]);

  const handleInteraction = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setTimeout(() => {
      if (!isSectionVisible) return;
      autoPlayRef.current = setInterval(() => paginate(1), 5000);
    }, 7000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      handleInteraction();
      if (diff > 0) {
        paginate(isRTL ? -1 : 1);
      } else {
        paginate(isRTL ? 1 : -1);
      }
    }
  };

  return (
    <section id="trust" className="relative py-10 sm:py-14 md:py-20 overflow-hidden" ref={sectionRef}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-primary/[0.015] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/[0.015] rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 sm:mb-5"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] sm:text-xs font-medium text-primary">{t('موثوق ومعتمد', 'Trusted & Proven')}</span>
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            {t('لماذا يختار عملاؤنا', 'Why Clients Choose Us')}
            <span className="block gradient-text mt-1">StoreCraft</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-2">
            {t(
              'مئات الشركات تختارنا لأننا نقدم حلولاً رقمية عالية الجودة مع دعم طويل الأمد وأداء استثنائي.',
              'Hundreds of businesses choose us because we deliver high-quality digital solutions with long-term support and outstanding performance.'
            )}
          </p>
        </motion.div>

        {/* Trust Stats - Mobile: 2x2 grid with larger impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
          className="mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            {TRUST_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1, ease: EASE_OUT }}
                  className="group"
                >
                  <div className="relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm hover:border-primary/20 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1.5 sm:mb-2 relative z-10" />
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text relative z-10 leading-none">{stat.value}</div>
                    <div className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-1 relative z-10">
                      {t(stat.labelAr, stat.labelEn)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mobile: Advantages Auto Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
          className="lg:hidden mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-wider">
              {t('مميزاتنا', 'Our Advantages')}
            </span>
            <div className="w-6 sm:w-8 h-px bg-gradient-to-l from-primary to-transparent" />
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.02] min-h-[140px] sm:min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAdv}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 sm:p-6 flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl ${ADVANTAGES[activeAdv].iconBg} border flex items-center justify-center mb-3`}>
                  {(() => {
                    const Icon = ADVANTAGES[activeAdv].icon;
                    return <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${ADVANTAGES[activeAdv].iconColor}`} />;
                  })()}
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1.5">
                  {t(ADVANTAGES[activeAdv].titleAr, ADVANTAGES[activeAdv].titleEn)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                  {t(ADVANTAGES[activeAdv].descAr, ADVANTAGES[activeAdv].descEn)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
            {ADVANTAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveAdv(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeAdv === index
                    ? 'w-5 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Desktop: Advantages Grid + Testimonial */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 items-start">
          {/* Left - Advantage Cards */}
          <div className="space-y-3 xl:space-y-4">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.4 + idx * 0.08 }}
                  whileHover={{ x: isRTL ? -6 : 6, scale: 1.01 }}
                  className="group relative"
                >
                  <div className="relative flex items-start gap-4 p-5 xl:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/[0.02] to-transparent" />
                    <div className={`relative shrink-0 w-11 h-11 rounded-xl ${adv.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-5 h-5 ${adv.iconColor}`} />
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] mb-1">
                        {t(adv.titleAr, adv.titleEn)}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(adv.descAr, adv.descEn)}
                      </p>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ [isRTL ? 'left' : 'right']: '12px' }}>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right - Testimonial (Desktop) */}
          <TestimonialPanel
            testimonials={testimonials}
            activeSlide={activeSlide}
            direction={direction}
            isRTL={isRTL}
            isInView={isInView}
            onPaginate={(dir) => { handleInteraction(); paginate(dir); }}
            onDotClick={(idx) => {
              handleInteraction();
              setDirection(idx > activeSlide ? 1 : -1);
              setActiveSlide(idx);
            }}
            slideVariants={slideVariants}
            EASE_OUT={EASE_OUT}
            t={t}
          />
        </div>

        {/* Mobile: Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT }}
          className="lg:hidden"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-wider">
              {t('آراء العملاء', 'Client Reviews')}
            </span>
            <div className="w-6 sm:w-8 h-px bg-gradient-to-l from-primary to-transparent" />
          </div>

          {/* Mobile Testimonial Card */}
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Navigation Arrows - Mobile */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={() => { handleInteraction(); paginate(-1); }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full border border-white/10 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
                >
                  {isRTL ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { handleInteraction(); paginate(1); }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full border border-white/10 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
                >
                  {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </>
            )}

            {/* Slider Container - Mobile */}
            <div className="relative min-h-[280px] sm:min-h-[300px] overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-primary/[0.02]" />

              <AnimatePresence initial={false} custom={direction} mode="wait">
                {testimonials.length > 0 && (
                  <motion.div
                    key={testimonials[activeSlide]?.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <div className="relative h-full p-5 sm:p-6 md:p-8 flex flex-col">
                      {/* Large Quote Icon */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-primary/[0.06]" />
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-4 sm:mb-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              i < (testimonials[activeSlide]?.stars || 5)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/10'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed flex-1 mb-5 sm:mb-6 relative z-10">
                        "{t(testimonials[activeSlide]?.review_ar, testimonials[activeSlide]?.review)}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {testimonials[activeSlide]?.photo_url ? (
                          <img
                            src={testimonials[activeSlide].photo_url!}
                            alt={t(testimonials[activeSlide].customer_name_ar, testimonials[activeSlide].customer_name)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-base sm:text-lg font-bold text-primary border border-primary/10">
                            {t(
                              testimonials[activeSlide]?.customer_name_ar,
                              testimonials[activeSlide]?.customer_name
                            )?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">
                            {t(testimonials[activeSlide]?.customer_name_ar, testimonials[activeSlide]?.customer_name)}
                          </p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">
                            {t(testimonials[activeSlide]?.company_ar, testimonials[activeSlide]?.company)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {testimonials.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <Gem className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('سيتم إضافة آراء العملاء قريباً', 'Client reviews coming soon')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Dots - Mobile */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleInteraction();
                      setDirection(index > activeSlide ? 1 : -1);
                      setActiveSlide(index);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      activeSlide === index
                        ? 'w-5 sm:w-6 h-1.5 bg-primary'
                        : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.8, ease: EASE_OUT }}
            className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">{t('ضمان الرضا 100%', '100% Satisfaction')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <Gem className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">{t('جودة مضمونة', 'Quality Assured')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

function TestimonialPanel({
  testimonials,
  activeSlide,
  direction,
  isRTL,
  isInView,
  onPaginate,
  onDotClick,
  slideVariants,
  EASE_OUT,
  t,
}: {
  testimonials: Testimonial[];
  activeSlide: number;
  direction: number;
  isRTL: boolean;
  isInView: boolean;
  onPaginate: (dir: number) => void;
  onDotClick: (idx: number) => void;
  slideVariants: {
    enter: (dir: number) => { x: number; opacity: number; scale: number };
    center: { x: number; opacity: number; scale: number };
    exit: (dir: number) => { x: number; opacity: number; scale: number };
  };
  EASE_OUT: readonly [number, number, number, number];
  t: (ar: string, en: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.95, delay: 0.5, ease: EASE_OUT }}
      className="relative lg:sticky lg:top-32"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-px bg-gradient-to-r from-primary to-transparent" />
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {t('آراء العملاء', 'Client Reviews')}
        </span>
      </div>

      <div className="relative">
        {testimonials.length > 1 && (
          <>
            <button
              onClick={() => onPaginate(-1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/10 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onPaginate(1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/10 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </>
        )}

        <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-primary/[0.02]" />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            {testimonials.length > 0 && (
              <motion.div
                key={testimonials[activeSlide]?.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="relative h-full p-8 flex flex-col">
                  <div className="absolute top-8 right-8">
                    <Quote className="w-20 h-20 text-primary/[0.06]" />
                  </div>

                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (testimonials[activeSlide]?.stars || 5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-lg leading-relaxed flex-1 mb-6 relative z-10">
                    "{t(testimonials[activeSlide]?.review_ar, testimonials[activeSlide]?.review)}"
                  </p>

                  <div className="flex items-center gap-4">
                    {testimonials[activeSlide]?.photo_url ? (
                      <img
                        src={testimonials[activeSlide].photo_url!}
                        alt={t(testimonials[activeSlide].customer_name_ar, testimonials[activeSlide].customer_name)}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold text-primary border border-primary/10">
                        {t(
                          testimonials[activeSlide]?.customer_name_ar,
                          testimonials[activeSlide]?.customer_name
                        )?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {t(testimonials[activeSlide]?.customer_name_ar, testimonials[activeSlide]?.customer_name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(testimonials[activeSlide]?.company_ar, testimonials[activeSlide]?.company)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {testimonials.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Gem className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('سيتم إضافة آراء العملاء قريباً', 'Client reviews coming soon')}
                </p>
              </div>
            </div>
          )}
        </div>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => onDotClick(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? 'w-6 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.8, ease: EASE_OUT }}
        className="mt-6 flex items-center justify-center gap-3"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">{t('ضمان الرضا 100%', '100% Satisfaction Guarantee')}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <Gem className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">{t('جودة مضمونة', 'Quality Assured')}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
