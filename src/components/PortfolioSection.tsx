import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Laptop,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { projects, projectCategories } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const PortfolioSection = () => {
  const { t, isRTL } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const filteredProjects = sortedProjects.filter(
    (project) => activeFilter === 'all' || project.category === activeFilter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const nextImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === (selectedProject.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? (selectedProject.images?.length ?? 1) - 1 : prev - 1
    );
  };

  useEffect(() => {
    const root = document.documentElement;
    if (selectedProject) {
      root.classList.add('hide-navbar');
    } else {
      root.classList.remove('hide-navbar');
    }
    return () => root.classList.remove('hide-navbar');
  }, [selectedProject]);

  return (
    <section id="portfolio" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">
            {t('مشاريعي المميزة', 'Featured Projects')}
          </h2>
          <p className="section-subtitle mx-auto">
            {t(
              'مجموعة مختارة من أفضل المشاريع التي عملت عليها',
              'A curated selection of the best projects I have worked on'
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {projectCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="glass-card rounded-2xl overflow-hidden shadow-card group flex flex-col h-full"
              whileHover={{ y: -10, scale: 1.01 }}
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/18 via-cyan-400/12 to-purple-500/18 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <Laptop className="w-9 h-9 text-muted-foreground" />
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentImageIndex(0);
                  }}
                  className="text-xs font-semibold text-muted-foreground/80 hover:text-primary transition-colors underline underline-offset-4"
                >
                  {t('عرض التفاصيل', 'View details')}
                </button>
                {project.featured && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-semibold">
                    <Star className="w-3.5 h-3.5" /> {t('مميز', 'Featured')}
                  </span>
                )}
                {project.status && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-slate-900">
                    {project.status === 'completed' ? t('منجز', 'Completed') : t('قيد التنفيذ', 'In Progress')}
                  </span>
                )}
              </div>

              <div className="flex-1 p-6 space-y-4 flex flex-col justify-between bg-black/20 backdrop-blur">
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold leading-tight">
                    {t(project.title, project.titleEn)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(project.shortDescription, project.shortDescriptionEn)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                    className="btn-secondary inline-flex items-center justify-center gap-2 px-5"
                    aria-label={t('عرض التفاصيل', 'View details')}
                  >
                    <Target className="w-4 h-4" />
                    {t('التفاصيل', 'Details')}
                  </button>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary btn-shine inline-flex items-center justify-center gap-2 px-6"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('معاينة', 'Live')}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-[min(1100px,94vw)] max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-night-start to-night-mid border border-white/10 shadow-glow"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0 lg:gap-6">
                {/* Gallery */}
                <div className="relative bg-black/40">
                  <img
                    src={selectedProject.images?.[currentImageIndex] ?? '/project-placeholder.jpg'}
                    alt={t(selectedProject.title, selectedProject.titleEn)}
                    className="w-full h-[320px] lg:h-full object-cover"
                  />
                  {selectedProject.images && selectedProject.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <button
                        onClick={isRTL ? nextImage : prevImage}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={isRTL ? prevImage : nextImage}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold">{t(selectedProject.title, selectedProject.titleEn)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(selectedProject.shortDescription, selectedProject.shortDescriptionEn)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {t('الهدف', 'Goal')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(selectedProject.goal, selectedProject.goalEn)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('التحديات', 'Challenges')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(selectedProject.challenges, selectedProject.challengesEn)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{t('النتيجة', 'Result')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t(selectedProject.result, selectedProject.resultEn)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">{t('التقنيات', 'Tech Stack')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-shine inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> {t('الموقع المباشر', 'Live Preview')}
                    </a>
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary inline-flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

