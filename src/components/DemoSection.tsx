import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ExternalLink,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext';
import { DashboardLightbox } from '@/components/DashboardLightbox';
import { supabase } from '@/integrations/supabase/client';

interface DashboardScreenshot {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  image_url: string;
  video_url: string | null;
  demo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export const DemoSection = () => {
  const { t, isRTL } = useLanguage();
  const { setSectionVisible } = useSectionVisibility();
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isVideoInView = useInView(videoRef, { margin: '0px' });
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const [screenshots, setScreenshots] = useState<DashboardScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [demoUrl, setDemoUrl] = useState<string>('');
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_screenshots')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setScreenshots(data || []);

        const { data: settings } = await supabase
          .from('settings')
          .select('demo_video_url, demo_url')
          .single();

        if (settings) {
          if (settings.demo_video_url) setVideoUrl(settings.demo_video_url);
          if (settings.demo_url) setDemoUrl(settings.demo_url);
        }

        const hasScreenshots = (data && data.length > 0) || settings?.demo_video_url || settings?.demo_url;
        setSectionVisible('demo', Boolean(hasScreenshots));
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScreenshots();
  }, [setSectionVisible]);

  const currentVideoUrl = screenshots[activeSlide]?.video_url || videoUrl;
  const hasVideo = screenshots.some(s => s.video_url) || !!videoUrl;

  const isYouTube = currentVideoUrl?.includes('youtube.com') || currentVideoUrl?.includes('youtu.be');
  const isVimeo = currentVideoUrl?.includes('vimeo.com');
  const isDirectVideo = currentVideoUrl?.includes('.mp4') || currentVideoUrl?.includes('.webm') || currentVideoUrl?.includes('.ogg');

  useEffect(() => {
    if (isVideoInView && currentVideoUrl) {
      setVideoKey((k) => k + 1);
    }
  }, [isVideoInView, currentVideoUrl]);

  const getVideoEmbedUrl = (url: string): string => {
    if (!url) return '';
    const origin = encodeURIComponent(window.location.origin);
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&origin=${origin}&mute=1` : url;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?api=1&muted=1` : url;
    }
    return url;
  };

  const goNext = useCallback(() => {
    if (screenshots.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const goPrev = useCallback(() => {
    if (screenshots.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(goNext, 3000);
  }, [goNext]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isInView || screenshots.length === 0 || hasVideo) return;
    startAutoPlay();
    return stopAutoPlay;
  }, [isInView, startAutoPlay, stopAutoPlay, screenshots.length, hasVideo]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    stopAutoPlay();
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    startAutoPlay();
  };

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        if (isRTL) { goPrev(); } else { goNext(); }
      } else {
        if (isRTL) { goNext(); } else { goPrev(); }
      }
      stopAutoPlay();
      setTimeout(startAutoPlay, 4000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.12, staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  };

  if (!loading && screenshots.length === 0 && !videoUrl) return null;

  const renderMediaContent = () => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#0B1120' }}>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (screenshots.length === 0 && !videoUrl) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0B1120' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-white/15" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-medium text-white/40">
              {t('لا توجد لقطات شاشة بعد', 'No screenshots yet')}
            </p>
            <p className="text-xs text-white/20">
              {t('أضف لقطات شاشة من لوحة الإدارة', 'Add screenshots from the admin panel')}
            </p>
          </div>
        </div>
      );
    }

    if (screenshots.length > 0) {
      return (
        <div
          className="absolute inset-0"
          style={{ zIndex: isVideoInView && currentVideoUrl ? 0 : 5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="absolute inset-0"
            >
              <img
                src={screenshots[activeSlide]?.image_url}
                alt={t(screenshots[activeSlide]?.title_ar, screenshots[activeSlide]?.title)}
                className="w-full h-full object-contain"
                draggable={false}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  const renderVideo = () => {
    if (!currentVideoUrl || !isVideoInView) return null;

    if (isDirectVideo) {
      return (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <video
            key={videoKey}
            src={currentVideoUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted
            controls
            playsInline
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <iframe
          key={videoKey}
          src={getVideoEmbedUrl(currentVideoUrl)}
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={t(screenshots[activeSlide]?.title_ar || 'Dashboard', screenshots[activeSlide]?.title || 'Dashboard')}
        />
      </div>
    );
  };

  return (
    <>
    <section id="demo" className="relative py-[clamp(48px,8vw,112px)] overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-secondary/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-10 sm:mb-16"
        >
          <h2 className="section-title">
            {t('لوحة تحكم قوية', 'Powerful Admin Dashboard')}
          </h2>
          <p className="section-subtitle mx-auto max-w-2xl">
            {t(
              'أدر منتجاتك وطلباتك وعملاءك وعملك من لوحة تحكم واحدة جميلة.',
              'Manage your products, orders, customers and business from one beautiful dashboard.'
            )}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={cardVariants} className="relative">
            <div className="relative rounded-b-2xl overflow-hidden border border-white/[0.06] border-t-0">
              <div
                ref={videoRef}
                className="relative w-full aspect-[16/9] overflow-hidden"
                style={{ backgroundColor: '#0B1120' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {renderMediaContent()}
                {renderVideo()}

                {!loading && screenshots.length > 0 && !hasVideo && (
                  <>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
                      <div className="glass-card px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
                        <span>{t('اضغط للعرض', 'Click to view')}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <div className="glass-card px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10">
                        {t(screenshots[activeSlide]?.title_ar, screenshots[activeSlide]?.title)}
                      </div>
                    </div>
                  </>
                )}

                {!loading && screenshots.length > 0 && !hasVideo && (
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 py-3 bg-gradient-to-t from-black/60 to-transparent">
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveSlide(index);
                          stopAutoPlay();
                          setTimeout(startAutoPlay, 4000);
                        }}
                        className={`rounded-full transition-all duration-300 ${
                          activeSlide === index
                            ? 'w-5 h-1.5 bg-primary'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative z-10 p-6 sm:p-8 text-center" style={{ backgroundColor: '#0B1120' }}>
                <p className="text-base sm:text-lg text-muted-foreground mb-5 leading-relaxed max-w-2xl mx-auto">
                  Manage your products, orders, customers and business from one beautiful dashboard.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap pointer-events-auto">
                  {demoUrl ? (
                    <motion.a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-shine inline-flex items-center justify-center gap-2 py-3"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {t('جرّب لوحة التحكم', 'Try Dashboard Demo')}
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  ) : (
                    <motion.div
                      className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground cursor-not-allowed"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {t('جرّب لوحة التحكم', 'Try Dashboard Demo')}
                      <ExternalLink className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <DashboardLightbox
        images={screenshots}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={lightboxNext}
        onPrev={lightboxPrev}
      />
    </section>
    </>
  );
};
