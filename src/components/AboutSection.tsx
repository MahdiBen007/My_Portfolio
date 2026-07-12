import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Target, Users, Rocket, Shield } from 'lucide-react';

type AboutSectionProps = {
  title?: string;
};

export const AboutSection = ({ title }: AboutSectionProps) => {
  const { t, isRTL } = useLanguage();
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

  const values = [
    {
      icon: Target,
      titleAr: 'مهمتنا',
      titleEn: 'Our Mission',
      descAr: 'تمكين الشركات الجزائرية من البيع عبر الإنترنت بسهولة واحترافية',
      descEn: 'Empowering Algerian businesses to sell online with ease and professionalism',
    },
    {
      icon: Users,
      titleAr: 'التركيز على العميل',
      titleEn: 'Customer Focus',
      descAr: 'نفهم احتياجات السوق الجزائري ونقدم حلولاً مخصصة لها',
      descEn: 'We understand the Algerian market needs and deliver tailored solutions',
    },
    {
      icon: Rocket,
      titleAr: 'الابتكار المستمر',
      titleEn: 'Continuous Innovation',
      descAr: 'نطور منصتنا باستمرار لتواكب أحدث تقنيات التجارة الإلكترونية',
      descEn: 'We continuously develop our platform to keep up with the latest e-commerce tech',
    },
    {
      icon: Shield,
      titleAr: 'الموثوقية والأمان',
      titleEn: 'Reliability & Security',
      descAr: 'نضمن أمان بياناتك وعملاءك بأعلى معايير الحماية',
      descEn: 'We ensure the security of your data and customers with the highest standards',
    },
  ];

  return (
    <section id="about" className="relative py-[clamp(48px,8vw,112px)] overflow-hidden" ref={ref}>
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-10 sm:mb-16"
        >
          <h2 className="section-title">{title ?? t('عن StoreCraft', 'About StoreCraft')}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Company Story */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
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

          {/* Values & Timeline */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.25, ease: EASE_OUT }}
            className="relative"
          >
            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.4 + idx * 0.1 }}
                  className="glass-card rounded-xl p-4"
                >
                  <value.icon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold text-sm mb-1">{t(value.titleAr, value.titleEn)}</h4>
                  <p className="text-xs text-muted-foreground">{t(value.descAr, value.descEn)}</p>
                </motion.div>
              ))}
            </div>

            {/* Timeline */}
            <h3 className="text-xl font-bold mb-6">{t('مسيرة المنصة', 'Platform Journey')}</h3>
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
