import { useEffect } from 'react';
import { usePortfolioData } from '@/features/portfolio/PortfolioDataContext';

const hexToHsl = (hex: string) => {
  const raw = hex.replace('#', '').trim();
  if (!raw) return null;
  const normalized = raw.length === 3
    ? raw.split('').map((ch) => ch + ch).join('')
    : raw;
  if (normalized.length !== 6) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  const hue = Math.round(h * 360);
  const sat = Math.round(s * 100);
  const light = Math.round(l * 100);
  return `${hue} ${sat}% ${light}%`;
};

const setMeta = (selector: string, content: string) => {
  if (!content) return;
  const element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (element) {
    element.setAttribute('content', content);
    return;
  }

  const meta = document.createElement('meta');
  if (selector.startsWith('meta[name="')) {
    const name = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
    if (name) meta.setAttribute('name', name);
  }
  if (selector.startsWith('meta[property="')) {
    const prop = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
    if (prop) meta.setAttribute('property', prop);
  }
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
};

export const SettingsSync = () => {
  const { data } = usePortfolioData();
  const { settings, personalData } = data;

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    const primary = settings.theme?.primary ?? '';
    const secondary = settings.theme?.secondary ?? '';
    const accent = settings.theme?.accent ?? secondary ?? primary;
    const ui = settings.ui;

    const primaryHsl = primary ? hexToHsl(primary) : null;
    const secondaryHsl = secondary ? hexToHsl(secondary) : null;
    const accentHsl = accent ? hexToHsl(accent) : null;

    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--glow-cyan', primaryHsl);
      root.style.setProperty('--ring', primaryHsl);
      root.style.setProperty('--sidebar-primary', primaryHsl);
    }

    if (secondaryHsl) {
      root.style.setProperty('--secondary', secondaryHsl);
      root.style.setProperty('--glow-purple', secondaryHsl);
    }

    if (accentHsl) {
      root.style.setProperty('--accent', accentHsl);
      root.style.setProperty('--glow-pink', accentHsl);
    }

    if (ui) {
      const paletteMap: Record<string, {
        background: string;
        card: string;
        muted: string;
        border: string;
        input: string;
        glass: string;
        glassBorder: string;
        nightStart: string;
        nightMid: string;
        nightEnd: string;
      }> = {
        night: {
          background: '222 47% 6%',
          card: '222 47% 8%',
          muted: '222 40% 14%',
          border: '222 30% 18%',
          input: '222 30% 18%',
          glass: '222 47% 12%',
          glassBorder: '222 30% 25%',
          nightStart: '222 47% 4%',
          nightMid: '232 47% 8%',
          nightEnd: '262 47% 12%',
        },
        midnight: {
          background: '262 47% 6%',
          card: '262 47% 8%',
          muted: '262 40% 14%',
          border: '262 30% 18%',
          input: '262 30% 18%',
          glass: '262 47% 12%',
          glassBorder: '262 30% 25%',
          nightStart: '262 47% 4%',
          nightMid: '272 47% 8%',
          nightEnd: '282 47% 12%',
        },
        ocean: {
          background: '220 40% 6%',
          card: '220 40% 8%',
          muted: '220 35% 14%',
          border: '220 25% 18%',
          input: '220 25% 18%',
          glass: '220 40% 12%',
          glassBorder: '220 25% 25%',
          nightStart: '222 47% 4%',
          nightMid: '215 60% 12%',
          nightEnd: '210 55% 14%',
        },
        forest: {
          background: '150 30% 6%',
          card: '150 30% 8%',
          muted: '150 25% 14%',
          border: '150 20% 18%',
          input: '150 20% 18%',
          glass: '150 30% 12%',
          glassBorder: '150 20% 25%',
          nightStart: '145 35% 6%',
          nightMid: '150 45% 12%',
          nightEnd: '145 40% 14%',
        },
      };

      const applyPalette = (palette: typeof paletteMap.night, suffix: 'base' | 'alt') => {
        const postfix = suffix === 'base' ? '-base' : '-alt';
        root.style.setProperty(`--background${postfix}`, palette.background);
        root.style.setProperty(`--card${postfix}`, palette.card);
        root.style.setProperty(`--muted${postfix}`, palette.muted);
        root.style.setProperty(`--border${postfix}`, palette.border);
        root.style.setProperty(`--input${postfix}`, palette.input);
        root.style.setProperty(`--glass${postfix}`, palette.glass);
        root.style.setProperty(`--glass-border${postfix}`, palette.glassBorder);
        root.style.setProperty(`--night-start${postfix}`, palette.nightStart);
        root.style.setProperty(`--night-mid${postfix}`, palette.nightMid);
        root.style.setProperty(`--night-end${postfix}`, palette.nightEnd);
      };

      const basePalette = paletteMap[ui.backgroundGradient] ?? paletteMap.night;
      const altPalette = paletteMap[ui.backgroundGradientAlt] ?? paletteMap.midnight;
      applyPalette(basePalette, 'base');
      applyPalette(altPalette, 'alt');

      if (typeof ui.borderRadius === 'number') {
        root.style.setProperty('--radius', `${ui.borderRadius}px`);
      }

      const uiFont = ui.uiFont?.trim();
      if (uiFont) {
        root.style.setProperty('--ui-font', `"${uiFont}"`);
      }

      const siteFont = ui.siteFont?.trim();
      if (siteFont) {
        root.style.setProperty('--site-font', `"${siteFont}"`);
      }

      const spacingMap: Record<string, string> = {
        compact: 'clamp(12px, 2.4vw, 24px)',
        comfortable: 'clamp(16px, 3vw, 32px)',
        spacious: 'clamp(20px, 4vw, 40px)',
      };
      const spacing = spacingMap[ui.spacingDensity] ?? spacingMap.comfortable;
      root.style.setProperty('--container-padding', spacing);

      const animationsEnabled = ui.animationsEnabled !== false;
      document.body.classList.toggle('animations-disabled', !animationsEnabled);

      const intensity = Math.min(Math.max(ui.shadowIntensity ?? 50, 0), 100);
      const opacity = 0.2 + (intensity / 100) * 0.5;
      root.style.setProperty('--shadow-card', `0 8px 32px hsl(222 47% 4% / ${opacity.toFixed(2)})`);
    }

    const seoTitle = settings.seo?.title?.trim();
    const seoDescription = settings.seo?.description?.trim();
    const seoKeywords = settings.seo?.keywords?.filter(Boolean) ?? [];

    if (seoTitle) {
      document.title = seoTitle;
      setMeta('meta[property="og:title"]', seoTitle);
      setMeta('meta[name="twitter:title"]', seoTitle);
    }

    if (seoDescription) {
      setMeta('meta[name="description"]', seoDescription);
      setMeta('meta[property="og:description"]', seoDescription);
      setMeta('meta[name="twitter:description"]', seoDescription);
    }

    if (seoKeywords.length > 0) {
      setMeta('meta[name="keywords"]', seoKeywords.join(', '));
    }

    if (personalData?.nameEn) {
      setMeta('meta[name="author"]', personalData.nameEn);
    }
  }, [settings, personalData]);

  return null;
};
