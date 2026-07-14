import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import {
  Globe,
  ShoppingCart,
  Smartphone,
  Boxes,
  Palette,
  Wrench,
  ArrowRight,
  Monitor,
  LayoutDashboard,
  Code2,
  Layers,
  PenTool,
  Headphones,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

const SERVICES = [
  {
    icon: Globe,
    visualIcon: Monitor,
    titleAr: 'تطوير المواقع',
    titleEn: 'Website Development',
    descAr: 'مواقع احترافية، صفحات هبوط، مواقع مؤسسات ومنصات ويب مخصصة بتصميم عصري وأداء عالي.',
    descEn: 'Professional business websites, company websites, landing pages and custom web platforms.',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-purple-500/20',
    accentColor: 'cyan',
    mockupBg: 'from-[#0B1120] via-[#0f1a2e] to-[#0B1120]',
    mockupElements: [
      { type: 'nav', width: '100%', height: 40, color: 'bg-white/5', rounded: 'rounded-t-xl' },
      { type: 'hero', width: '100%', height: 80, color: 'bg-cyan-500/10', rounded: 'rounded-lg' },
      { type: 'grid', width: '100%', height: 60, color: 'bg-white/5', rounded: 'rounded-lg' },
    ],
  },
  {
    icon: ShoppingCart,
    visualIcon: LayoutDashboard,
    titleAr: 'متاجر إلكترونية',
    titleEn: 'E-Commerce Stores',
    descAr: 'متاجر إلكترونية احترافية مع لوحة تحكم كاملة، منتجات غير محدودة وأداء فائق.',
    descEn: 'Professional online stores with complete Admin Dashboard, unlimited products and high performance.',
    gradient: 'from-purple-500/20 via-pink-500/10 to-cyan-500/20',
    accentColor: 'purple',
    mockupBg: 'from-[#0B1120] via-[#120a20] to-[#0B1120]',
    mockupElements: [
      { type: 'sidebar', width: 60, height: '100%', color: 'bg-purple-500/10', rounded: 'rounded-l-xl' },
      { type: 'stats', width: '100%', height: 50, color: 'bg-white/5', rounded: 'rounded-lg' },
      { type: 'table', width: '100%', height: 80, color: 'bg-purple-500/5', rounded: 'rounded-lg' },
    ],
  },
  {
    icon: Smartphone,
    visualIcon: Smartphone,
    titleAr: 'تطوير تطبيقات الموبايل',
    titleEn: 'Mobile App Development',
    descAr: 'تطبيقات احترافية لنظامي Android و iOS بتصميم عصري وتكامل كامل مع أنظمتك.',
    descEn: 'Modern Android and iOS applications connected to your business systems.',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
    accentColor: 'emerald',
    mockupBg: 'from-[#0B1120] via-[#0a1520] to-[#0B1120]',
    mockupElements: [
      { type: 'phone-frame', width: 160, height: 280, color: 'bg-white/5', rounded: 'rounded-[2rem]' },
    ],
  },
  {
    icon: Boxes,
    visualIcon: Code2,
    titleAr: 'أنظمة أعمال مخصصة',
    titleEn: 'Custom Business Systems',
    descAr: 'أنظمة مخزون، CRM، ERP، حجوزات ومنصات إدارة مخصصة حسب احتياجات عملك.',
    descEn: 'Inventory systems, CRM, ERP, booking systems and custom management platforms.',
    gradient: 'from-amber-500/20 via-orange-500/10 to-red-500/20',
    accentColor: 'amber',
    mockupBg: 'from-[#0B1120] via-[#15100a] to-[#0B1120]',
    mockupElements: [
      { type: 'chart', width: '100%', height: 70, color: 'bg-amber-500/10', rounded: 'rounded-lg' },
      { type: 'cards', width: '100%', height: 60, color: 'bg-white/5', rounded: 'rounded-lg' },
    ],
  },
  {
    icon: Palette,
    visualIcon: Layers,
    titleAr: 'تصميم UI/UX',
    titleEn: 'UI/UX Design',
    descAr: 'واجهات مستخدم حديثة مصممة لسهولة الاستخدام والأداء وتجربة مستخدم راقية.',
    descEn: 'Modern interfaces designed for usability, performance and premium user experience.',
    gradient: 'from-pink-500/20 via-rose-500/10 to-purple-500/20',
    accentColor: 'pink',
    mockupBg: 'from-[#0B1120] via-[#1a0a15] to-[#0B1120]',
    mockupElements: [
      { type: 'canvas', width: '100%', height: 100, color: 'bg-pink-500/10', rounded: 'rounded-xl' },
    ],
  },
  {
    icon: Wrench,
    visualIcon: Headphones,
    titleAr: 'الصيانة والدعم',
    titleEn: 'Maintenance & Support',
    descAr: 'تحديثات مستمرة، تحسين الميزات، تحسين الأداء ودعم فني متخصص بعد التسليم.',
    descEn: 'Continuous updates, feature improvements, performance optimization and technical support.',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-violet-500/20',
    accentColor: 'blue',
    mockupBg: 'from-[#0B1120] via-[#0a1025] to-[#0B1120]',
    mockupElements: [
      { type: 'monitor', width: '100%', height: 90, color: 'bg-blue-500/10', rounded: 'rounded-xl' },
    ],
  },
];

const ServiceVisual = ({ service, index }: { service: typeof SERVICES[0]; index: number }) => {
  const VisualIcon = service.visualIcon;
  const reduceMotion = useReducedMotion();
  const isMobile = isMobileDevice();

  const renderMockup = () => {
    switch (index) {
      case 0: // Website
        return (
          <div className="w-full h-full flex flex-col gap-2.5 p-4">
            <div className="h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <div className="flex-1 h-3 bg-white/5 rounded ml-2" />
            </div>
            <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-xl p-4 flex flex-col justify-center">
              <div className="w-24 h-3 bg-cyan-400/30 rounded mb-2" />
              <div className="w-40 h-2 bg-white/10 rounded mb-1" />
              <div className="w-32 h-2 bg-white/10 rounded mb-3" />
              <div className="w-20 h-6 bg-cyan-500/30 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-lg" />
              ))}
            </div>
          </div>
        );
      case 1: // E-commerce
        return (
          <div className="w-full h-full flex gap-2.5 p-4">
            <div className="w-14 bg-purple-500/10 rounded-xl flex flex-col items-center py-3 gap-2">
              <div className="w-6 h-6 bg-purple-400/30 rounded-lg" />
              <div className="w-6 h-6 bg-white/5 rounded-lg" />
              <div className="w-6 h-6 bg-white/5 rounded-lg" />
              <div className="w-6 h-6 bg-white/5 rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  'bg-purple-500/10',
                  'bg-pink-500/10',
                  'bg-cyan-500/10',
                ].map((color, i) => (
                  <div key={i} className={`h-16 ${color} rounded-lg flex flex-col justify-center px-2`}>
                    <div className="w-8 h-1.5 bg-white/15 rounded mb-1" />
                    <div className="w-5 h-2.5 bg-white/20 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-2.5">
                <div className="w-16 h-2 bg-white/10 rounded mb-2" />
                <div className="space-y-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-3 bg-white/5 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2: // Mobile App
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-36 h-[280px] bg-white/5 rounded-[2rem] border border-white/10 p-2.5 flex flex-col overflow-hidden">
              <div className="h-5 bg-white/10 rounded-full mx-6 mb-2" />
              <div className="flex-1 bg-gradient-to-b from-emerald-500/15 to-cyan-500/10 rounded-xl p-3 flex flex-col">
                <div className="w-16 h-2.5 bg-emerald-400/30 rounded mb-2" />
                <div className="w-24 h-1.5 bg-white/10 rounded mb-1" />
                <div className="w-20 h-1.5 bg-white/10 rounded mb-3" />
                <div className="flex-1 grid grid-cols-2 gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-lg" />
                  ))}
                </div>
                <div className="h-7 bg-emerald-500/20 rounded-lg mt-2" />
              </div>
            </div>
          </div>
        );
      case 3: // Business Systems
        return (
          <div className="w-full h-full flex flex-col gap-2.5 p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                'bg-amber-500/10',
                'bg-orange-500/10',
                'bg-red-500/10',
                'bg-amber-500/10',
              ].map((color, i) => (
                <div key={i} className={`h-14 ${color} rounded-lg flex flex-col justify-center items-center px-1`}>
                  <div className="w-4 h-1 bg-white/15 rounded mb-1" />
                  <div className="w-6 h-2 bg-white/20 rounded" />
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <div className="w-20 h-2 bg-amber-400/20 rounded mb-2" />
              <div className="h-24 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-lg" />
            </div>
          </div>
        );
      case 4: // UI/UX
        return (
          <div className="w-full h-full p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-pink-400/40" />
              <div className="w-3 h-3 rounded-full bg-purple-400/40" />
              <div className="w-3 h-3 rounded-full bg-cyan-400/40" />
            </div>
            <div className="flex-1 bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-xl p-3 flex gap-2.5">
              <div className="w-20 bg-white/5 rounded-lg p-2 flex flex-col gap-1.5">
                <div className="h-2 bg-pink-400/20 rounded w-10" />
                <div className="h-2 bg-white/10 rounded w-14" />
                <div className="h-2 bg-white/10 rounded w-12" />
                <div className="h-2 bg-white/10 rounded w-16" />
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-2">
                <div className="w-16 h-2 bg-white/10 rounded mb-2" />
                <div className="grid grid-cols-2 gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-pink-500/10 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5: // Support
        return (
          <div className="w-full h-full p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-blue-400/60" />
              </div>
              <div className="flex-1">
                <div className="w-20 h-2 bg-white/10 rounded mb-1" />
                <div className="w-14 h-1.5 bg-blue-400/20 rounded" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2.5">
              <div className="bg-blue-500/10 rounded-xl p-2.5 flex flex-col">
                <div className="w-6 h-6 bg-blue-400/20 rounded-lg mb-2" />
                <div className="w-12 h-1.5 bg-white/10 rounded mb-1" />
                <div className="w-16 h-1 bg-white/5 rounded" />
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col">
                <div className="w-6 h-6 bg-green-400/20 rounded-lg mb-2" />
                <div className="w-12 h-1.5 bg-white/10 rounded mb-1" />
                <div className="w-16 h-1 bg-white/5 rounded" />
              </div>
              <div className="col-span-2 bg-white/5 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <div className="w-16 h-1.5 bg-green-400/20 rounded" />
                </div>
                <div className="w-full h-1 bg-white/5 rounded mb-1" />
                <div className="w-3/4 h-1 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        className={`relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br ${service.mockupBg} aspect-[4/3] sm:aspect-[16/10]`}
      >
        {/* Glow */}
        <div
          className={`absolute -top-20 -right-20 w-60 h-60 bg-${service.accentColor}-500/10 rounded-full blur-[100px]`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-60 h-60 bg-${service.accentColor}-500/5 rounded-full blur-[100px]`}
        />

        {/* Mockup Content */}
        <div className="relative z-10 w-full h-full">
          {renderMockup()}
        </div>

        {/* Floating Icon */}
        <motion.div
          className={`absolute top-4 right-4 w-10 h-10 rounded-xl bg-${service.accentColor}-500/20 border border-${service.accentColor}-500/30 flex items-center justify-center`}
          animate={reduceMotion || isMobile ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: reduceMotion || isMobile ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <VisualIcon className={`w-5 h-5 text-${service.accentColor}-400`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const ServicesSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="services" className="relative py-[clamp(48px,8vw,112px)] overflow-hidden" ref={ref}>
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-secondary/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-16 sm:mb-24"
        >
          <h2 className="section-title">
            {t('خدماتنا', 'Our Services')}
          </h2>
          <p className="section-subtitle mx-auto max-w-2xl">
            {t(
              'نبني حلولاً رقمية قوية تساعد الشركات على الإطلاق والنمو والتوسع.',
              'We build powerful digital solutions that help businesses launch, grow and scale.'
            )}
          </p>
        </motion.div>

        {/* Services Showcase */}
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            const isReversed = index % 2 !== 0;

            return (
              <div key={index}>
                {/* Service Block */}
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                  {/* Text Side */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
                    className={isReversed ? 'lg:[direction:ltr]' : ''}
                  >
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.5))',
                        boxShadow: `0 0 40px hsl(var(--glow-cyan) / 0.2)`,
                      }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-7 h-7 text-primary relative z-10" />
                      <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, hsl(var(--glow-cyan) / 0.3), hsl(var(--glow-purple) / 0.3))',
                        }}
                      />
                    </motion.div>

                    {/* Number */}
                    <span className="text-sm font-medium text-primary/60 tracking-wider uppercase mb-3 block">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                      {t(service.titleAr, service.titleEn)}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                      {t(service.descAr, service.descEn)}
                    </p>

                    {/* Learn More Button */}
                    <motion.a
                      href="#contact"
                      className="inline-flex items-center gap-2 text-primary font-medium group/btn"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>{t('اعرف المزيد', 'Learn More')}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                    </motion.a>
                  </motion.div>

                  {/* Visual Side */}
                  <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                    <ServiceVisual service={service} index={index} />
                  </div>
                </div>

                {/* Divider */}
                {index < SERVICES.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
                    className="mt-16 sm:mt-24 origin-center"
                  >
                    <div
                      className="h-px w-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, hsl(var(--glass-border) / 0.3), transparent)',
                      }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
