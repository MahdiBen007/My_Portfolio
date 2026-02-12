import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Moon } from 'lucide-react';
import { navLinks } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMidnightPurple, setIsMidnightPurple] = useState(false);
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

  const collapseScale = 1;
  const collapseOpacity = 1;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="navbar-root fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 backdrop-blur-xl bg-[#0b0f1c]/35"
    >
      <div className="container mx-auto px-6">
        {/* Capsule Navbar Container */}
        <motion.div
          className={`navbar-capsule flex items-center justify-between px-6 py-1 transition-all duration-300 origin-center transform-gpu opacity-100 shadow-glow hover:opacity-80 hover:shadow-none ${
          isScrolled ? 'navbar-capsule-scrolled' : ''
        }`}
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
              <span className="text-xs font-medium">{language === 'ar' ? 'EN' : 'AR'}</span>
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
              className="lg:hidden fixed top-[78px] inset-x-0 z-[70] mx-auto w-[min(88vw,340px)]"
            >
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-b from-night-start via-night-mid to-night-end shadow-glow-lg p-3">
                <div className="rounded-2xl bg-[#0d1733] border border-primary/20 px-2 py-2 space-y-0.5">
                  {navLinks.map((link) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className={`block w-full rounded-xl px-4 py-3 text-center text-[1.05rem] font-semibold transition-colors ${
                        activeSection === link.href.replace('#', '')
                          ? 'text-primary'
                          : 'text-slate-100 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {t(link.label, link.labelEn)}
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
