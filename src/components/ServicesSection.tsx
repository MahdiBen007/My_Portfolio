import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code, Server, Database, Palette } from 'lucide-react';
import { services } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Server,
  Database,
  Palette,
};

export const ServicesSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section id="services" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            {t('الخدمات', 'Services')}
          </h2>
          <p className="section-subtitle mx-auto">
            {t(
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
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] ?? Code;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group glass-card glow-border p-8 rounded-2xl"
              >
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.5))',
                    boxShadow: service.hoverEffect === 'glow' ? '0 0 35px hsl(var(--glow-cyan) / 0.35)' : undefined,
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
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {t(service.title, service.titleEn)}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(service.description, service.descriptionEn)}
                </p>

                {/* Hover Line */}
                <motion.div
                  className="h-0.5 mt-6 rounded-full"
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
