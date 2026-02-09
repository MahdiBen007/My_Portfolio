import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { skillBrandColors, skillIcons } from '@/components/skills/skillAssets';

type SkillsSectionProps = {
  title?: string;
  subtitle?: string;
};

export const SkillsSection = ({ title, subtitle }: SkillsSectionProps) => {
  const { t } = useLanguage();
  const { data } = usePortfolioData();
  const { skills, skillCategories } = data;

  const [activeFilter, setActiveFilter] = useState('all');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const filteredSkills = skills.filter((skill) => {
    const categoryVisible = skillCategories.find((c) => c.id === skill.category)?.visible !== false;
    const matchesFilter = activeFilter === 'all' || skill.category === activeFilter;
    return categoryVisible && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.12,
      },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, ease: EASE_OUT },
    },
  };

  return (
    <section
      id="skills"
      className="relative py-[clamp(64px,8vw,112px)] scroll-mt-28 lg:scroll-mt-32"
      ref={ref}
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-12"
        >
          <h2 className="section-title">
            {title ?? t('المهارات التقنية', 'Technical Skills')}
          </h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t(
              'مجموعة واسعة من التقنيات والأدوات التي أتقنها',
              'A wide range of technologies and tools I have mastered'
            )}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.18, ease: EASE_OUT }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {skillCategories
            .filter((cat) => cat.visible !== false)
            .map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === category.id
                    ? 'bg-gradient-glow text-background shadow-glow'
                    : 'glass-card hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(category.label, category.labelEn)}
              </motion.button>
            ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl mx-auto"
        >
          {filteredSkills.map((skill, index) => {
            const iconKey = (skill.icon ?? '').toLowerCase();
            const brand = skill.customColor
              ? { color: skill.customColor, glow: `${skill.customColor}40` }
              : skillBrandColors[iconKey] ?? { color: '#22d3ee', glow: 'rgba(34,211,238,0.35)' };

            const category = skillCategories.find((c) => c.id === skill.category);

            return (
              <motion.div
                key={`${skill.name}-${skill.category}-${index}`}
                variants={skillVariants}
                className="group glass-card rounded-2xl p-6 aspect-[5/2] w-[220px] md:w-[240px] flex flex-col items-center justify-center text-center shadow-card overflow-hidden relative"
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                  style={{
                    color: brand.color,
                    boxShadow: `0 10px 35px ${brand.glow}`,
                    background: 'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.45))',
                  }}
                >
                  {skillIcons[iconKey] ?? skillIcons.react}
                </div>
                <p className="font-semibold text-base md:text-lg leading-tight">
                  {t(skill.name, skill.nameEn)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
