import { lazy, Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SettingsSync } from '@/components/SettingsSync';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { Footer } from '@/components/Footer';
import { PortfolioLoader } from '@/components/PortfolioLoader';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import { PageBuilderSections } from '@/components/PageBuilderSections';

const PricingSection = lazy(() => import('@/components/PricingSection').then(m => ({ default: m.PricingSection })));
const DashboardShowcase = lazy(() => import('@/components/DashboardShowcase').then(m => ({ default: m.DashboardShowcase })));
const DemoSection = lazy(() => import('@/components/DemoSection').then(m => ({ default: m.DemoSection })));
const PortfolioSection = lazy(() => import('@/components/PortfolioSection').then(m => ({ default: m.PortfolioSection })));
const ServicesSection = lazy(() => import('@/components/ServicesSection').then(m => ({ default: m.ServicesSection })));
const WhyClientsChooseUs = lazy(() => import('@/components/WhyClientsChooseUs').then(m => ({ default: m.WhyClientsChooseUs })));
const AboutSection = lazy(() => import('@/components/AboutSection').then(m => ({ default: m.AboutSection })));
const ContactSection = lazy(() => import('@/components/ContactSection').then(m => ({ default: m.ContactSection })));

const SectionFallback = () => (
  <div className="min-h-[200px]" />
);

const DeferredSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '2000px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : <SectionFallback />}
    </div>
  );
};

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
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <PricingSection />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <DashboardShowcase />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <DemoSection />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <PortfolioSection />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <ServicesSection />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <WhyClientsChooseUs />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <AboutSection />
                      </Suspense>
                    </DeferredSection>
                    <DeferredSection>
                      <Suspense fallback={<SectionFallback />}>
                        <ContactSection />
                      </Suspense>
                    </DeferredSection>
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
