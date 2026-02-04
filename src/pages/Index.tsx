import { LanguageProvider } from '@/contexts/LanguageContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ServicesSection } from '@/components/ServicesSection';
import { SkillsSection } from '@/components/SkillsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navbar />
        <main className="relative z-10">
          <HeroSection />
          <ServicesSection />
          <SkillsSection />
          <PortfolioSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
