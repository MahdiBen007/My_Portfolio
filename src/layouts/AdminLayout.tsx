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
  '/admin/settings': { title: 'Settings', subtitle: 'Configure global settings' },
};

const AdminLayoutShell = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMetaTitle, setAdminMetaTitle] = useState('Admin Dashboard');
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
          .select('admin_meta_title')
          .limit(1)
          .single();

        if (error) throw error;
        if (!isMounted) return;
        const nextTitle = data?.admin_meta_title?.trim();
        setAdminMetaTitle(nextTitle || 'Admin Dashboard');
      } catch (error) {
        console.error('Error fetching admin meta title:', error);
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
    const baseTitle = adminMetaTitle?.trim();
    document.title = baseTitle ? `${pageTitle} | ${baseTitle}` : pageTitle;
  }, [adminMetaTitle, pageTitle]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        data-admin-theme={theme}
        className={cn(
          'min-h-screen flex items-center justify-center admin-theme',
          isPortfolio
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
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
        className={cn(
          'min-h-screen flex items-center justify-center admin-theme',
          isPortfolio
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
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
