import type { CSSProperties } from 'react';
import type { PageBlock } from '@/hooks/usePageBlocks';
import { HeroSection } from '@/components/HeroSection';
import { ServicesSection } from '@/components/ServicesSection';
import { SkillsSection } from '@/components/SkillsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';

type SectionOverrides = {
  title?: string | null;
  subtitle?: string | null;
};

const getOverrides = (block: PageBlock): SectionOverrides => ({
  title: block.title,
  subtitle: block.subtitle,
});

const backgroundClassMap: Record<string, string> = {
  transparent: '',
  solid: 'bg-slate-950/50',
  gradient: 'bg-gradient-night',
  'subtle-gradient': 'bg-gradient-to-b from-night-start/80 via-night-mid/70 to-night-end/80',
};

const animationClassMap: Record<string, string> = {
  none: '',
  'fade-up': 'animate-fade-in-up',
  'fade-in': 'animate-fade-in',
  'slide-left': 'animate-slide-in-left',
  'slide-right': 'animate-slide-in-right',
  'zoom-in': 'animate-scale-in',
};

export const PageBuilderSections = ({ blocks }: { blocks: PageBlock[] }) => {
  return (
    <>
      {blocks.map((block, index) => {
        const overrides = getOverrides(block);
        const backgroundClass = backgroundClassMap[block.background_style] ?? '';
        const animationClass = animationClassMap[block.animation_preset] ?? '';

        const wrapperClassName = [
          'page-builder-section',
          'relative',
          backgroundClass,
          animationClass,
        ]
          .filter(Boolean)
          .join(' ');

        const wrapperStyle: CSSProperties = {
          paddingTop: block.padding_top,
          paddingBottom: block.padding_bottom,
        };

        switch (block.block_type) {
          case 'hero':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <HeroSection />
              </div>
            );
          case 'services':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <ServicesSection
                  title={overrides.title ?? undefined}
                  subtitle={overrides.subtitle ?? undefined}
                />
              </div>
            );
          case 'skills':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <SkillsSection
                  title={overrides.title ?? undefined}
                  subtitle={overrides.subtitle ?? undefined}
                />
              </div>
            );
          case 'featured_projects':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <PortfolioSection
                  title={overrides.title ?? undefined}
                  subtitle={overrides.subtitle ?? undefined}
                  featuredOnly
                />
              </div>
            );
          case 'projects_grid':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <PortfolioSection
                  title={overrides.title ?? undefined}
                  subtitle={overrides.subtitle ?? undefined}
                />
              </div>
            );
          case 'about':
          case 'timeline':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <AboutSection title={overrides.title ?? undefined} />
              </div>
            );
          case 'contact':
            return (
              <div
                key={`${block.id}-${index}`}
                className={wrapperClassName}
                style={wrapperStyle}
                data-layout={block.layout_variant}
                data-background={block.background_style}
                data-animation={block.animation_preset}
              >
                <ContactSection
                  title={overrides.title ?? undefined}
                  subtitle={overrides.subtitle ?? undefined}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
};
