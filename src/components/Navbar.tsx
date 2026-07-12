import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Moon, Home, Tag, Monitor, Briefcase, Wrench, Phone } from 'lucide-react';
import { navLinks } from '@/data/portfolio-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext';

const sectionIcons: Record<string, typeof Home> = {
  home: Home,
  pricing: Tag,
  demo: Monitor,
  portfolio: Briefcase,
  services: Wrench,
  contact: Phone,
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMidnightPurple, setIsMidnightPurple] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { sections } = useSectionVisibility();

  const filteredNavLinks = navLinks.filter((link) => {
    const section = link.href.replace('#', '');
    if (section === 'home' || section === 'contact') return true;
    if (section === 'pricing') return sections.pricing;
    if (section === 'demo') return sections.demo;
    if (section === 'portfolio') return sections.portfolio;
    if (section === 'services') return sections.services;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const secs = filteredNavLinks.map((link) => link.href.replace('#', ''));
      for (const sec of secs.reverse()) {
        const element = document.getElementById(sec);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredNavLinks]);

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
      className="navbar-root fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2.5 sm:py-3 backdrop-blur-xl bg-[#0b0f1c]/35"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Capsule Navbar Container */}
        <motion.div
          className={`navbar-capsule flex items-center px-4 sm:px-6 py-1 transition-all duration-300 origin-center transform-gpu opacity-100 shadow-glow hover:opacity-80 hover:shadow-none ${
          isScrolled ? 'navbar-capsule-scrolled' : ''
        }`}
          style={{
            scaleX: collapseScale,
            opacity: collapseOpacity,
            pointerEvents: collapseScale < 0.05 ? 'none' : 'auto',
          }}
        >
          {/* Logo + Divider */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            className="flex items-center gap-3 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/logo-icon.png" alt="StoreCraft" className="h-8 sm:h-10 w-auto logo-img" />
            <div className="w-px h-5 bg-white/15" />
          </motion.a>

          {/* Mobile Center Controls */}
          <div className="flex lg:hidden items-center gap-1.5 ml-auto">
            <motion.button
              onClick={() => setIsMidnightPurple(!isMidnightPurple)}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors leading-none min-w-[36px] min-h-[36px] flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              title={isMidnightPurple ? 'Night Mode' : 'Midnight Purple'}
            >
              <Moon className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors flex items-center gap-1 min-w-[36px] min-h-[36px] justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language === 'ar' ? 'EN' : 'AR'}</span>
            </motion.button>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-2 xl:gap-4">
            {filteredNavLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`nav-link font-medium leading-none whitespace-nowrap transition-colors text-[clamp(0.78rem,0.4vw+0.75rem,0.9rem)] ${
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

          {/* Desktop Controls + Divider */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <div className="w-px h-5 bg-white/15" />
            <motion.button
              onClick={() => setIsMidnightPurple(!isMidnightPurple)}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors leading-none min-w-[36px] min-h-[36px] flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              title={isMidnightPurple ? 'Night Mode' : 'Midnight Purple'}
            >
              <Moon className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-full bg-glass/30 border border-glass-border/30 hover:border-primary/50 transition-colors flex items-center gap-1 min-w-[36px] min-h-[36px] justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language === 'ar' ? 'EN' : 'AR'}</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-full bg-glass/30 border border-glass-border/30 min-w-[36px] min-h-[36px] flex items-center justify-center"
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
        </motion.div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`lg:hidden fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 z-[90] w-[min(85vw,320px)]`}
            >
              <div className={`h-full flex flex-col bg-[#0B1120]/95 backdrop-blur-2xl border-white/[0.06] ${isRTL ? 'border-l' : 'border-r'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <motion.a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('#home');
                    }}
                    className="flex items-center gap-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src="/logo-icon.png" alt="StoreCraft" className="h-8 w-auto logo-img" />
                  </motion.a>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.1] transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/[0.06]" />

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {filteredNavLinks.map((link, i) => {
                    const Icon = sectionIcons[link.href.replace('#', '')] || Home;
                    const isActive = activeSection === link.href.replace('#', '');
                    return (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <span>{t(link.label, link.labelEn)}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary ms-auto" />}
                      </motion.a>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/[0.06]" />

                {/* Bottom CTA */}
                <div className="px-5 py-5 space-y-3">
                  <motion.a
                    href={`https://wa.me/${('213555000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I\'m interested in your services.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-4 h-4" />
                    {t('تواصل معنا', 'Contact Us')}
                  </motion.a>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>+213 555 000 000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
