import { motion } from 'framer-motion';
import { navLinks } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative py-8 border-t border-glass-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.span className="text-xl font-bold gradient-text" whileHover={{ scale: 1.05 }}>
            {'<Dev />'}
          </motion.span>

          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t(link.label, link.labelEn)}
              </a>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2024 {t('جميع الحقوق محفوظة', 'All rights reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};


