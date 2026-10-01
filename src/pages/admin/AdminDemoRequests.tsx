import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Users, Search, Phone, MessageSquare, Download, CheckCircle2,
  X, Trash2, Edit3, Store, Calendar, FileText,
  Check, Copy, RefreshCw, XCircle, Clock, Sparkles, AlertCircle
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
import { useLanguage } from '@/contexts/LanguageContext';
import {
  fetchDemoLeads, updateLeadStatus, updateLeadNotes, deleteLead,
  type DemoLead, type LeadStatus,
} from '@/lib/demoRequests';

export default function AdminDemoRequests() {
  const { t, isRTL, language } = useLanguage();
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchDemoLeads();
      setLeads(data);
    } catch {
      if (!silent) {
        toast({
          title: t('خطأ في التحميل', 'Loading Error'),
          description: t('تعذر جلب طلبات التجربة من الخادم', 'Failed to fetch demo leads from server'),
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t, toast]);

  useEffect(() => {
    load();
    // Auto refresh every 15 seconds for live cloud sync
    const timer = setInterval(() => {
      load(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [load]);

  // Formatter for date
  const fmtDate = (val?: string | null) => {
    if (!val) return '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status filters definition with dynamic translations
  const statusFiltersList = useMemo(() => [
    { key: 'all' as const, label: t('الكل', 'All') },
    { key: 'new' as const, label: t('طلبات جديدة', 'New Leads') },
    { key: 'contacted' as const, label: t('تم التواصل', 'Contacted') },
    { key: 'converted' as const, label: t('تم الشراء 🎉', 'Converted 🎉') },
    { key: 'not_interested' as const, label: t('غير مهتم', 'Not Interested') },
  ], [t]);

  // Stats calculation
  const stats = useMemo(() => {
    let newLeads = 0;
    let contacted = 0;
    let converted = 0;
    let notInterested = 0;
    let totalDownloads = 0;

    for (const l of leads) {
      if (l.status === 'converted') converted++;
      else if (l.status === 'contacted') contacted++;
      else if (l.status === 'not_interested') notInterested++;
      else newLeads++;

      totalDownloads += l.downloads_count || 1;
    }

    return {
      total: leads.length,
      newLeads,
      contacted,
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
      const normalizedStatus: LeadStatus = l.status || 'new';
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
      toast({
        title: t('تم نسخ رقم الهاتف', 'Phone copied'),
        description: phone,
      });
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
      toast({
        title: t('تم تحديث حالة العميل بنجاح', 'Status updated successfully'),
      });
    } catch {
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل تحديث الحالة في السحابة', 'Failed to update status in cloud'),
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!editingLead) return;
    setSavingNotes(true);
    try {
      await updateLeadNotes(editingLead.id, notesInput.trim());
      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? { ...l, notes: notesInput.trim() } : l)));
      toast({
        title: t('تم حفظ الملاحظات', 'Notes saved'),
      });
      setEditingLead(null);
    } catch {
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل حفظ الملاحظات', 'Failed to save notes'),
        variant: 'destructive',
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead(deleteTarget.id);
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast({
        title: t('تم حذف الطلب', 'Lead deleted'),
      });
    } catch {
      toast({
        title: t('خطأ', 'Error'),
        description: t('تعذر حذف الطلب من السحابة', 'Failed to delete lead from cloud'),
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    if (status === 'converted') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>{t('تم الشراء 🎉', 'Converted 🎉')}</span>
        </Badge>
      );
    }
    if (status === 'contacted') {
      return (
        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3" />
          <span>{t('تم التواصل', 'Contacted')}</span>
        </Badge>
      );
    }
    if (status === 'not_interested') {
      return (
        <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-xs flex items-center gap-1 font-medium">
          <XCircle className="w-3 h-3" />
          <span>{t('غير مهتم', 'Not Interested')}</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/30 text-xs flex items-center gap-1 font-medium">
        <Sparkles className="w-3 h-3 text-sky-400" />
        <span>{t('طلب جديد', 'New Lead')}</span>
      </Badge>
    );
  };

  const openWhatsApp = (lead: DemoLead) => {
    const cleanPhone = lead.phone.replace(/^0/, '213');
    const msg = encodeURIComponent(
      `السلام عليكم أخي ${lead.full_name}، معكم مهدي بخصوص تحميلك للنسخة التجريبية لبرنامج كومرس برو لنشاط (${lead.business_type}). هل تحتاج أي مساعدة في التثبيت أو الاستخدام؟`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-full pb-8 w-full max-w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminHeader
        title={t('طلبات النسخة التجريبية (Demo Leads)', 'Demo Leads')}
        subtitle={t(
          'إدارة وتتبع بيانات العملاء الذين حمّلوا النسخة التجريبية وتطبيق الهاتف',
          'Manage and track trial software & mobile app download requests'
        )}
      />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Total Leads */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.total}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {t('إجمالي المسجلين', 'Total Leads')}
                </p>
              </div>
            </div>
          </Card>

          {/* New Leads */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.newLeads}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {t('طلبات جديدة', 'New Leads')}
                </p>
              </div>
            </div>
          </Card>

          {/* Converted */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.converted}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {t('تم الشراء 🎉', 'Converted')}
                </p>
              </div>
            </div>
          </Card>

          {/* Not Interested */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.notInterested}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {t('غير مهتم', 'Not Interested')}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Downloads */}
          <Card className="col-span-2 lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">{stats.totalDownloads}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {t('إجمالي التحميلات', 'Total Downloads')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          {/* Horizontally scrollable status pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 touch-pan-x">
            {statusFiltersList.map((f) => {
              const active = statusFilter === f.key;
              const count =
                f.key === 'all'
                  ? leads.length
                  : leads.filter((l) => (l.status || 'new') === f.key).length;

              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 cursor-pointer ${
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

          {/* Search bar & Dropdown & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Business type dropdown */}
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{t('جميع الأنشطة والمحلات', 'All Business Types')}</option>
              {businessTypes.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Search Input with 1-tap clear button */}
            <div className="relative flex-1 sm:w-64">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none`} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('البحث بالاسم، الهاتف، الملاحظات…', 'Search by name, phone, notes…')}
                className={`w-full ${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'} h-10 bg-slate-800/70 border-slate-700/70 text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:border-blue-500`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md`}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => load(false)}
              className="h-10 w-10 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl shrink-0"
              title={t('تحديث البيانات من السحابة', 'Refresh leads')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Content Section: Mobile Cards vs Desktop Table */}
        <div className="space-y-3">
          {loading ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-12 text-center rounded-2xl">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">{t('جاري جلب طلبات التحميل من قاعدة البيانات...', 'Loading demo leads...')}</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-8 sm:p-12 text-center rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-white font-semibold text-base mb-1">
                {t('لا توجد طلبات مطابقة', 'No matching leads')}
              </p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                {t(
                  'لم يتم العثور على أي نتائج وفقاً لمعايير البحث والفلترة المحددة.',
                  'No demo requests match your current search and filter criteria.'
                )}
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
                  {t('إعادة ضبط الفلاتر', 'Clear Filters')}
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* ========================================================= */}
              {/* MOBILE VIEW: Cards (< md)                                 */}
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
                            title={t('نسخ رقم الهاتف', 'Copy phone')}
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
                            <span>واتساب</span>
                          </Button>

                          {/* 1-tap Call button */}
                          <a
                            href={`tel:${lead.phone}`}
                            className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center transition-colors shadow-sm"
                            title={t('اتصال هاتفي', 'Call client')}
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
                          {lead.downloads_count || 1} {t('تحميل', 'downloads')}
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
                            value={lead.status || 'new'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="w-full h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] focus:outline-hidden cursor-pointer"
                          >
                            <option value="new">{t('طلب جديد', 'New Lead')}</option>
                            <option value="contacted">{t('تم التواصل', 'Contacted')}</option>
                            <option value="converted">{t('تم الشراء 🎉', 'Converted 🎉')}</option>
                            <option value="not_interested">{t('غير مهتم', 'Not Interested')}</option>
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
                          title={t('تعديل الملاحظات', 'Edit notes')}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          <span>{t('ملاحظات', 'Notes')}</span>
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(lead)}
                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                          title={t('حذف الطلب', 'Delete lead')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ========================================================= */}
              {/* DESKTOP VIEW: Full Data Table (md and up)                  */}
              {/* ========================================================= */}
              <div className="hidden md:block">
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 overflow-hidden rounded-2xl shadow-sm">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table className="w-full min-w-[840px]">
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-right pr-4' : 'text-left pl-4'} font-bold min-w-[130px]`}>
                            {t('العميل', 'Customer')}
                          </TableHead>
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-right' : 'text-left'} px-2 min-w-[130px]`}>
                            {t('رقم الهاتف والاتصال', 'Phone & Contact')}
                          </TableHead>
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-right' : 'text-left'} px-2 min-w-[160px]`}>
                            {t('نوع النشاط / المحل', 'Business Type')}
                          </TableHead>
                          <TableHead className="text-slate-300 text-xs text-center px-1 min-w-[80px]">
                            {t('التحميلات', 'Downloads')}
                          </TableHead>
                          <TableHead className="text-slate-300 text-xs text-center px-2 min-w-[130px]">
                            {t('حالة الطلب', 'Status')}
                          </TableHead>
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-right' : 'text-left'} px-2 min-w-[120px]`}>
                            {t('تاريخ الطلب', 'Date Requested')}
                          </TableHead>
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-right' : 'text-left'} px-2 min-w-[140px]`}>
                            {t('ملاحظات', 'Notes')}
                          </TableHead>
                          <TableHead className={`text-slate-300 text-xs ${isRTL ? 'text-left pl-4' : 'text-right pr-4'} min-w-[110px]`}>
                            {t('الإجراءات', 'Actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((lead) => (
                          <TableRow key={lead.id} className="border-slate-800/60 hover:bg-slate-800/40">
                            <TableCell className={`font-semibold text-white text-sm ${isRTL ? 'pr-4 text-right' : 'pl-4 text-left'} min-w-[130px] whitespace-nowrap`}>
                              {lead.full_name}
                            </TableCell>

                            <TableCell className="px-2 min-w-[130px] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-slate-200 font-semibold">{lead.phone}</span>
                                <button
                                  onClick={() => copyPhone(lead.phone)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                  title={t('نسخ رقم الهاتف', 'Copy phone')}
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

                            <TableCell className="text-center px-1 min-w-[80px]">
                              <Badge className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-mono">
                                {lead.downloads_count || 1}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center px-2 min-w-[130px]">
                              <select
                                value={lead.status || 'new'}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                className="h-7 px-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden cursor-pointer"
                              >
                                <option value="new">{t('طلب جديد', 'New Lead')}</option>
                                <option value="contacted">{t('تم التواصل', 'Contacted')}</option>
                                <option value="converted">{t('تم الشراء 🎉', 'Converted 🎉')}</option>
                                <option value="not_interested">{t('غير مهتم', 'Not Interested')}</option>
                              </select>
                            </TableCell>

                            <TableCell className="text-xs text-slate-400 px-2 min-w-[120px] whitespace-nowrap">
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

                            <TableCell className={`${isRTL ? 'pl-4' : 'pr-4'} min-w-[110px]`}>
                              <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1`}>
                                {/* WhatsApp button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openWhatsApp(lead)}
                                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  title={t('مراسلة واتساب', 'Chat on WhatsApp')}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>

                                {/* Direct Call button */}
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="h-8 w-8 rounded-md flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  title={t('اتصال هاتفي', 'Call client')}
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
                                  title={t('تعديل الملاحظات', 'Edit notes')}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>

                                {/* Delete button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteTarget(lead)}
                                  className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                  title={t('حذف الطلب', 'Delete lead')}
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-md p-4 sm:p-6 rounded-2xl sm:rounded-xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">
              {t('ملاحظات المتابعة:', 'Follow-up Notes:')} {editingLead?.full_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {t('تسجيل تفاصيل المكالمة والاتفاق مع العميل لسهولة المتابعة', 'Record conversation details and notes for this lead')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder={t('اكتب الملاحظات هنا (مثال: مهتم بالرخصة الدائمة، طلب إعادة الاتصال مساءً)...', 'Type notes here (e.g. interested in lifetime license, callback scheduled for tomorrow)...')}
              className="w-full h-32 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setEditingLead(null)}
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 h-10 rounded-xl"
            >
              {t('إلغاء', 'Cancel')}
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl"
            >
              {savingNotes ? t('جاري الحفظ…', 'Saving…') : t('حفظ الملاحظات', 'Save Notes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-2xl sm:rounded-xl p-4 sm:p-6 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>{t('حذف طلب التجربة؟', 'Delete Demo Lead?')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs sm:text-sm">
              {t(
                `هل أنت متأكد من رغبتك في حذف بيانات العميل "${deleteTarget?.full_name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                `Are you sure you want to delete the lead for "${deleteTarget?.full_name}"? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 h-10 rounded-xl">
              {t('إلغاء', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 h-10 rounded-xl"
            >
              {t('تأكيد الحذف', 'Delete Lead')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
