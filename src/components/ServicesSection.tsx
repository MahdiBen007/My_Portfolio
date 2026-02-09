import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code, Server, Database, Palette } from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Server,
  Database,
  Palette,
};

type ServicesSectionProps = {
  title?: string;
  subtitle?: string;
};

export const ServicesSection = ({ title, subtitle }: ServicesSectionProps) => {
  const { t } = useLanguage();
  const { data } = usePortfolioData();
  const { services } = data;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 48, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.95, ease: EASE_OUT },
    },
  };

  return (
    <section id="services" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-16"
        >
          <h2 className="section-title">
            {title ?? t('الخدمات', 'Services')}
          </h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t(
              'أقدم مجموعة شاملة من الخدمات لتحويل أفكارك إلى واقع رقمي',
              'I offer a comprehensive range of services to transform your ideas into digital reality'
            )}
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl mx-auto"
        >
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] ?? Code;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="group glass-card glow-border p-6 rounded-2xl text-center shadow-card w-[240px] md:w-[260px] min-h-[230px] flex flex-col items-center"
              >
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.5))',
                    boxShadow: '0 0 35px hsl(var(--glow-cyan) / 0.28)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent className="w-7 h-7 text-primary relative z-10" />
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--glow-cyan) / 0.3), hsl(var(--glow-purple) / 0.3))',
                    }}
                  />
                </motion.div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  {t(service.title, service.titleEn)}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(service.description, service.descriptionEn)}
                </p>

                {/* Hover Line */}
                <motion.div
                  className="h-0.5 mt-5 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  style={{
                    background: 'linear-gradient(90deg, hsl(var(--glow-cyan)), hsl(var(--glow-purple)))',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
