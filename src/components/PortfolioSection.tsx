import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  ShoppingCart,
  Layout,
  Globe,
  Zap,
  BarChart3,
  Flower2,
  Shirt,
  Cpu,
  Gem,
  UtensilsCrossed,
  Armchair,
  Grid3X3,
  Link2,
} from 'lucide-react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Grid3X3,
  Flower2,
  Shirt,
  Cpu,
  Sparkles,
  Gem,
  UtensilsCrossed,
  Armchair,
};

type PortfolioSectionProps = {
  title?: string;
  subtitle?: string;
  featuredOnly?: boolean;
};

export const PortfolioSection = ({ title, subtitle, featuredOnly = false }: PortfolioSectionProps) => {
  const { t, isRTL } = useLanguage();
  const { setSectionVisible } = useSectionVisibility();
  const { data } = usePortfolioData();
  const { projects, projectCategories } = data;
  const [activeFilter, setActiveFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data: settings } = await supabase.from('settings').select('featured_category').limit(1).single();
        if (settings?.featured_category) {
          setActiveFilter(settings.featured_category);
        }
      } catch { /* ignore */ }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('#portfolio')) {
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const pkg = params.get('package');
        if (pkg && ['starter', 'business', 'premium', 'all'].includes(pkg)) {
          setPackageFilter(pkg);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    setSectionVisible('portfolio', projects.length > 0);
  }, [projects, setSectionVisible]);

  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;
  const isProjectOpen = Boolean(selectedProject);

  useEffect(() => {
    const fab = document.querySelector('.whatsapp-fab') as HTMLElement;
    if (fab) fab.style.display = isProjectOpen ? 'none' : '';
  }, [isProjectOpen]);

  const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const visibleProjects = featuredOnly
    ? sortedProjects.filter((project) => project.featured)
    : sortedProjects;
  const filteredProjects = visibleProjects.filter(
    (project) => (activeFilter === 'all' || project.category === activeFilter) &&
      (packageFilter === 'all' || (project.packageType ?? 'other') === packageFilter)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 48, scale: 0.96, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: EASE_OUT },
    },
  };

  const getVideoEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    return url;
  };

  const nextImage = useCallback(() => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === (selectedProject.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  }, [selectedProject]);

  const prevImage = useCallback(() => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? (selectedProject.images?.length ?? 1) - 1 : prev - 1
    );
  }, [selectedProject]);

  const autoSlideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [manualNavKey, setManualNavKey] = useState(0);

  const handleManualPrev = useCallback(() => {
    if (isRTL) { nextImage(); } else { prevImage(); }
    setManualNavKey((k) => k + 1);
  }, [isRTL, nextImage, prevImage]);

  const handleManualNext = useCallback(() => {
    if (isRTL) { prevImage(); } else { nextImage(); }
    setManualNavKey((k) => k + 1);
  }, [isRTL, nextImage, prevImage]);

  useEffect(() => {
    const root = document.documentElement;
    if (isProjectOpen) {
      root.classList.add('hide-navbar');
    } else {
      root.classList.remove('hide-navbar');
    }
    return () => root.classList.remove('hide-navbar');
  }, [isProjectOpen]);

  useEffect(() => {
    if (!isProjectOpen) return;
    const root = document.documentElement;
    const body = document.body;
    const previousStyles = {
      bodyOverflow: body.style.overflow,
      rootOverflow: root.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      overscrollBehavior: root.style.overscrollBehavior,
    };
    body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    root.style.overscrollBehavior = 'none';
    return () => {
      body.style.overflow = previousStyles.bodyOverflow;
      root.style.overflow = previousStyles.rootOverflow;
      body.style.overscrollBehavior = previousStyles.bodyOverscrollBehavior;
      root.style.overscrollBehavior = previousStyles.overscrollBehavior;
    };
  }, [isProjectOpen]);

  useEffect(() => {
    if (!selectedProject) return;
    const total = selectedProject.images?.length ?? 0;
    if (total === 0) return;
    if (currentImageIndex >= total) {
      setCurrentImageIndex(0);
    }
  }, [selectedProject, currentImageIndex]);

  useEffect(() => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
    if (!selectedProject || isImageHovered) return;
    if (selectedProject.videoUrl) return;
    const total = selectedProject.images?.length ?? 0;
    if (total <= 1) return;
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    }, 2000);
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [selectedProject, isImageHovered, manualNavKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/90 text-white';
      case 'in_progress': return 'bg-amber-500/90 text-white';
      case 'planned': return 'bg-blue-500/90 text-white';
      default: return 'bg-emerald-500/90 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('مكتمل', 'Completed');
      case 'in_progress': return t('قيد التنفيذ', 'In Progress');
      case 'planned': return t('مخطط', 'Planned');
      default: return t('مكتمل', 'Completed');
    }
  };

  if (visibleProjects.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="relative py-[clamp(48px,8vw,112px)] overflow-x-hidden" ref={ref}>
      <div className="container mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-12"
        >
          <h2 className="section-title">
            {title ?? t('معرض المشاريع', 'Projects')}
          </h2>
          <p className="section-subtitle mx-auto">
            {subtitle ?? t(
              'مجموعة مختارة من مشاريعنا الإبداعية الناجحة',
              'A curated selection of our successful creative projects'
            )}
          </p>
        </motion.div>

        {/* Category Filters */}
        {!featuredOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.18, ease: EASE_OUT }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3"
          >
            {projectCategories.map((category) => {
              const IconComponent = category.icon ? categoryIcons[category.icon] : null;
              const isActive = activeFilter === category.id;
  return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 min-h-[38px] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                      : 'glass-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {IconComponent && <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {t(category.label, category.labelEn)}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Package Filters - Small pill style */}
        {!featuredOnly && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE_OUT }}
            className="flex flex-wrap items-center justify-center gap-1.5 mb-10 sm:mb-14"
          >
            <span className="text-[11px] text-muted-foreground/60 me-1 hidden sm:inline">{t('الباقة:', 'Package:')}</span>
            {[
              { id: 'all', label: t('الكل', 'All') },
              { id: 'starter', label: t('الأساسي', 'Starter'), color: 'text-blue-400' },
              { id: 'business', label: t('الاحترافي', 'Business'), color: 'text-yellow-400' },
              { id: 'premium', label: t('الفاخر', 'Premium'), color: 'text-purple-400' },
            ].map((tab) => {
              const isActive = packageFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPackageFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 border ${
                    isActive
                      ? tab.id === 'all'
                        ? 'bg-white/10 border-white/20 text-white'
                        : `bg-white/[0.07] border-white/15 ${tab.color}`
                      : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-5 lg:gap-6 w-full mx-auto max-w-7xl"
        >
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="w-full text-center py-16 sm:py-20"
            >
              <div className="relative mx-auto w-14 h-14 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-md" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/[0.06] flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary/40" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5">
                {t('لا توجد مشاريع', 'No Projects Found')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground/50 max-w-[260px] mx-auto leading-relaxed">
                {t('لم يتم العثور على مشاريع تطابق الفلتر الحالي', 'No projects match the current filter')}
              </p>
            </motion.div>
          )}
          {filteredProjects.map((project) => {
            const accent = project.accentColor || 'hsl(var(--glow-cyan))';
            return (
              <motion.div
                key={project.id}
                variants={cardVariants}
                className="project-card group relative flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-b-2xl overflow-hidden border border-white/[0.08] bg-[#0B1120] min-w-0"
                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                whileHover={{ scale: 1.025, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Thumbnail */}
                <div className="project-card-image relative w-full overflow-hidden bg-[#0B1120]">
                  {project.images?.[0] ? (
                    <img
                      src={project.images[0]}
                      alt={t(project.title, project.titleEn)}
                      className="w-full aspect-[16/9] object-cover block"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full aspect-[16/9] flex items-center justify-center relative overflow-hidden';
                          fallback.innerHTML = '<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div><div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, hsl(var(--foreground) / 0.15) 1px, transparent 0); background-size: 24px 24px;"></div><div class="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center"><svg class="w-7 h-7 text-primary/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg></div>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--foreground) / 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-primary/60" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay - Desktop only */}
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                    className="absolute inset-0 bg-black/0 opacity-0 group-hover:bg-black/30 group-hover:opacity-100 transition-all duration-300 ease-out items-center justify-center cursor-pointer hidden sm:flex"
                  >
                    <span className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Eye className="w-4 h-4" />
                      {t('عرض التفاصيل', 'View Details')}
                    </span>
                  </button>

                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-[11px] font-semibold z-10 ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  {/* Package Badge */}
                  {project.packageType && project.packageType !== 'other' && (
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-[11px] font-semibold z-10 ${
                      project.packageType === 'starter'
                        ? 'bg-gradient-to-r from-blue-500/90 to-blue-400/90 text-white'
                        : project.packageType === 'business'
                          ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-400/90 text-white'
                          : 'bg-gradient-to-r from-purple-500/90 to-purple-400/90 text-white'
                    }`}>
                      {t(
                        project.packageType === 'starter' ? 'أساسي' : project.packageType === 'business' ? 'احترافي' : 'فاخر',
                        project.packageType.charAt(0).toUpperCase() + project.packageType.slice(1)
                      )}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 min-w-0 overflow-hidden">
                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 text-center">
                    {t(project.title, project.titleEn)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2 leading-relaxed">
                    {t(project.shortDescription, project.shortDescriptionEn)}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-muted-foreground">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <motion.button
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentImageIndex(0);
                      }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      {t('التفاصيل', 'Details')}
                    </motion.button>
                    <motion.a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 transition-all text-sm font-medium text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 className="w-4 h-4" />
                      {t('الموقع', 'Website')}
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT }}
          className="mt-20 text-center"
        >
          <div className="glass-card glow-border rounded-3xl p-10 md:p-14 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--glow-cyan)/0.08),transparent_70%)]" />

            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-glow shadow-glow">
                <Layout className="w-8 h-8 text-background" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold">
                {t('تريد مشروعاً مماثلاً؟', 'Want a Project Like This?')}
              </h3>

              <p className="text-muted-foreground max-w-lg mx-auto">
                {t(
                  'نبني منصات مخصصة تتناسب مع علامتك التجارية واحتياجات عملك',
                  'We build custom platforms tailored to your brand and business needs'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <motion.a
                  href="#contact"
                  className="btn-primary btn-shine btn-laser inline-flex items-center gap-2 px-8 py-3.5"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('احصل على منصة مخصصة', 'Get a Custom Platform')}
                  <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                </motion.a>
                <motion.a
                  href="#demo"
                  className="btn-secondary btn-laser inline-flex items-center gap-2 px-8 py-3.5"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('جرب المنصة', 'Try the Platform')}
                </motion.a>
              </div>

              <div className="flex items-center justify-center gap-8 pt-6 border-t border-white/10">
                {[
                  { icon: Globe, value: '50+', label: t('مشروع نشط', 'Active Projects') },
                  { icon: Zap, value: '99.9%', label: t('وقت التشغيل', 'Uptime') },
                  { icon: BarChart3, value: '3x', label: t('نمو المبيعات', 'Growth') },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ y: 30, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-[1000px] max-h-[88vh] overflow-hidden rounded-2xl bg-[#0B1120] border border-white/[0.08] shadow-[0_0_80px_rgba(120,80,255,0.08)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_14px_rgba(239,68,68,0.45)] hover:bg-red-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col md:flex-row max-h-[88vh]">
                {/* Left: Image */}
                <div className="relative md:w-[52%] shrink-0 flex flex-col bg-[#0d1220]">
                  {/* Browser Chrome - Desktop only */}
                  <div className="hidden md:flex items-center gap-2 px-3.5 py-2.5 bg-[#161d2e] border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/30 border border-white/[0.06] text-[11px] text-white/40">
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        <span className="truncate">127.0.0.1:8000</span>
                      </div>
                    </div>
                  </div>

                  {/* Image Area */}
                  <div
                    className="relative flex-1 min-h-[200px] sm:min-h-[260px] md:min-h-[400px] overflow-hidden bg-[#0a0e1a]"
                    onMouseEnter={() => setIsImageHovered(true)}
                    onMouseLeave={() => setIsImageHovered(false)}
                  >
                    {selectedProject.videoUrl ? (
                      <iframe
                        src={getVideoEmbedUrl(selectedProject.videoUrl)}
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={t(selectedProject.title, selectedProject.titleEn)}
                      />
                    ) : selectedProject.images?.[currentImageIndex] ? (
                      <img
                        src={selectedProject.images[currentImageIndex]}
                        alt={t(selectedProject.title, selectedProject.titleEn)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--foreground) / 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-primary/60" />
                        </div>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {!selectedProject.videoUrl && selectedProject.images && selectedProject.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleManualPrev(); }}
                          className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleManualNext(); }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[11px] text-white/70 font-medium transition-all duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}>
                          {currentImageIndex + 1} / {selectedProject.images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col overflow-y-auto">
                  {/* Title + Description */}
                  <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      {t(selectedProject.title, selectedProject.titleEn)}
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                      {t(selectedProject.shortDescription, selectedProject.shortDescriptionEn)}
                    </p>
                  </div>

                  {/* Goal */}
                  {selectedProject.goal && (t(selectedProject.goal, selectedProject.goalEn)) && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                        {t('الهدف', 'Goal')}
                      </h4>
                      <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-4">
                        {t(selectedProject.goal, selectedProject.goalEn)}
                      </p>
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold mb-2">
                      {t('التقنيات', 'Tech Stack')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-muted-foreground font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex items-center gap-3">
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('زيارة الموقع', 'Visit Website')}
                    </a>
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-foreground font-semibold text-sm hover:bg-white/[0.1] transition-all"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .project-card {
          box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 0 0 0 transparent;
          transition: box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .project-card:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.3), 0 0 60px -10px hsl(var(--glow-cyan) / 0.15), 0 0 100px -20px hsl(var(--glow-purple) / 0.1);
        }
        .project-card-image {
          position: relative;
        }
        .project-card-image::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          background: linear-gradient(135deg, hsl(var(--glow-cyan) / 0.05), hsl(var(--glow-purple) / 0.05));
          pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .project-card:hover .project-card-image::after {
          opacity: 1;
        }
      `}</style>
    </section>
  );
};
