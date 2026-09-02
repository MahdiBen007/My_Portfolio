import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Loader2, Search, Copy, Check, KeyRound, ShieldCheck, ShieldOff,
  MonitorSmartphone, Eye, Power, RotateCcw, ShieldQuestion,
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
  fetchLicenses, createLicense, setLicenseStatus, resetDevice,
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

  const [disableTarget, setDisableTarget] = useState<LicenseWithDevice | null>(null);
  const [resetTarget, setResetTarget] = useState<LicenseWithDevice | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const { toast } = useToast();

  const load = async () => {
    try {
      setLicenses(await fetchLicenses());
    } catch (err) {
      console.error('Error fetching licenses:', err);
      toast({ title: 'Error', description: 'Failed to load licenses. Check RLS / auth.', variant: 'destructive' });
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
        (dev?.device_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [licenses, search, filter]);

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch { /* clipboard blocked — ignore */ }
  };

  const handleCreate = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: 'Validation Error', description: 'Customer name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const created = await createLicense(form);
      toast({ title: 'License created', description: created.license_key });
      setCreateOpen(false);
      setForm({ customer_name: '', customer_phone: '', notes: '' });
      await load();
    } catch (err) {
      console.error('Error creating license:', err);
      toast({ title: 'Error', description: 'Failed to create license', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const enableLicense = async (l: LicenseWithDevice) => {
    try {
      await setLicenseStatus(l.id, 'active');
      toast({ title: 'License enabled', description: l.license_key });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to enable license', variant: 'destructive' });
    }
  };

  const confirmDisable = async () => {
    if (!disableTarget) return;
    setActionBusy(true);
    try {
      await setLicenseStatus(disableTarget.id, 'disabled');
      toast({ title: 'License disabled', description: disableTarget.license_key });
      await load();
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
      await resetDevice(resetTarget.id);
      toast({ title: 'Device reset', description: 'The serial can now activate a new device.' });
      await load();
      setDetail((d) => (d && d.id === resetTarget.id ? { ...d, license_devices: [] } : d));
    } catch {
      toast({ title: 'Error', description: 'Failed to reset device', variant: 'destructive' });
    } finally {
      setActionBusy(false);
      setResetTarget(null);
    }
  };

  const StatCard = ({ icon: Icon, label, value, tone }: {
    icon: typeof KeyRound; label: string; value: number; tone: string;
  }) => (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${tone}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white leading-tight">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <AdminHeader title="License Management" subtitle="InventoryPro lifetime licenses" />

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={KeyRound} label="Total Licenses" value={stats.total} tone="bg-blue-500/15 border-blue-500/30 text-blue-300" />
          <StatCard icon={ShieldCheck} label="Active Licenses" value={stats.active} tone="bg-emerald-500/15 border-emerald-500/30 text-emerald-300" />
          <StatCard icon={ShieldOff} label="Disabled Licenses" value={stats.disabled} tone="bg-red-500/15 border-red-500/30 text-red-300" />
          <StatCard icon={MonitorSmartphone} label="Activated Devices" value={stats.devices} tone="bg-purple-500/15 border-purple-500/30 text-purple-300" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  filter === f.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial, customer, device…"
                className="w-64 pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create License
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No licenses match your filters.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-transparent">
                    <TableHead className="text-slate-400">License Key</TableHead>
                    <TableHead className="text-slate-400">Customer</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Device</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    <TableHead className="text-slate-400">Activated</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const dev = deviceOf(l);
                    return (
                      <TableRow key={l.id} className="border-slate-800/60 hover:bg-slate-800/40">
                        <TableCell>
                          <button onClick={() => copyKey(l.license_key)} className="group inline-flex items-center gap-2 font-mono text-sm text-white">
                            {l.license_key}
                            {copiedKey === l.license_key
                              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-slate-200">{l.customer_name}</TableCell>
                        <TableCell>
                          {l.status === 'active'
                            ? <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Active</Badge>
                            : <Badge className="bg-red-500/15 text-red-300 border border-red-500/30">Disabled</Badge>}
                        </TableCell>
                        <TableCell>
                          {dev
                            ? <span className="text-slate-200 text-sm">{dev.device_name || 'Bound device'}</span>
                            : <span className="text-slate-500 text-sm">Unactivated</span>}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">{fmtDate(l.created_at)}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{fmtDate(dev?.activated_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="View" onClick={() => setDetail(l)} className="text-slate-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {l.status === 'active' ? (
                              <Button variant="ghost" size="icon" title="Disable" onClick={() => setDisableTarget(l)} className="text-slate-400 hover:text-red-400">
                                <Power className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" title="Enable" onClick={() => enableLicense(l)} className="text-slate-400 hover:text-emerald-400">
                                <Power className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Reset Device" disabled={!dev} onClick={() => setResetTarget(l)} className="text-slate-400 hover:text-amber-400 disabled:opacity-30">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create License */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Create License</DialogTitle>
            <DialogDescription className="text-slate-400">
              A cryptographically-random serial is generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input id="customer_name" value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="bg-slate-800 border-slate-600" placeholder="Acme Store" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Customer Phone <span className="text-slate-500">(optional)</span></Label>
              <Input id="customer_phone" value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                className="bg-slate-800 border-slate-600" placeholder="+213…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes <span className="text-slate-500">(optional)</span></Label>
              <Textarea id="notes" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-slate-800 border-slate-600 min-h-[80px]" placeholder="Internal notes…" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
              <span className="text-sm text-slate-300">License Type</span>
              <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30">Lifetime</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : 'Create License'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono">{detail.license_key}</DialogTitle>
                <DialogDescription className="text-slate-400">Lifetime license details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Customer" value={detail.customer_name} />
                  <Field label="Phone" value={detail.customer_phone || '—'} />
                  <Field label="Status" value={detail.status === 'active' ? 'Active' : 'Disabled'} />
                  <Field label="Type" value="Lifetime" />
                  <Field label="Created" value={fmtDate(detail.created_at)} />
                </div>
                {detail.notes && <Field label="Notes" value={detail.notes} />}

                <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Bound Device</p>
                  {deviceOf(detail) ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Device Name" value={deviceOf(detail)!.device_name || '—'} />
                      <Field label="OS" value={deviceOf(detail)!.os || '—'} />
                      <Field label="Device Status" value={deviceOf(detail)!.status === 'active' ? 'Active' : 'Disabled'} />
                      <Field label="Activated" value={fmtDate(deviceOf(detail)!.activated_at)} />
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Fingerprint</p>
                        <p className="font-mono text-[11px] text-slate-300 break-all">{deviceOf(detail)!.device_fingerprint}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 flex items-center gap-2"><ShieldQuestion className="w-4 h-4" />No device bound yet.</p>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                {detail.status === 'active' ? (
                  <Button variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                    onClick={() => setDisableTarget(detail)}>
                    <ShieldOff className="w-4 h-4 mr-2" />Disable
                  </Button>
                ) : (
                  <Button variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => enableLicense(detail)}>
                    <ShieldCheck className="w-4 h-4 mr-2" />Enable
                  </Button>
                )}
                <Button variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                  disabled={!deviceOf(detail)} onClick={() => setResetTarget(detail)}>
                  <RotateCcw className="w-4 h-4 mr-2" />Reset Device
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable confirm */}
      <AlertDialog open={!!disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Disable this license?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              New activations and re-activations will be rejected. An already-activated device that is
              currently offline keeps working until it next connects to the internet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisable} disabled={actionBusy} className="bg-red-600 text-white hover:bg-red-700">
              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirm */}
      <AlertDialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset device binding?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              The current device binding will be removed. The same serial can then be used to activate
              a different device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} disabled={actionBusy} className="bg-amber-600 text-white hover:bg-amber-700">
              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Device'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-slate-200">{value}</p>
  </div>
);

export default AdminLicenses;
