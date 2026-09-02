import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Code2,
  FolderKanban,
  User,
  Clock,
  MessageSquare,
  Settings,
  Layers,
  DollarSign,
  Quote,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/admin/services', icon: Briefcase, label: 'Services' },
  { path: '/admin/skills', icon: Code2, label: 'Skills' },
  { path: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/admin/about', icon: User, label: 'About & Timeline' },
  { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/admin/page-builder', icon: Layers, label: 'Page Builder' },
  { path: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
  { path: '/admin/testimonials', icon: Quote, label: 'Testimonials' },
  { path: '/admin/licenses', icon: KeyRound, label: 'License Management' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut, user, role } = useAuth();
  const rawName = user?.user_metadata?.full_name;
  const displayName = rawName && rawName !== 'Admin' ? rawName : 'Mahdi Bensaleh';
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AD';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        'admin-sidebar fixed left-0 top-0 h-screen backdrop-blur-xl border-r border-slate-700/50 z-50 transition-all duration-300 flex flex-col transform',
        collapsed ? 'w-64 lg:w-16' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="admin-sidebar-header h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="admin-sidebar-logo w-8 h-8 rounded-lg border border-slate-600/60 bg-slate-800/80 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img
              src="/favicon.svg"
              alt="Mahdi logo"
              className="w-5 h-5 object-contain"
              loading="eager"
            />
          </div>
          {!collapsed && <span className="font-bold text-white text-lg">Admin</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="admin-sidebar-control text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:inline-flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="admin-sidebar-control text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          const linkContent = (
            <NavLink
              to={item.path}
              end={item.end}
              onClick={onMobileClose}
              className={cn(
                'admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'admin-nav-link-active text-white shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <item.icon
                className={cn(
                  'admin-nav-link-icon w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'admin-nav-link-icon-active' : ''
                )}
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="admin-sidebar-tooltip bg-slate-800 text-white border-slate-700">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* User Menu */}
      <div className="admin-sidebar-footer p-3 border-t border-slate-700/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'admin-sidebar-profile w-full flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-left transition-all',
                'hover:border-blue-500/40 hover:bg-slate-800/80',
                collapsed ? 'justify-center px-2 py-2.5' : ''
              )}
            >
              <div className="relative">
                <Avatar className="admin-sidebar-avatar h-10 w-10 border border-slate-700/60 shadow-lg shadow-blue-500/10">
                  <AvatarImage src="/hero-portrait.svg" alt={displayName} />
                  <AvatarFallback className="bg-slate-700 text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="admin-sidebar-status-dot absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-400" />
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 capitalize">{displayRole}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-64 border-slate-700/60 bg-slate-900/95 text-white"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-white truncate">{user?.email ?? ''}</p>
              <p className="text-xs text-slate-400 capitalize">{displayRole}</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-700/60" />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleSignOut();
              }}
              className="cursor-pointer text-slate-200 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default AdminSidebar;
