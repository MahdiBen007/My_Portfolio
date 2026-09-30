import { useEffect, useMemo, useState } from 'react';
import {
  Users, Search, Phone, MessageSquare, Download, CheckCircle2,
  X, Trash2, Edit3, Store, Calendar, FileText,
  Check, Copy, RefreshCw, XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminHeader from '@/components/admin/AdminHeader';
import { useToast } from '@/hooks/use-toast';
import {
  fetchDemoLeads, updateLeadStatus, updateLeadNotes, deleteLead,
  type DemoLead, type LeadStatus,
} from '@/lib/demoRequests';

const STATUS_FILTERS: { key: LeadStatus | 'all'; label: string; tone: string }[] = [
  { key: 'all', label: 'All', tone: 'bg-slate-800 text-slate-300' },
  { key: 'converted', label: 'Converted', tone: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { key: 'not_interested', label: 'Not Interested', tone: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

const fmtDate = (val?: string | null) => {
  if (!val) return '—';
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminDemoRequests = () => {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [businessFilter, setBusinessFilter] = useState('all');

  // Edit notes dialog
  const [editingLead, setEditingLead] = useState<DemoLead | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<DemoLead | null>(null);

  // Copied state
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDemoLeads();
      setLeads(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    let converted = 0;
    let notInterested = 0;
    let totalDownloads = 0;

    for (const l of leads) {
      if (l.status === 'converted') converted++;
      else notInterested++;
      totalDownloads += l.downloads_count || 1;
    }

    return {
      total: leads.length,
      converted,
      notInterested,
      totalDownloads,
    };
  }, [leads]);

  // Unique business types for filter
  const businessTypes = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.business_type) set.add(l.business_type);
    });
    return Array.from(set);
  }, [leads]);

  // Filtered leads
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const normalizedStatus: LeadStatus = l.status === 'converted' ? 'converted' : 'not_interested';
      if (statusFilter !== 'all' && normalizedStatus !== statusFilter) return false;
      if (businessFilter !== 'all' && l.business_type !== businessFilter) return false;
      if (!q) return true;
      return (
        l.full_name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.business_type?.toLowerCase().includes(q) ?? false) ||
        (l.notes?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, search, statusFilter, businessFilter]);

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      toast({ title: 'Phone copied', description: phone });
      setTimeout(() => setCopiedPhone((p) => (p === phone ? null : p)), 1500);
    } catch {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 1500);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(id, newStatus);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!editingLead) return;
    setSavingNotes(true);
    try {
      await updateLeadNotes(editingLead.id, notesInput.trim());
      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? { ...l, notes: notesInput.trim() } : l)));
      toast({ title: 'Notes saved' });
      setEditingLead(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead(deleteTarget.id);
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast({ title: 'Lead deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete lead', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    if (status === 'converted') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>Converted</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-xs flex items-center gap-1 font-medium">
        <XCircle className="w-3 h-3" />
        <span>Not Interested</span>
      </Badge>
    );
  };

  const openWhatsApp = (lead: DemoLead) => {
    const cleanPhone = lead.phone.replace(/^0/, '213');
    const msg = encodeURIComponent(
      `Bonjour / السلام عليكم ${lead.full_name}، معكم فريق الدعم بخصوص تحميل النسخة التجريبية (${lead.business_type}). هل تحتاجون أي مساعدة في تثبيت البرنامج؟`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-full pb-8 w-full max-w-full overflow-hidden">
      <AdminHeader
        title="Demo Leads"
        subtitle="Manage and track trial software & mobile app download requests"
      />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Statistics 2x2 on Mobile, 4x1 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.total}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Total Leads</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.converted}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Converted</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.notInterested}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Not Interested</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.totalDownloads}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Total Downloads</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          {/* Horizontally scrollable status pills without ugly scrollbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 touch-pan-x">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.key;
              const count =
                f.key === 'all'
                  ? leads.length
                  : leads.filter((l) => {
                      const norm: LeadStatus = l.status === 'converted' ? 'converted' : 'not_interested';
                      return norm === f.key;
                    }).length;

              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/50'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Business type dropdown */}
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Business Types</option>
              {businessTypes.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Search Input with 1-tap clear button */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, notes…"
                className="w-full pl-9 pr-8 h-10 bg-slate-800/70 border-slate-700/70 text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:border-blue-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={load}
              className="h-10 w-10 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl shrink-0"
              title="Refresh leads"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Section: Mobile Cards vs Desktop Table */}
        <div className="space-y-3">
          {loading ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading demo leads...</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-8 sm:p-12 text-center rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-white font-semibold text-base mb-1">No matching leads</p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                No demo requests match your current search and filter criteria.
              </p>
              {(search || statusFilter !== 'all' || businessFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setBusinessFilter('all');
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* ========================================================= */}
              {/* MOBILE VIEW: Dedicated Cards (Visible on < md)            */}
              {/* ========================================================= */}
              <div className="block md:hidden space-y-3">
                {filtered.map((lead) => (
                  <Card
                    key={lead.id}
                    className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm transition-all"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Top Header: Name + Date + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {lead.full_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {fmtDate(lead.created_at)}
                          </span>
                        </div>
                        {getStatusBadge(lead.status)}
                      </div>

                      {/* Phone & Direct Contacts Bar */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-white">
                          <button
                            onClick={() => copyPhone(lead.phone)}
                            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                            title="Copy phone"
                          >
                            {copiedPhone === lead.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="font-semibold">{lead.phone}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* 1-tap WhatsApp button */}
                          <Button
                            size="sm"
                            onClick={() => openWhatsApp(lead)}
                            className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs flex items-center gap-1 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </Button>

                          {/* 1-tap Call button */}
                          <a
                            href={`tel:${lead.phone}`}
                            className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center transition-colors shadow-sm"
                            title="Call client"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Business Type & Downloads count */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
                          <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{lead.business_type}</span>
                        </div>

                        <Badge className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] shrink-0 font-mono">
                          {lead.downloads_count || 1}x downloads
                        </Badge>
                      </div>

                      {/* Internal Notes Preview */}
                      {lead.notes && (
                        <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-2 text-xs text-slate-300 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <p className="leading-relaxed line-clamp-2">{lead.notes}</p>
                        </div>
                      )}

                      {/* Action Bar: Status selector + Notes modal + Delete */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        {/* Status dropdown */}
                        <div className="relative flex-1">
                          <select
                            value={lead.status === 'converted' ? 'converted' : 'not_interested'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="w-full h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] focus:outline-hidden cursor-pointer"
                          >
                            <option value="converted">Converted 🎉</option>
                            <option value="not_interested">Not Interested</option>
                          </select>
                        </div>

                        {/* Edit Notes button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLead(lead);
                            setNotesInput(lead.notes || '');
                          }}
                          className="h-8 px-2.5 border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"
                          title="Edit notes"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          <span>Notes</span>
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(lead)}
                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ========================================================= */}
              {/* DESKTOP VIEW: Full Data Table (Visible on md and up)      */}
              {/* ========================================================= */}
              <div className="hidden md:block">
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 overflow-hidden rounded-2xl">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table className="w-full min-w-[820px]">
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-300 text-xs text-left pl-4 font-bold min-w-[120px]">Customer</TableHead>
                          <TableHead className="text-slate-300 text-xs text-left px-2 min-w-[120px]">Phone & Contact</TableHead>
                          <TableHead className="text-slate-300 text-xs text-left px-2 min-w-[160px]">Business Type</TableHead>
                          <TableHead className="text-slate-300 text-xs text-center px-1 min-w-[70px]">Downloads</TableHead>
                          <TableHead className="text-slate-300 text-xs text-center px-2 min-w-[120px]">Status</TableHead>
                          <TableHead className="text-slate-300 text-xs text-left px-2 min-w-[110px]">Date Requested</TableHead>
                          <TableHead className="text-slate-300 text-xs text-left px-2 min-w-[140px]">Notes</TableHead>
                          <TableHead className="text-slate-300 text-xs text-right pr-4 min-w-[110px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((lead) => (
                          <TableRow key={lead.id} className="border-slate-800/60 hover:bg-slate-800/40">
                            <TableCell className="font-semibold text-white text-sm pl-4 min-w-[120px] whitespace-nowrap">
                              {lead.full_name}
                            </TableCell>

                            <TableCell className="px-2 min-w-[120px] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-slate-200 font-semibold">{lead.phone}</span>
                                <button
                                  onClick={() => copyPhone(lead.phone)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                  title="Copy phone"
                                >
                                  {copiedPhone === lead.phone ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </TableCell>

                            <TableCell className="px-2 min-w-[160px]">
                              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[170px]" title={lead.business_type}>{lead.business_type}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center px-1 min-w-[70px]">
                              <Badge className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-mono">
                                {lead.downloads_count || 1}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center px-2 min-w-[120px]">
                              <select
                                value={lead.status === 'converted' ? 'converted' : 'not_interested'}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                className="h-7 px-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden cursor-pointer"
                              >
                                <option value="converted">Converted 🎉</option>
                                <option value="not_interested">Not Interested</option>
                              </select>
                            </TableCell>

                            <TableCell className="text-xs text-slate-400 px-2 min-w-[110px] whitespace-nowrap">
                              {fmtDate(lead.created_at)}
                            </TableCell>

                            <TableCell className="px-2 min-w-[140px] max-w-[180px]">
                              {lead.notes ? (
                                <p className="text-xs text-slate-300 truncate max-w-[170px]" title={lead.notes}>
                                  {lead.notes}
                                </p>
                              ) : (
                                <span className="text-slate-600 text-xs">—</span>
                              )}
                            </TableCell>

                            <TableCell className="pr-4 min-w-[110px]">
                              <div className="flex items-center justify-end gap-1">
                                {/* WhatsApp button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openWhatsApp(lead)}
                                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>

                                {/* Direct Call button */}
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="h-8 w-8 rounded-md flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  title="Call client"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>

                                {/* Edit Notes button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingLead(lead);
                                    setNotesInput(lead.notes || '');
                                  }}
                                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                                  title="Edit notes"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>

                                {/* Delete button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteTarget(lead)}
                                  className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                  title="Delete lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Notes Dialog */}
      <Dialog open={!!editingLead} onOpenChange={(o) => !o && setEditingLead(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-md p-4 sm:p-6 rounded-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">
              Follow-up Notes: {editingLead?.full_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Record conversation details and notes for this lead
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Type notes here (e.g. interested in lifetime license, callback scheduled for tomorrow)..."
              className="w-full h-32 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setEditingLead(null)}
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl"
            >
              {savingNotes ? 'Saving…' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-2xl sm:rounded-xl p-4 sm:p-6 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Demo Lead?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs sm:text-sm">
              Are you sure you want to delete the lead for &quot;{deleteTarget?.full_name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 h-10 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 h-10 rounded-xl"
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDemoRequests;
