import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Moon, ChevronRight, Sparkles } from 'lucide-react';
import { navLinks } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMidnightPurple, setIsMidnightPurple] = useState(false);
  const [isNavAwake, setIsNavAwake] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = navLinks.map((link) => link.href.replace('#', ''));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  useEffect(() => {
    if (isMidnightPurple) {
      document.documentElement.classList.add('midnight-purple');
    } else {
      document.documentElement.classList.remove('midnight-purple');
    }
  }, [isMidnightPurple]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navAwake = isNavAwake || isMobileMenuOpen;
  const collapseScale = 1;
  const collapseOpacity = 1;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="navbar-root fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2 backdrop-blur-xl bg-[#0b0f1c]/80"
      onMouseEnter={() => setIsNavAwake(true)}
      onMouseLeave={() => setIsNavAwake(false)}
    >
      <div className="container mx-auto px-6">
        {/* Capsule Navbar Container */}
        <motion.div
          className={`navbar-capsule flex items-center justify-between px-6 py-2 transition-all duration-300 origin-center transform-gpu ${
          isScrolled ? 'navbar-capsule-scrolled' : ''
        } ${navAwake ? 'opacity-100 shadow-glow' : 'opacity-80 nav-breathe'}`}
          style={{
            scaleX: collapseScale,
            opacity: collapseOpacity,
            pointerEvents: collapseScale < 0.05 ? 'none' : 'auto',
          }}
        >
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            className="text-xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {'<Dev />'}
          </motion.a>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`nav-link font-medium leading-tight transition-colors text-[clamp(0.85rem,0.5vw+0.8rem,0.98rem)] ${
                  activeSection === link.href.replace('#', '')
                    ? 'text-primary active'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ y: -2 }}
              >
                {t(link.label, link.labelEn)}
              </motion.a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={() => setIsMidnightPurple(!isMidnightPurple)}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors leading-none"
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              title={isMidnightPurple ? 'Night Mode' : 'Midnight Purple'}
            >
              <Moon className="w-4 h-4" />
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language === 'ar' ? 'EN' : '?'}</span>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-full bg-glass/30 border border-glass-border/30"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="lg:hidden mx-4 mt-3 relative z-10"
            >
              <div className="rounded-3xl border border-glass-border/50 bg-gradient-to-b from-night-start/90 via-night-mid/88 to-night-end/92 shadow-glow-lg backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('التنقل', 'Navigation')}</span>
                  </div>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="py-2 divide-y divide-white/5">
                  {navLinks.map((link) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-white/5"
                      whileHover={{ x: 4 }}
                    >
                      <span>{t(link.label, link.labelEn)}</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
