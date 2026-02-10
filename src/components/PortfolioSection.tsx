import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Laptop,
  Play,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

type PortfolioSectionProps = {
  title?: string;
  subtitle?: string;
  featuredOnly?: boolean;
};

export const PortfolioSection = ({ title, subtitle, featuredOnly = false }: PortfolioSectionProps) => {
  const { t, isRTL } = useLanguage();
  const { data } = usePortfolioData();
  const { projects, projectCategories } = data;
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const visibleProjects = featuredOnly
    ? sortedProjects.filter((project) => project.featured)
    : sortedProjects;
  const filteredProjects = visibleProjects.filter(
    (project) => activeFilter === 'all' || project.category === activeFilter
  );

  if (visibleProjects.length === 0) {
    return null;
  }

  const ProjectThumbnailFallback = ({ className = '' }: { className?: string }) => {
    return (
      <div
        className={`h-full w-full bg-gradient-to-br from-night-start via-night-mid to-night-end ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(var(--glow-cyan)/0.22),transparent_55%),radial-gradient(circle_at_80%_75%,hsl(var(--glow-purple)/0.20),transparent_55%)]" />
        <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-6">
          <Laptop className="h-14 w-14 text-white/25 drop-shadow" />
          <div className="mt-3 text-xs font-medium tracking-wide text-white/20">
            {t('عرض التفاصيل', 'View details')}
          </div>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.22,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 52, scale: 0.96, rotateX: 8, filter: 'blur(7px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: EASE_OUT },
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

  useEffect(() => {
    if (!selectedProject) return;
    const total = selectedProject.images?.length ?? 0;
    if (total === 0) return;
    if (currentImageIndex >= total) {
      setCurrentImageIndex(0);
    }
  }, [selectedProject, currentImageIndex]);

  const getVideoEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '');
      if (host.includes('youtu.be')) {
        const id = parsed.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (host.includes('youtube.com')) {
        const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop();
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (host.includes('vimeo.com')) {
        const id = parsed.pathname.split('/').pop();
        return id ? `https://player.vimeo.com/video/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoUrl = selectedProject?.videoUrl?.trim() ?? '';
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;
  const hasVideo = Boolean(videoUrl);
  const hasGoal = Boolean(selectedProject?.goal?.trim() || selectedProject?.goalEn?.trim());

  return (
    <section id="portfolio" className="relative py-[clamp(64px,8vw,112px)]" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-12"
        >
          <h2 className="section-title">
            {title ?? t('مشاريعي المميزة', 'Featured Projects')}
          </h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t(
              'مجموعة مختارة من أفضل المشاريع التي عملت عليها',
              'A curated selection of the best projects I have worked on'
            )}
          </p>
        </motion.div>

        {!featuredOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.18, ease: EASE_OUT }}
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
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-4 md:gap-6 w-full mx-auto"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="glass-card rounded-2xl overflow-hidden shadow-card group flex flex-col h-full preserve-3d w-full sm:w-[340px] md:w-[360px]"
              whileHover={{ y: -10, scale: 1.015, rotate: isRTL ? 0.6 : -0.6 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              style={{ transformPerspective: 1200 }}
            >
              <div className="relative aspect-[1360/607] bg-black/40 overflow-hidden">
                {project.images?.[0] ? (
                  <img
                    src={project.images[0]}
                    alt={t(project.title, project.titleEn)}
                    className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.02] bg-black/40"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <ProjectThumbnailFallback />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {project.featured && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-semibold">
                    <Star className="w-3.5 h-3.5" /> {t('مميز', 'Featured')}
                  </span>
                )}
                {project.status && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/85 text-xs font-semibold text-slate-900">
                    {project.status === 'completed' ? t('منجز', 'Completed') : t('قيد التنفيذ', 'In Progress')}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                    className="text-xs font-semibold px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white/20"
                    aria-label={t('عرض التفاصيل', 'View details')}
                  >
                    {t('عرض التفاصيل', 'View details')}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-4 flex flex-col bg-black/20 backdrop-blur">
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold leading-tight">
                    {t(project.title, project.titleEn)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
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

                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentImageIndex(0);
                      }}
                      className="btn-secondary btn-laser inline-flex items-center justify-center gap-2 px-5 h-11 bg-white/5 hover:bg-white/10 whitespace-nowrap"
                      aria-label={t('عرض التفاصيل', 'View details')}
                    >
                      <Target className="w-4 h-4" />
                      {t('التفاصيل', 'Details')}
                    </button>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-shine btn-laser w-full inline-flex items-center justify-center gap-2 px-6 h-11"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('معاينة', 'Live')}
                    </a>
                  </div>
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
                <div className="relative bg-black/40 overflow-hidden group">
                  <div
                    className={`absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs backdrop-blur ${
                      hasVideo ? 'bg-black/60 text-white' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{t('فيديو', 'Video')}</span>
                  </div>
                  {videoUrl ? (
                    embedUrl ? (
                      <iframe
                        src={`${embedUrl}?autoplay=1&mute=1&playsinline=1`}
                        title={t(selectedProject.title, selectedProject.titleEn)}
                        className="w-full h-[220px] sm:h-[280px] lg:h-[420px]"
                        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        autoPlay
                        muted
                        playsInline
                        loop
                        controls
                        preload="metadata"
                        className="w-full h-[220px] sm:h-[280px] lg:h-[420px] object-contain bg-black/60"
                      />
                    )
                  ) : (
                    <>
                      {selectedProject.images?.[currentImageIndex] ? (
                        <img
                          src={selectedProject.images[currentImageIndex]}
                          alt={t(selectedProject.title, selectedProject.titleEn)}
                          className={`w-full h-[220px] sm:h-[280px] lg:h-[420px] object-contain object-center bg-black/40 ${
                            (selectedProject.images?.length ?? 0) > 1 ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => {
                            if ((selectedProject.images?.length ?? 0) > 1) nextImage();
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[420px] bg-black/40">
                          <ProjectThumbnailFallback />
                        </div>
                      )}
                      {selectedProject.images && selectedProject.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <button
                            onClick={isRTL ? nextImage : prevImage}
                            className="p-2 rounded-full bg-black/60 hover:bg-black/80"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={isRTL ? prevImage : nextImage}
                            className="p-2 rounded-full bg-black/60 hover:bg-black/80"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {selectedProject.images && selectedProject.images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
                          {currentImageIndex + 1} / {selectedProject.images.length}
                        </div>
                      )}
                    </>
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

                  {hasGoal && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('الهدف', 'Goal')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(selectedProject.goal, selectedProject.goalEn)}
                      </p>
                    </div>
                  )}

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

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-shine inline-flex items-center justify-center gap-2 px-4 py-2 text-sm h-10"
                    >
                      <ExternalLink className="w-4 h-4" /> {t('الموقع المباشر', 'Live Preview')}
                    </a>
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm h-10"
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

