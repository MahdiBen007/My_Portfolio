import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export const VideoModal = ({ isOpen, onClose, videoUrl, title }: VideoModalProps) => {
  const { t } = useLanguage();
  useEffect(() => {
    const navbar = document.querySelector('.navbar-root') as HTMLElement | null;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const getEmbedUrl = (url: string): string => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            onClick={onClose}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
            style={{ zIndex: 100000 }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Title */}
          {title && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2" style={{ zIndex: 100000 }}>
              <span className="text-sm font-medium text-white/70">{title}</span>
            </div>
          )}

          {/* Video */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            {videoUrl ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full max-w-6xl max-h-[85vh] rounded-lg"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title || 'Video'}
              />
            ) : (
              <div className="text-center text-white/60">
                <p className="text-lg mb-2">{t('لم يتم إضافة فيديو بعد', 'No video added yet')}</p>
                <p className="text-sm text-white/40">{t('أضف رابط الفيديو من لوحة الإدارة', 'Add video URL from admin panel')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
