import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Zap, Smartphone, Palette, Package, HeadphonesIcon, LayoutDashboard } from 'lucide-react';
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

export const TrustSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const stats = [
    {
      icon: LayoutDashboard,
      value: 100,
      suffix: '+',
      labelAr: 'مميزات لوحة التحكم',
      labelEn: 'Dashboard Features',
    },
    {
      icon: Zap,
      value: 99,
      suffix: '%',
      labelAr: 'أداء فائق',
      labelEn: 'Fast Performance',
    },
    {
      icon: Smartphone,
      value: 100,
      suffix: '%',
      labelAr: 'تصميم متجاوب',
      labelEn: 'Responsive Design',
    },
    {
      icon: Palette,
      value: 100,
      suffix: '%',
      labelAr: 'تصميم مخصص',
      labelEn: 'Custom Design',
    },
    {
      icon: Package,
      value: 999,
      suffix: '+',
      labelAr: 'منتجات غير محدودة',
      labelEn: 'Unlimited Products',
    },
    {
      icon: HeadphonesIcon,
      value: 24,
      suffix: '/7',
      labelAr: 'دعم احترافي',
      labelEn: 'Professional Support',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, ease: EASE_OUT },
    },
  };

  return (
    <section id="features" className="relative py-[clamp(48px,6vw,80px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.03 }}
                className="glass-card glow-border p-5 rounded-2xl text-center group"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.5))',
                    boxShadow: '0 0 25px hsl(var(--glow-cyan) / 0.2)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-6 h-6 text-primary relative z-10" />
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--glow-cyan) / 0.3), hsl(var(--glow-purple) / 0.3))',
                    }}
                  />
                </motion.div>
                <div className="mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                  {t(stat.labelAr, stat.labelEn)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
