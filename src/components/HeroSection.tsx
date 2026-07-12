import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Eye, LayoutDashboard, ShoppingCart, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DEFAULT_PROFILE_IMAGE = "/hero-portrait.svg";

export const HeroSection = () => {
  const { t, isRTL } = useLanguage();
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

  const features = [
    { icon: LayoutDashboard, labelAr: 'لوحة تحكم متقدمة', labelEn: 'Professional Dashboard' },
    { icon: ShoppingCart, labelAr: 'متجر مخصص', labelEn: 'Fully Customized Store' },
    { icon: TrendingUp, labelAr: 'أداء فائق', labelEn: 'Fast Performance' },
    { icon: Package, labelAr: 'متجاوب مع الجوال', labelEn: 'Mobile Optimized' },
    { icon: BarChart3, labelAr: 'مصمم للشركات الجزائرية', labelEn: 'Built for Algerian Businesses' },
  ];

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16 lg:pt-20"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className={`container mx-auto px-5 sm:px-6 py-10 sm:py-14 lg:py-18 ${
          isRTL ? 'lg:pr-8 xl:pr-10' : 'lg:pl-8 xl:pl-10'
        }`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-18 xl:gap-22 items-center justify-items-center ${isRTL ? 'lg:justify-items-end' : 'lg:justify-items-start'}`}
        >
          {/* Content */}
          <div
            className={`space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8 max-w-[780px] text-center ${
              isRTL ? 'lg:text-right lg:order-1' : 'lg:text-left lg:order-1'
            }`}
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2.5 md:gap-3 justify-center"
            >
              <motion.div
                className="pill-badge"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>{t('منصة التجارة الإلكترونية', 'E-commerce Platform')}</span>
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-bold leading-[1.15] text-[clamp(1.9rem,1.9vw+1rem,2.9rem)]"
            >
              {t('من الفكرة إلى متجرك الإلكتروني... اشترِ مرة واحدة وبِع بلا حدود.', 'From idea to your online store... Buy once, sell without limits.')}
            </motion.h1>

            {/* Feature List */}
            <motion.div
              variants={itemVariants}
              className="space-y-2.5 sm:space-y-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className={`flex items-center gap-2.5 sm:gap-3 feature-item ${
                    isRTL
                      ? 'justify-center lg:justify-end'
                      : 'justify-center lg:justify-start'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                    <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-xs sm:text-sm md:text-base">
                    {t(feature.labelAr, feature.labelEn)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview Composition */}
          <motion.div
            variants={itemVariants}
            className={`relative flex flex-col items-center justify-center lg:justify-self-end mt-8 lg:mt-0 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div
              className={`relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] xl:w-[420px] ${
                isRTL
                  ? '-translate-y-2 sm:-translate-y-4 lg:-translate-y-6'
                  : '-translate-y-4 sm:-translate-y-6 lg:-translate-y-8'
              }`}
            >
              {/* Animated Background Blob */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--glow-cyan) / 0.15), hsl(var(--glow-purple) / 0.15))',
                  filter: 'blur(60px)',
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

              {/* Main Dashboard Card */}
              <motion.div
                className="relative z-10 glass-card rounded-2xl p-4 border border-white/10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Dashboard Header */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ms-2 text-xs text-muted-foreground">{t('لوحة التحكم', 'Dashboard')}</span>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-3">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="glass-card rounded-xl p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold gradient-text">12.5K</div>
                      <div className="text-[10px] text-muted-foreground">{t('الزيارات', 'Visitors')}</div>
                    </div>
                    <div className="glass-card rounded-xl p-3 text-center">
                      <ShoppingCart className="w-4 h-4 text-secondary mx-auto mb-1" />
                      <div className="text-lg font-bold gradient-text">847</div>
                      <div className="text-[10px] text-muted-foreground">{t('الطلبات', 'Orders')}</div>
                    </div>
                    <div className="glass-card rounded-xl p-3 text-center">
                      <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold gradient-text">98K</div>
                      <div className="text-[10px] text-muted-foreground">{t('الإيرادات', 'Revenue')}</div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="glass-card rounded-xl p-3 h-24 relative overflow-hidden">
                    <div className="text-[10px] text-muted-foreground mb-2">{t('مخطط المبيعات', 'Sales Chart')}</div>
                    <svg className="w-full h-16" viewBox="0 0 200 60" fill="none">
                      <motion.path
                        d="M0 50 L20 40 L40 45 L60 30 L80 35 L100 20 L120 25 L140 15 L160 18 L180 10 L200 5"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(187, 85%, 53%)" />
                          <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                className={`absolute -bottom-4 glass-card rounded-xl p-3 border border-white/10 z-20 ${
                  isRTL ? '-right-4' : '-left-4'
                }`}
                animate={{ y: [0, 8, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">+24%</div>
                    <div className="text-[10px] text-muted-foreground">{t('نمو المبيعات', 'Sales Growth')}</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`absolute -top-4 glass-card rounded-xl p-3 border border-white/10 z-20 ${
                  isRTL ? '-left-4' : '-right-4'
                }`}
                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">1,234</div>
                    <div className="text-[10px] text-muted-foreground">{t('المنتجات', 'Products')}</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA Buttons - Under Dashboard */}
            <motion.div
              variants={itemVariants}
              className="flex flex-row gap-2.5 sm:gap-3 justify-center mt-6 sm:mt-8"
            >
              <motion.a
                href="#demo"
                className="btn-primary btn-shine inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[clamp(0.8rem,0.5vw+0.7rem,0.95rem)] px-4 sm:px-5 py-2.5 sm:py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('عرض المتاجر', 'View Stores')}
              </motion.a>
              <motion.a
                href="#demo"
                className="btn-secondary inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[clamp(0.8rem,0.5vw+0.7rem,0.95rem)] px-4 sm:px-5 py-2.5 sm:py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('لوحة التحكم', 'Dashboard')}
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

    </section>
  );
};
