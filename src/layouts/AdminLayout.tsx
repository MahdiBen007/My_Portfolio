import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={cn(
            'transition-all duration-300 min-h-screen',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
