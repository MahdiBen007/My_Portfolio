import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LightboxImage {
  id: string;
  image_url: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
}

interface DashboardLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const DashboardLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: DashboardLightboxProps) => {
  const { t, isRTL } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { if (isRTL) { onPrev(); } else { onNext(); } }
      if (e.key === 'ArrowLeft') { if (isRTL) { onNext(); } else { onPrev(); } }
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoom(1);
    },
    [onClose, onNext, onPrev, isRTL]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setZoom(1);
  }, [currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="relative w-full max-w-6xl max-h-[90vh] mx-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] backdrop-blur-sm rounded-t-2xl border border-white/[0.06] border-b-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t(current.title_ar, current.title)}
                  </h3>
                  {current.description && (
                    <p className="text-xs text-white/50 mt-0.5">
                      {t(current.description_ar, current.description)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-white/40">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-white/50 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative flex-1 bg-black/50 border-x border-white/[0.06] overflow-hidden flex items-center justify-center min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="w-full h-full flex items-center justify-center p-4 overflow-auto"
                >
                  <img
                    src={current.image_url}
                    alt={t(current.title_ar, current.title)}
                    className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Nav arrows */}
              <motion.button
                onClick={(e) => { e.stopPropagation(); if (isRTL) { onNext(); } else { onPrev(); } }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); if (isRTL) { onPrev(); } else { onNext(); } }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white/[0.03] backdrop-blur-sm rounded-b-2xl border border-white/[0.06] border-t-0">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(1);
                    if (index > currentIndex) {
                      for (let i = currentIndex; i < index; i++) onNext();
                    } else if (index < currentIndex) {
                      for (let i = currentIndex; i > index; i--) onPrev();
                    }
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'w-5 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
