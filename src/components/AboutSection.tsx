import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { personalData, experience } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">{t('???', 'About Me')}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              {t(personalData.name, personalData.nameEn)}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t(personalData.aboutBio, personalData.aboutBioEn)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <h3 className="text-xl font-bold mb-6">{t('الخبرات', 'Experience')}</h3>
            <div className="relative">
              <div className="timeline-line" />
              <div className="space-y-8">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={exp.id ?? idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="relative ps-10"
                  >
                    <div className="timeline-dot" style={{ top: '6px' }} />
                    <span className="text-sm text-primary">{t(exp.year, exp.yearEn)}</span>
                    <h4 className="font-semibold">{t(exp.title, exp.titleEn)}</h4>
                    <p className="text-sm text-muted-foreground">{t(exp.company || '', exp.companyEn || '')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
