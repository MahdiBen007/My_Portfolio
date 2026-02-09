import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

type AboutSectionProps = {
  title?: string;
};

export const AboutSection = ({ title }: AboutSectionProps) => {
  const { t } = useLanguage();
  const { data } = usePortfolioData();
  const { personalData, experience } = data;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const hasBio = Boolean(personalData.aboutBio || personalData.aboutBioEn);
  const hasExperience = experience && experience.length > 0;

  if (!hasBio && !hasExperience) {
    return null;
  }

  return (
    <section id="about" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-16"
        >
          <h2 className="section-title">{title ?? t('\u0646\u0628\u0630\u0629 \u0639\u0646\u064a', 'About Me')}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.15, ease: EASE_OUT }}
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
            transition={{ duration: 0.95, delay: 0.25, ease: EASE_OUT }}
            className="relative"
          >
            <h3 className="text-xl font-bold mb-6">{t('\u0627\u0644\u062e\u0628\u0631\u0627\u062a', 'Experience')}</h3>
            <div className="relative">
              <div className="timeline-line" />
              <div className="space-y-8">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={exp.id ?? idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.5 + idx * 0.12 }}
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
