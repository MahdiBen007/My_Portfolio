import { motion } from 'framer-motion';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  const { data } = usePortfolioData();
  const { navLinks } = data;

  return (
    <footer className="relative py-6 sm:py-8 border-t border-glass-border/30">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.a href="#home" whileHover={{ scale: 1.05 }}>
            <img src="/logo-icon.png" alt="StoreCraft" className="h-12 sm:h-16 w-auto logo-img" />
          </motion.a>

          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors min-h-[32px] flex items-center"
              >
                {t(link.label, link.labelEn)}
              </a>
            ))}
          </nav>

          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            &copy; 2024 StoreCraft DZ. {t('جميع الحقوق محفوظة', 'All rights reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
