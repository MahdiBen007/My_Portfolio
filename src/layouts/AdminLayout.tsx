import { useEffect, useMemo, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext';
import { AdminSidebarProvider } from '@/contexts/AdminSidebarContext';
import { supabase } from '@/integrations/supabase/client';

const pageMetadata: Record<string, { title: string; subtitle?: string }> = {
  '/admin': { title: 'Overview', subtitle: 'Welcome to your dashboard' },
  '/admin/services': { title: 'Services', subtitle: 'Manage your services' },
  '/admin/skills': { title: 'Skills', subtitle: 'Manage your skills' },
  '/admin/projects': { title: 'Projects', subtitle: 'Manage your projects' },
  '/admin/about': { title: 'About & Timeline', subtitle: 'Manage about section and timeline' },
  '/admin/messages': { title: 'Messages', subtitle: 'View and manage contact messages' },
  '/admin/page-builder': { title: 'Page Builder', subtitle: 'Build and customize your pages' },
  '/admin/pricing': { title: 'Pricing', subtitle: 'Manage your pricing plans' },
  '/admin/testimonials': { title: 'Testimonials', subtitle: 'Manage customer testimonials' },
  '/admin/licenses': { title: 'License Management', subtitle: 'InventoryPro lifetime licenses' },
  '/admin/settings': { title: 'Settings', subtitle: 'Configure global settings' },
};

type AdminThemeColors = {
  portfolio: { accent: string; accentStrong: string };
  studio: { accent: string; accentStrong: string };
};

const DEFAULT_ADMIN_COLORS: AdminThemeColors = {
  portfolio: { accent: '187 85% 53%', accentStrong: '262 83% 58%' },
  studio: { accent: '217 91% 60%', accentStrong: '262 83% 58%' },
};

const hexToHsl = (hex?: string | null) => {
  if (!hex) return null;
  const raw = hex.replace('#', '').trim();
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

const AdminLayoutShell = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMetaTitle, setAdminMetaTitle] = useState('Admin Dashboard');
  const [adminThemeColors, setAdminThemeColors] = useState<AdminThemeColors>(DEFAULT_ADMIN_COLORS);
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const { theme, isPortfolio } = useAdminTheme();
  const pageTitle = useMemo(
    () => pageMetadata[location.pathname]?.title ?? 'Dashboard',
    [location.pathname]
  );

  useEffect(() => {
    let isMounted = true;

    const loadAdminTitle = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('admin_meta_title,admin_portfolio_primary_color,admin_portfolio_secondary_color,admin_studio_primary_color,admin_studio_secondary_color')
          .limit(1)
          .single();

        if (error) throw error;
        if (!isMounted) return;
        const nextTitle = data?.admin_meta_title?.trim();
        setAdminMetaTitle(nextTitle || 'Admin Dashboard');

        const portfolioAccent =
          hexToHsl(data?.admin_portfolio_primary_color) ?? DEFAULT_ADMIN_COLORS.portfolio.accent;
        const portfolioStrong =
          hexToHsl(data?.admin_portfolio_secondary_color) ?? DEFAULT_ADMIN_COLORS.portfolio.accentStrong;
        const studioAccent =
          hexToHsl(data?.admin_studio_primary_color) ?? DEFAULT_ADMIN_COLORS.studio.accent;
        const studioStrong =
          hexToHsl(data?.admin_studio_secondary_color) ?? DEFAULT_ADMIN_COLORS.studio.accentStrong;

        setAdminThemeColors({
          portfolio: { accent: portfolioAccent, accentStrong: portfolioStrong },
          studio: { accent: studioAccent, accentStrong: studioStrong },
        });
      } catch {
        // Silently handle settings fetch error - defaults will be used
      }
    };

    loadAdminTitle();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === 'string') {
        setAdminMetaTitle(detail || 'Admin Dashboard');
      }
    };

    window.addEventListener('admin-meta-title-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('admin-meta-title-updated', handleUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleThemeUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{
        portfolio?: { accent?: string | null; accentStrong?: string | null };
        studio?: { accent?: string | null; accentStrong?: string | null };
      }>).detail;

      if (!detail) return;
      const portfolioAccent = hexToHsl(detail.portfolio?.accent) ?? DEFAULT_ADMIN_COLORS.portfolio.accent;
      const portfolioStrong =
        hexToHsl(detail.portfolio?.accentStrong) ?? DEFAULT_ADMIN_COLORS.portfolio.accentStrong;
      const studioAccent = hexToHsl(detail.studio?.accent) ?? DEFAULT_ADMIN_COLORS.studio.accent;
      const studioStrong =
        hexToHsl(detail.studio?.accentStrong) ?? DEFAULT_ADMIN_COLORS.studio.accentStrong;

      setAdminThemeColors({
        portfolio: { accent: portfolioAccent, accentStrong: portfolioStrong },
        studio: { accent: studioAccent, accentStrong: studioStrong },
      });
    };

    window.addEventListener('admin-theme-updated', handleThemeUpdate as EventListener);
    return () => {
      window.removeEventListener('admin-theme-updated', handleThemeUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const baseTitle = adminMetaTitle?.trim();
    document.title = baseTitle ? `${pageTitle} | ${baseTitle}` : pageTitle;
  }, [adminMetaTitle, pageTitle]);

  const activeAdminColors = theme === 'portfolio' ? adminThemeColors.portfolio : adminThemeColors.studio;
  const adminStyle = {
    ['--admin-accent' as string]: activeAdminColors.accent,
    ['--admin-accent-strong' as string]: activeAdminColors.accentStrong,
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        data-admin-theme={theme}
        style={adminStyle}
        className={cn(
          'min-h-screen flex items-center justify-center admin-theme',
          isPortfolio
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
        )}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div
        data-admin-theme={theme}
        style={adminStyle}
        className={cn(
          'min-h-screen flex items-center justify-center admin-theme',
          isPortfolio
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
        )}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <AdminSidebarProvider openSidebar={() => setMobileOpen(true)}>
        <div
          data-admin-theme={theme}
          style={adminStyle}
          className={cn(
            'min-h-screen admin-theme',
            isPortfolio
              ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
              : 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
          )}
        >
          {/* Background effects */}
          {isPortfolio && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>
          )}

          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          {mobileOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}

          <main
            className={cn(
              'transition-all duration-300 min-h-screen',
              sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
            )}
          >
            <Outlet />
          </main>
        </div>
      </AdminSidebarProvider>
    </TooltipProvider>
  );
};

const AdminLayout = () => (
  <AdminThemeProvider>
    <AdminLayoutShell />
  </AdminThemeProvider>
);

export default AdminLayout;
