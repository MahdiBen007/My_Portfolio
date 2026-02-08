import { useEffect, useMemo, useState } from 'react';
import { Bell, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

type MessagePreview = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  received_at: string;
};

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessages, setLatestMessages] = useState<MessagePreview[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const [{ data: messages, error: messagesError }, { count, error: countError }] =
          await Promise.all([
            supabase
              .from('messages')
              .select('id,name,email,subject,message,is_read,received_at')
              .order('received_at', { ascending: false })
              .limit(5),
            supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('is_read', false),
          ]);

        if (messagesError) throw messagesError;
        if (countError) throw countError;

        if (!isMounted) return;
        setLatestMessages(messages ?? []);
        setUnreadCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const badgeLabel = useMemo(() => {
    if (unreadCount <= 0) return '';
    return unreadCount > 99 ? '99+' : String(unreadCount);
  }, [unreadCount]);

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search..."
            className="w-64 pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* View Site */}
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => window.open('/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Site
        </Button>

        {/* Notifications */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                {badgeLabel}
              </Badge>
            )}
          </Button>

          <div className="pointer-events-none absolute right-0 mt-2 w-80 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
                <p className="text-sm font-semibold text-white">New Messages</p>
                <span className="text-xs text-slate-400">{unreadCount} unread</span>
              </div>

              <div className="max-h-80 overflow-auto">
                {loadingMessages ? (
                  <div className="px-4 py-6 text-sm text-slate-400">Loading...</div>
                ) : latestMessages.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-400">No messages yet.</div>
                ) : (
                  latestMessages.map((message) => (
                    <div
                      key={message.id}
                      className="px-4 py-3 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white truncate">{message.name}</p>
                        <span className="text-[11px] text-slate-500">{formatTime(message.received_at)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{message.email}</p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{message.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-slate-700/60">
                <a
                  href="/admin/messages"
                  className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
                >
                  View all messages
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
