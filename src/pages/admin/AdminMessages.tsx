import { useState, useEffect } from 'react';
import {
  Mail, Star, Archive, Trash2, MailOpen, Reply, Loader2, Search, Filter,
  ChevronLeft, ChevronRight, Download, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminHeader from '@/components/admin/AdminHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_starred: boolean;
  is_replied: boolean;
  is_spam: boolean;
  internal_notes: string | null;
  received_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('is_spam', false)
        .order('received_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread' && msg.is_read) return false;
    if (filter === 'starred' && !msg.is_starred) return false;
    if (filter === 'replied' && !msg.is_replied) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.subject?.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const openMessageDetail = async (message: Message) => {
    setSelectedMessage(message);
    setInternalNotes(message.internal_notes || '');
    setIsDetailDialogOpen(true);

    if (!message.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', message.id);
      fetchMessages();
    }
  };

  const toggleStar = async (id: string, isStarred: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await supabase.from('messages').update({ is_starred: !isStarred }).eq('id', id);
      fetchMessages();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    try {
      await supabase.from('messages').update({ is_read: !isRead }).eq('id', id);
      fetchMessages();
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      await supabase.from('messages').update({ is_replied: true }).eq('id', id);
      toast({ title: 'Success', description: 'Message marked as replied' });
      fetchMessages();
      setIsDetailDialogOpen(false);
    } catch (error) {
      console.error('Error marking as replied:', error);
    }
  };

  const saveInternalNotes = async () => {
    if (!selectedMessage) return;

    setSavingNotes(true);
    try {
      await supabase
        .from('messages')
        .update({ internal_notes: internalNotes || null })
        .eq('id', selectedMessage.id);
      toast({ title: 'Success', description: 'Notes saved' });
      fetchMessages();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteMessage = async () => {
    if (!deletingId) return;

    try {
      await supabase.from('messages').delete().eq('id', deletingId);
      toast({ title: 'Success', description: 'Message deleted' });
      fetchMessages();
      setIsDetailDialogOpen(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Subject', 'Message', 'Date', 'Status'].join(','),
      ...filteredMessages.map((msg) =>
        [
          `"${msg.name}"`,
          `"${msg.email}"`,
          `"${msg.subject || ''}"`,
          `"${msg.message.replace(/"/g, '""')}"`,
          `"${format(new Date(msg.received_at), 'yyyy-MM-dd HH:mm')}"`,
          `"${msg.is_replied ? 'Replied' : msg.is_read ? 'Read' : 'Unread'}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <AdminHeader title="Messages" subtitle={`${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`} />

      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-10 w-64 bg-slate-800 border-slate-600"
              />
            </div>
            <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportCSV} variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No messages found</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessageDetail(msg)}
                  className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${
                    !msg.is_read ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => toggleStar(msg.id, msg.is_starred, e)}
                      className={`mt-1 ${
                        msg.is_starred ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-4 h-4" fill={msg.is_starred ? 'currentColor' : 'none'} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {msg.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${!msg.is_read ? 'text-white' : 'text-slate-300'}`}>
                          {msg.name}
                        </p>
                        <span className="text-slate-500 text-sm">{msg.email}</span>
                        {!msg.is_read && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">New</Badge>
                        )}
                        {msg.is_replied && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <Reply className="w-3 h-3 mr-1" />
                            Replied
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${!msg.is_read ? 'text-slate-300' : 'text-slate-400'}`}>
                        {msg.subject || 'No subject'}
                      </p>
                      <p className="text-sm text-slate-500 truncate mt-1">{msg.message}</p>
                    </div>

                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(msg.received_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selectedMessage.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <DialogTitle className="text-left">{selectedMessage.name}</DialogTitle>
                      <DialogDescription className="text-left">
                        {selectedMessage.email}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStar(selectedMessage.id, selectedMessage.is_starred)}
                      className={selectedMessage.is_starred ? 'text-yellow-400' : 'text-slate-400'}
                    >
                      <Star className="w-5 h-5" fill={selectedMessage.is_starred ? 'currentColor' : 'none'} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(selectedMessage.id, selectedMessage.is_read)}
                      className="text-slate-400"
                    >
                      {selectedMessage.is_read ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Subject</p>
                  <p className="text-white">{selectedMessage.subject || 'No subject'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Message</p>
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Received</p>
                  <p className="text-slate-400">
                    {format(new Date(selectedMessage.received_at), 'MMMM d, yyyy at h:mm a')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal Notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Add notes about this message..."
                  />
                  <Button
                    onClick={saveInternalNotes}
                    disabled={savingNotes}
                    size="sm"
                    variant="outline"
                  >
                    {savingNotes ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Notes'
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeletingId(selectedMessage.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => markAsReplied(selectedMessage.id)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={selectedMessage.is_replied}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {selectedMessage.is_replied ? 'Already Replied' : 'Mark as Replied'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Message?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteMessage}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMessages;
