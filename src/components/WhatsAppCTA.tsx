import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';

function normalizeWhatsApp(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http')) return trimmed;
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent('Hi! I\'m interested in your services.')}`;
}

export const WhatsAppCTA = () => {
  const controls = useAnimation();
  const [clickRipple, setClickRipple] = useState(false);
  const attentionRef = useRef<ReturnType<typeof setInterval>>();
  const { data } = usePortfolioData();

  const href = normalizeWhatsApp(data?.personalData?.whatsapp ?? '');

  useEffect(() => {
    if (!href) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;
    attentionRef.current = setInterval(() => {
      controls.start({
        y: [0, -8, 0],
        scale: [1, 1.08, 1],
        filter: [
          'drop-shadow(0 0 10px rgba(37,211,102,0.5))',
          'drop-shadow(0 0 28px rgba(37,211,102,0.9))',
          'drop-shadow(0 0 10px rgba(37,211,102,0.5))',
        ],
        transition: { duration: 0.6, ease: 'easeInOut' },
      });
    }, 5000);
    return () => clearInterval(attentionRef.current);
  }, [controls, href]);

  const handleClick = () => {
    setClickRipple(true);
    controls.start({
      scale: [1, 0.88, 1.12, 0.97, 1],
      rotate: [0, -6, 6, -3, 0],
      transition: { duration: 0.5, ease: 'easeOut' },
    });
    setTimeout(() => setClickRipple(false), 700);
  };

  if (!href) return null;

  return (
    <div className="whatsapp-fab fixed bottom-7 left-1/2 -translate-x-1/2 z-50 max-md:bottom-5">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        animate={controls}
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        onClick={handleClick}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: 64, height: 64 }}
      >
        <span className="absolute inset-0 rounded-full animate-[wa-pulse_2s_ease-out_infinite] pointer-events-none max-md:animate-none" />
        <span className="absolute inset-0 rounded-full animate-[wa-pulse_2s_ease-out_0.8s_infinite] pointer-events-none max-md:hidden" />
        <span className="absolute inset-0 rounded-full animate-[wa-float_3s_ease-in-out_infinite] pointer-events-none max-md:hidden" />
        {clickRipple && (
          <span className="absolute inset-[-8px] rounded-full animate-[wa-ripple_0.7s_ease-out_forwards] pointer-events-none" />
        )}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10 w-16 h-16 transition-[filter] duration-300"
          style={{ filter: 'drop-shadow(0 0 10px rgba(37,211,102,0.5))' }}
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
            fill="#25D366"
          />
        </svg>
      </motion.a>
    </div>
  );
}
