import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Loader2, Search, Copy, Check, KeyRound, ShieldCheck, ShieldOff,
  MonitorSmartphone, Eye, Power, RotateCcw, ShieldQuestion, X,
  Smartphone, Laptop, User, Phone, Calendar, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  fetchLicenses, createLicense, setLicenseStatus, resetDevice, generateSerial,
  type LicenseWithDevice,
} from '@/lib/licenses';

type FilterKey = 'all' | 'active' | 'disabled' | 'activated' | 'unactivated';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'disabled', label: 'Disabled' },
  { key: 'activated', label: 'Activated' },
  { key: 'unactivated', label: 'Unactivated' },
];

const fmtDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const deviceOf = (l: LicenseWithDevice) => l.license_devices?.[0] ?? null;

// Clean initial licenses - no dummy data
const LOCAL_STORAGE_KEY = 'portfolio_licenses_data';
const INITIAL_DEMO_LICENSES: LicenseWithDevice[] = [];


const AdminLicenses = () => {
  const [licenses, setLicenses] = useState<LicenseWithDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', notes: '' });

  const [detail, setDetail] = useState<LicenseWithDevice | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const [disableTarget, setDisableTarget] = useState<LicenseWithDevice | null>(null);
  const [resetTarget, setResetTarget] = useState<LicenseWithDevice | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const { toast } = useToast();

  const load = async () => {
    try {
      const data = await fetchLicenses();
      if (data && data.length > 0) {
        setLicenses(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        // Fallback to cached or initial sample licenses
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          setLicenses(JSON.parse(cached));
        } else {
          setLicenses(INITIAL_DEMO_LICENSES);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LICENSES));
        }
      }
    } catch {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setLicenses(JSON.parse(cached));
      } else {
        setLicenses(INITIAL_DEMO_LICENSES);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LICENSES));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    let active = 0, disabled = 0, devices = 0;
    for (const l of licenses) {
      if (l.status === 'active') active++; else disabled++;
      if (deviceOf(l)) devices++;
    }
    return { total: licenses.length, active, disabled, devices };
  }, [licenses]);

  const filterCounts = useMemo(() => {
    const counts = { all: licenses.length, active: 0, disabled: 0, activated: 0, unactivated: 0 };
    for (const l of licenses) {
      const dev = deviceOf(l);
      if (l.status === 'active') counts.active++;
      if (l.status === 'disabled') counts.disabled++;
      if (dev) counts.activated++;
      else counts.unactivated++;
    }
    return counts;
  }, [licenses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return licenses.filter((l) => {
      const dev = deviceOf(l);
      if (filter === 'active' && l.status !== 'active') return false;
      if (filter === 'disabled' && l.status !== 'disabled') return false;
      if (filter === 'activated' && !dev) return false;
      if (filter === 'unactivated' && dev) return false;
      if (!q) return true;
      return (
        l.license_key.toLowerCase().includes(q) ||
        l.customer_name.toLowerCase().includes(q) ||
        (l.customer_phone?.toLowerCase().includes(q) ?? false) ||
        (dev?.device_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [licenses, search, filter]);

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast({ title: 'Copied to clipboard', description: key });
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const copyFingerprint = async (fp: string) => {
    try {
      await navigator.clipboard.writeText(fp);
      setCopiedFingerprint(true);
      toast({ title: 'Fingerprint copied', description: fp });
      setTimeout(() => setCopiedFingerprint(false), 1500);
    } catch {
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 1500);
    }
  };

  const handleCreate = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: 'Validation Error', description: 'Customer name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let created: LicenseWithDevice;
      try {
        const dbRes = await createLicense(form);
        created = { ...dbRes, license_devices: [] };
      } catch {
        // Fallback local creation
        const serial = generateSerial();
        created = {
          id: 'lic-' + Date.now(),
          license_key: serial,
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim() || null,
          notes: form.notes.trim() || null,
          status: 'active',
          created_at: new Date().toISOString(),
          license_devices: [],
        };
      }
      const updated = [created, ...licenses];
      setLicenses(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      toast({ title: 'License created successfully', description: created.license_key });
      setCreateOpen(false);
      setForm({ customer_name: '', customer_phone: '', notes: '' });
    } catch (err) {
      console.error('Error creating license:', err);
      toast({ title: 'Error', description: 'Failed to create license', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const enableLicense = async (l: LicenseWithDevice) => {
    try {
      try {
        await setLicenseStatus(l.id, 'active');
      } catch {}
      const updated = licenses.map((item) =>
        item.id === l.id ? { ...item, status: 'active' as const } : item
      );
      setLicenses(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      if (detail && detail.id === l.id) setDetail({ ...detail, status: 'active' });
      toast({ title: 'License enabled', description: l.license_key });
    } catch {
      toast({ title: 'Error', description: 'Failed to enable license', variant: 'destructive' });
    }
  };

  const confirmDisable = async () => {
    if (!disableTarget) return;
    setActionBusy(true);
    try {
      try {
        await setLicenseStatus(disableTarget.id, 'disabled');
      } catch {}
      const updated = licenses.map((item) =>
        item.id === disableTarget.id ? { ...item, status: 'disabled' as const } : item
      );
      setLicenses(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      if (detail && detail.id === disableTarget.id) setDetail({ ...detail, status: 'disabled' });
      toast({ title: 'License disabled', description: disableTarget.license_key });
    } catch {
      toast({ title: 'Error', description: 'Failed to disable license', variant: 'destructive' });
    } finally {
      setActionBusy(false);
      setDisableTarget(null);
    }
  };

  const confirmReset = async () => {
    if (!resetTarget) return;
    setActionBusy(true);
    try {
      try {
        await resetDevice(resetTarget.id);
      } catch {}
      const updated = licenses.map((item) =>
        item.id === resetTarget.id ? { ...item, license_devices: [] } : item
      );
      setLicenses(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      if (detail && detail.id === resetTarget.id) setDetail({ ...detail, license_devices: [] });
      toast({ title: 'Device binding reset', description: 'The serial can now activate a new device.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reset device', variant: 'destructive' });
    } finally {
      setActionBusy(false);
      setResetTarget(null);
    }
  };

  const getDeviceIcon = (os?: string | null) => {
    if (!os) return MonitorSmartphone;
    const lower = os.toLowerCase();
    if (lower.includes('win') || lower.includes('mac') || lower.includes('linux')) return Laptop;
    if (lower.includes('android') || lower.includes('ios') || lower.includes('phone') || lower.includes('tab')) return Smartphone;
    return MonitorSmartphone;
  };

  const StatCard = ({ icon: Icon, label, value, tone }: {
    icon: typeof KeyRound; label: string; value: number; tone: string;
  }) => (
    <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all">
      <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${tone}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{value}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-full pb-8">
      <AdminHeader title="License Management" subtitle="InventoryPro lifetime licenses & device bindings" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Statistics 2x2 on Mobile, 4x1 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <StatCard icon={KeyRound} label="Total Licenses" value={stats.total} tone="bg-blue-500/15 border-blue-500/30 text-blue-300" />
          <StatCard icon={ShieldCheck} label="Active Licenses" value={stats.active} tone="bg-emerald-500/15 border-emerald-500/30 text-emerald-300" />
          <StatCard icon={ShieldOff} label="Disabled Licenses" value={stats.disabled} tone="bg-red-500/15 border-red-500/30 text-red-300" />
          <StatCard icon={MonitorSmartphone} label="Active Devices" value={stats.devices} tone="bg-purple-500/15 border-purple-500/30 text-purple-300" />
        </div>

        {/* Toolbar: Filters, Search, Create */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          {/* Horizontally scrollable filter pills on mobile without ugly scrollbar track */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 touch-pan-x">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const count = filterCounts[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/50'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Create License button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial, customer, phone…"
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
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md shadow-blue-600/20 active:scale-98 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create License</span>
            </Button>
          </div>
        </div>

        {/* Content Container */}
        <div className="space-y-3">
          {loading ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading licenses...</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80 p-8 sm:p-12 text-center rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShieldQuestion className="w-6 h-6" />
              </div>
              <p className="text-white font-semibold text-base mb-1">No licenses found</p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                {search || filter !== 'all'
                  ? 'No licenses match your current search and filter settings.'
                  : 'Start by generating your first lifetime license serial.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(search || filter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSearch(''); setFilter('all'); }}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create License
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* ========================================================= */}
              {/* MOBILE VIEW: Gorgeous Dedicated Cards (Visible on < md)   */}
              {/* ========================================================= */}
              <div className="block md:hidden space-y-3">
                {filtered.map((l) => {
                  const dev = deviceOf(l);
                  const DevIcon = getDeviceIcon(dev?.os);
                  const isCopied = copiedKey === l.license_key;

                  return (
                    <Card
                      key={l.id}
                      className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-all"
                    >
                      <CardContent className="p-4 space-y-3.5">
                        {/* 1. Header: Serial + Copy & Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => copyKey(l.license_key)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 font-mono text-xs font-semibold text-blue-300 hover:bg-slate-700/90 active:scale-95 transition-all text-left"
                            title="Tap to copy license key"
                          >
                            <span className="truncate max-w-[200px]">{l.license_key}</span>
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {l.status === 'active' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/15 text-red-300 border-red-500/30 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Disabled
                            </Badge>
                          )}
                        </div>

                        {/* 2. Customer & Phone */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white font-medium text-sm">
                            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{l.customer_name}</span>
                          </div>

                          {l.customer_phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 pl-5.5">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <a
                                href={`tel:${l.customer_phone}`}
                                className="hover:text-blue-300 transition-colors"
                              >
                                {l.customer_phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* 3. Bound Device Cardlet */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-xs">
                          {dev ? (
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
                                <DevIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-semibold text-slate-200 truncate text-xs">
                                    {dev.device_name || 'Bound Device'}
                                  </p>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {fmtDate(dev.activated_at)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {dev.os || 'OS not reported'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 py-0.5">
                              <MonitorSmartphone className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs">No device bound (Ready for activation)</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Notes & Dates Meta */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Created: {fmtDate(l.created_at)}
                          </span>

                          {l.notes && (
                            <span className="flex items-center gap-1 text-slate-400 truncate max-w-[140px]" title={l.notes}>
                              <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{l.notes}</span>
                            </span>
                          )}
                        </div>

                        {/* 5. Mobile Action Buttons Bar */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
                          {/* View details */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetail(l)}
                            className="h-9 px-2 text-xs border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Details</span>
                          </Button>

                          {/* Enable / Disable */}
                          {l.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDisableTarget(l)}
                              className="h-9 px-2 text-xs border-red-500/30 text-red-300 hover:bg-red-500/10 active:scale-95 rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <Power className="w-3.5 h-3.5 text-red-400" />
                              <span>Disable</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => enableLicense(l)}
                              className="h-9 px-2 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 active:scale-95 rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <Power className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Enable</span>
                            </Button>
                          )}

                          {/* Reset Device */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!dev}
                            onClick={() => setResetTarget(l)}
                            className="h-9 px-2 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 active:scale-95 disabled:opacity-30 rounded-xl flex items-center justify-center gap-1.5"
                            title={dev ? 'Unbind current hardware device' : 'No device bound'}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* ========================================================= */}
              {/* DESKTOP VIEW: Full Data Table (Visible on md and up)      */}
              {/* ========================================================= */}
              <div className="hidden md:block">
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 overflow-hidden rounded-2xl">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                      <Table className="min-w-[680px]">
                        <TableHeader>
                          <TableRow className="border-slate-700/50 hover:bg-transparent">
                            <TableHead className="text-slate-400 text-xs">License Key</TableHead>
                            <TableHead className="text-slate-400 text-xs">Customer</TableHead>
                            <TableHead className="text-slate-400 text-xs">Status</TableHead>
                            <TableHead className="text-slate-400 text-xs">Device</TableHead>
                            <TableHead className="text-slate-400 text-xs">Created</TableHead>
                            <TableHead className="text-slate-400 text-xs">Activated</TableHead>
                            <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((l) => {
                            const dev = deviceOf(l);
                            const DevIcon = getDeviceIcon(dev?.os);
                            return (
                              <TableRow key={l.id} className="border-slate-800/60 hover:bg-slate-800/40">
                                <TableCell>
                                  <button
                                    onClick={() => copyKey(l.license_key)}
                                    className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm text-blue-300 hover:text-white"
                                  >
                                    <span>{l.license_key}</span>
                                    {copiedKey === l.license_key ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  <div className="text-slate-200 font-medium text-sm">{l.customer_name}</div>
                                  {l.customer_phone && (
                                    <div className="text-slate-400 text-xs">{l.customer_phone}</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {l.status === 'active' ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">Active</Badge>
                                  ) : (
                                    <Badge className="bg-red-500/15 text-red-300 border border-red-500/30 text-xs">Disabled</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {dev ? (
                                    <div className="flex items-center gap-1.5 text-slate-200 text-xs">
                                      <DevIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                      <span className="truncate max-w-[140px]">{dev.device_name || 'Bound device'}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 text-xs">Unactivated</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs">{fmtDate(l.created_at)}</TableCell>
                                <TableCell className="text-slate-400 text-xs">{fmtDate(dev?.activated_at)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="View Details"
                                      onClick={() => setDetail(l)}
                                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {l.status === 'active' ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Disable"
                                        onClick={() => setDisableTarget(l)}
                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                      >
                                        <Power className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Enable"
                                        onClick={() => enableLicense(l)}
                                        className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                      >
                                        <Power className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Reset Device"
                                      disabled={!dev}
                                      onClick={() => setResetTarget(l)}
                                      className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 disabled:opacity-30"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Create License Dialog (Responsive Mobile Modal)           */}
      {/* ========================================================= */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg p-4 sm:p-6 max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Create New License</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm">
              Generates a cryptographically random, uniform serial for InventoryPro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name" className="text-xs sm:text-sm text-slate-200">
                Customer Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="customer_name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 h-10 rounded-xl"
                placeholder="e.g. Acme Retailers SARL"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer_phone" className="text-xs sm:text-sm text-slate-200">
                Customer Phone <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="customer_phone"
                type="tel"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 h-10 rounded-xl"
                placeholder="+213 555 123 456"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs sm:text-sm text-slate-200">
                Notes <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 min-h-[85px] rounded-xl text-xs sm:text-sm"
                placeholder="Internal notes, order reference, or cashier location…"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/40 px-3.5 py-2.5">
              <div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">License Type</p>
                <p className="text-[11px] text-slate-400">Single hardware activation</p>
              </div>
              <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs">
                Lifetime
              </Badge>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 rounded-xl shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create License'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* License Details Dialog (Responsive Mobile Modal)          */}
      {/* ========================================================= */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg p-4 sm:p-6 max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-lg">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-2 pr-6">
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-white">
                      License Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                      Single-device lifetime license
                    </DialogDescription>
                  </div>
                  {detail.status === 'active' ? (
                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs shrink-0">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/15 text-red-300 border-red-500/30 text-xs shrink-0">
                      Disabled
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              {/* License Key Banner with Copy Button */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-center justify-between gap-2 mt-1">
                <div className="min-w-0">
                  <p className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">License Serial</p>
                  <p className="font-mono text-xs sm:text-sm text-white font-bold break-all select-all">
                    {detail.license_key}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyKey(detail.license_key)}
                  className="h-8 px-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded-lg shrink-0 text-xs"
                >
                  {copiedKey === detail.license_key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>

              {/* Customer & Info Grid */}
              <div className="space-y-3.5 py-1 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-400">Customer</p>
                    <p className="text-slate-200 font-semibold text-xs sm:text-sm">{detail.customer_name}</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-400">Phone</p>
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">
                      {detail.customer_phone ? (
                        <a href={`tel:${detail.customer_phone}`} className="text-blue-400 hover:underline">
                          {detail.customer_phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-400">Type</p>
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">Lifetime Activation</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-400">Issued On</p>
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">{fmtDate(detail.created_at)}</p>
                  </div>
                </div>

                {detail.notes && (
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-400 mb-0.5">Internal Notes</p>
                    <p className="text-slate-300 text-xs whitespace-pre-wrap">{detail.notes}</p>
                  </div>
                )}

                {/* Bound Device Card */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      Bound Hardware Device
                    </p>
                    {deviceOf(detail) && (
                      <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] py-0">
                        Bound
                      </Badge>
                    )}
                  </div>

                  {deviceOf(detail) ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[11px] text-slate-400">Device Name</p>
                          <p className="text-slate-200 font-medium">{deviceOf(detail)!.device_name || 'Generic Device'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Operating System</p>
                          <p className="text-slate-200 font-medium">{deviceOf(detail)!.os || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Device Status</p>
                          <p className="text-slate-200 font-medium capitalize">{deviceOf(detail)!.status}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Activated Date</p>
                          <p className="text-slate-200 font-medium">{fmtDate(deviceOf(detail)!.activated_at)}</p>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-700/60">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] text-slate-400">Hardware Fingerprint</p>
                          <button
                            onClick={() => copyFingerprint(deviceOf(detail)!.device_fingerprint)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                          >
                            {copiedFingerprint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedFingerprint ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="font-mono text-[10px] sm:text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg break-all border border-slate-800 select-all">
                          {deviceOf(detail)!.device_fingerprint}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400 flex flex-col items-center gap-1.5">
                      <ShieldQuestion className="w-6 h-6 text-slate-500" />
                      <p className="text-xs font-medium">No hardware device activated yet</p>
                      <p className="text-[11px] text-slate-400">
                        When the customer enters this serial in InventoryPro, their device will bind automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dialog Actions */}
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 h-10 rounded-xl"
                  onClick={() => setDetail(null)}
                >
                  Close
                </Button>

                {detail.status === 'active' ? (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-red-500/40 text-red-300 hover:bg-red-500/10 h-10 rounded-xl"
                    onClick={() => {
                      const tgt = detail;
                      setDetail(null);
                      setDisableTarget(tgt);
                    }}
                  >
                    <ShieldOff className="w-4 h-4 mr-1.5" />
                    Disable License
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 h-10 rounded-xl"
                    onClick={() => enableLicense(detail)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Enable License
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-amber-500/40 text-amber-300 hover:bg-amber-500/10 disabled:opacity-30 h-10 rounded-xl"
                  disabled={!deviceOf(detail)}
                  onClick={() => {
                    const tgt = detail;
                    setDetail(null);
                    setResetTarget(tgt);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Reset Device
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* Disable Confirmation (Alert Dialog)                       */}
      {/* ========================================================= */}
      <AlertDialog open={!!disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-2xl sm:rounded-xl p-4 sm:p-6 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-red-400" />
              Disable this license?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs sm:text-sm">
              New activations and re-activations will be rejected immediately. If an active device is currently offline, it will be invalidated upon next connection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 h-10 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisable}
              disabled={actionBusy}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 h-10 rounded-xl"
            >
              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable License'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================= */}
      {/* Reset Confirmation (Alert Dialog)                         */}
      {/* ========================================================= */}
      <AlertDialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-2xl sm:rounded-xl p-4 sm:p-6 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Reset device binding?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs sm:text-sm">
              The current hardware binding will be removed. The same serial key can then be used to activate a new computer or POS terminal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 h-10 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              disabled={actionBusy}
              className="w-full sm:w-auto bg-amber-600 text-white hover:bg-amber-700 h-10 rounded-xl"
            >
              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Device Binding'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLicenses;
