import { useEffect, useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SettingsSync } from '@/components/SettingsSync';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PricingSection } from '@/components/PricingSection';
import { DashboardShowcase } from '@/components/DashboardShowcase';
import { DemoSection } from '@/components/DemoSection';
import { ServicesSection } from '@/components/ServicesSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AboutSection } from '@/components/AboutSection';
import { WhyClientsChooseUs } from '@/components/WhyClientsChooseUs';
import { ContactSection } from '@/components/ContactSection';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { Footer } from '@/components/Footer';
import { PortfolioLoader } from '@/components/PortfolioLoader';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import { PageBuilderSections } from '@/components/PageBuilderSections';

const Index = () => {
  const { data, loading } = usePortfolioData();
  const { blocks, loading: blocksLoading } = usePageBlocks('home');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  const loaderDuration = data?.settings?.loader?.duration ?? 1400;

  useEffect(() => {
    const timeout = setTimeout(() => setMinDelayPassed(true), loaderDuration);
    return () => clearTimeout(timeout);
  }, [loaderDuration]);

  useEffect(() => {
    if (!loading && minDelayPassed) {
      setIsFirstLoad(false);
    }
  }, [loading, minDelayPassed]);

  const showLoader = isFirstLoad && (!minDelayPassed || loading || blocksLoading);
  const hasPageBuilderBlocks = Boolean(blocks && blocks.length > 0);

  return (
    <LanguageProvider defaultLanguage={data.settings.locale}>
      <div className="relative min-h-screen">
        <SettingsSync />
        <AnimatedBackground />
        {showLoader ? (
          <PortfolioLoader />
        ) : (
          <>
            <Navbar />
            <div className="site-font">
              <main className="relative z-10">
                {hasPageBuilderBlocks ? (
                  <PageBuilderSections blocks={blocks ?? []} />
                ) : (
                  <>
                    <HeroSection />
                    <PricingSection />
                    <DashboardShowcase />
                    <DemoSection />
                    <PortfolioSection />
                    <ServicesSection />
                    <WhyClientsChooseUs />
                    <AboutSection />
                    <ContactSection />
                  </>
                )}
              </main>
              <Footer />
            </div>
            <WhatsAppCTA />
          </>
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
