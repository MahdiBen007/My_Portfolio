import { useEffect, useState } from 'react';
import {
  Briefcase,
  Code2,
  FolderKanban,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminHeader from '@/components/admin/AdminHeader';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Stats {
  services: number;
  skills: number;
  projects: number;
  messages: number;
  featured: number;
  unreadMessages: number;
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  received_at: string;
  is_read: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) => (
  <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">{trend}</span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    skills: 0,
    projects: 0,
    messages: 0,
    featured: 0,
    unreadMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, skillsRes, projectsRes, messagesRes] = await Promise.all([
          supabase.from('services').select('id', { count: 'exact' }),
          supabase.from('skills').select('id', { count: 'exact' }),
          supabase.from('projects').select('id, featured', { count: 'exact' }),
          supabase.from('messages').select('id, is_read', { count: 'exact' }),
        ]);

        const featuredCount = projectsRes.data?.filter((p) => p.featured).length || 0;
        const unreadCount = messagesRes.data?.filter((m) => !m.is_read).length || 0;

        setStats({
          services: servicesRes.count || 0,
          skills: skillsRes.count || 0,
          projects: projectsRes.count || 0,
          messages: messagesRes.count || 0,
          featured: featuredCount,
          unreadMessages: unreadCount,
        });

        // Fetch recent messages
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .order('received_at', { ascending: false })
          .limit(5);

        setRecentMessages(messages || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <AdminHeader title="Overview" subtitle="Welcome to your dashboard" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Services"
            value={stats.services}
            icon={Briefcase}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Skills"
            value={stats.skills}
            icon={Code2}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Total Projects"
            value={stats.projects}
            icon={FolderKanban}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Messages"
            value={stats.messages}
            icon={MessageSquare}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Featured Projects</CardTitle>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{stats.featured}</p>
              <p className="text-sm text-slate-400 mt-1">
                of {stats.projects} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Unread Messages</CardTitle>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{stats.unreadMessages}</p>
              <p className="text-sm text-slate-400 mt-1">messages awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Messages</CardTitle>
              <CardDescription className="text-slate-400">
                Latest messages from your contact form
              </CardDescription>
            </div>
            <Link to="/admin/messages">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No messages yet</p>
              ) : (
                recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {msg.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{msg.name}</p>
                        {!msg.is_read && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{msg.subject || 'No subject'}</p>
                      <p className="text-sm text-slate-500 truncate mt-1">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(msg.received_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
