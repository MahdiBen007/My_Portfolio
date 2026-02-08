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
