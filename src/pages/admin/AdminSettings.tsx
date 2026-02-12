import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Palette, Globe, Link2, FileText, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminHeader from '@/components/admin/AdminHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Settings {
  id: string;
  primary_color: string | null;
  secondary_color: string | null;
  navbar_border_color: string | null;
  navbar_glow_color: string | null;
  navbar_glow_intensity: number | null;
  background_gradient: string | null;
  background_gradient_alt: string | null;
  border_radius: number | null;
  spacing_density: string | null;
  ui_font: string | null;
  site_font: string | null;
  animations_enabled: boolean | null;
  shadow_intensity: number | null;
  admin_portfolio_primary_color: string | null;
  admin_portfolio_secondary_color: string | null;
  admin_studio_primary_color: string | null;
  admin_studio_secondary_color: string | null;
  meta_title: string | null;
  admin_meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  keywords: string | null;
  canonical_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  behance_url: string | null;
  email: string | null;
  whatsapp: string | null;
  phone: string | null;
  location: string | null;
  location_en: string | null;
  custom_links: unknown;
  copyright_text: string | null;
  footer_links: unknown;
  footer_contact_info: string | null;
  locale: 'ar' | 'en' | null;
}

const gradientPresets = [
  { value: 'night', label: 'Night', colors: 'from-slate-950 via-slate-900 to-indigo-950' },
  { value: 'midnight', label: 'Midnight Purple', colors: 'from-slate-950 via-purple-950 to-slate-900' },
  { value: 'ocean', label: 'Deep Ocean', colors: 'from-slate-950 via-blue-950 to-slate-900' },
  { value: 'forest', label: 'Dark Forest', colors: 'from-slate-950 via-emerald-950 to-slate-900' },
];

const fontOptions = [
  'Plus Jakarta Sans',
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, user, signOut } = useAuth();
  const [accountForm, setAccountForm] = useState({
    currentEmail: '',
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const navigate = useNavigate();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      const safeLocale = data.locale === 'en' ? 'en' : 'ar';
      setSettings({
        ...data,
        primary_color: data.primary_color ?? '#3b82f6',
        secondary_color: data.secondary_color ?? '#8b5cf6',
        navbar_border_color: data.navbar_border_color ?? (data.primary_color ?? '#22d3ee'),
        navbar_glow_color: data.navbar_glow_color ?? (data.primary_color ?? '#22d3ee'),
        navbar_glow_intensity: data.navbar_glow_intensity ?? 100,
        background_gradient: data.background_gradient ?? 'night',
        background_gradient_alt: data.background_gradient_alt ?? 'midnight',
        border_radius: data.border_radius ?? 16,
        spacing_density: data.spacing_density ?? 'comfortable',
        ui_font: data.ui_font ?? 'Plus Jakarta Sans',
        site_font: data.site_font ?? 'Plus Jakarta Sans',
        animations_enabled: data.animations_enabled ?? true,
        shadow_intensity: data.shadow_intensity ?? 50,
        admin_portfolio_primary_color: data.admin_portfolio_primary_color ?? '#22d3ee',
        admin_portfolio_secondary_color: data.admin_portfolio_secondary_color ?? '#8b5cf6',
        admin_studio_primary_color: data.admin_studio_primary_color ?? '#3b82f6',
        admin_studio_secondary_color: data.admin_studio_secondary_color ?? '#8b5cf6',
        meta_title: data.meta_title ?? '',
        meta_description: data.meta_description ?? '',
        keywords: data.keywords ?? '',
        canonical_url: data.canonical_url ?? '',
        og_image_url: data.og_image_url ?? '',
        github_url: data.github_url ?? '',
        linkedin_url: data.linkedin_url ?? '',
        behance_url: data.behance_url ?? '',
        email: data.email ?? '',
        whatsapp: data.whatsapp ?? '',
        phone: data.phone ?? '',
        location: data.location ?? '',
        location_en: data.location_en ?? '',
        copyright_text: data.copyright_text ?? '',
        footer_contact_info: data.footer_contact_info ?? '',
        admin_meta_title: data.admin_meta_title ?? 'Admin Dashboard',
        locale: safeLocale,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setAccountForm((prev) => ({ ...prev, currentEmail: user.email ?? '' }));
    }
  }, [user?.email]);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const payload = {
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        navbar_border_color: settings.navbar_border_color,
        navbar_glow_color: settings.navbar_glow_color,
        navbar_glow_intensity: settings.navbar_glow_intensity,
        background_gradient: settings.background_gradient,
        background_gradient_alt: settings.background_gradient_alt,
        border_radius: settings.border_radius,
        spacing_density: settings.spacing_density,
        ui_font: settings.ui_font,
        site_font: settings.site_font,
        animations_enabled: settings.animations_enabled,
        shadow_intensity: settings.shadow_intensity,
        admin_portfolio_primary_color: settings.admin_portfolio_primary_color,
        admin_portfolio_secondary_color: settings.admin_portfolio_secondary_color,
        admin_studio_primary_color: settings.admin_studio_primary_color,
        admin_studio_secondary_color: settings.admin_studio_secondary_color,
        meta_title: settings.meta_title,
        admin_meta_title: settings.admin_meta_title,
        meta_description: settings.meta_description,
        og_image_url: settings.og_image_url,
        keywords: settings.keywords,
        canonical_url: settings.canonical_url,
        github_url: settings.github_url,
        linkedin_url: settings.linkedin_url,
        behance_url: settings.behance_url,
        email: settings.email,
        whatsapp: settings.whatsapp,
        phone: settings.phone,
        location: settings.location,
        location_en: settings.location_en,
        copyright_text: settings.copyright_text,
        footer_contact_info: settings.footer_contact_info,
        locale: settings.locale ?? 'ar',
      };

      let usedFallback = false;

      const { error } = await supabase.from('settings').update(payload).eq('id', settings.id);

      if (error) {
        const message = typeof error?.message === 'string' ? error.message : '';
        const code = (error as { code?: string }).code;
        const schemaMissing =
          message.includes('schema cache') ||
          message.includes('column') ||
          code === 'PGRST204' ||
          code === '42703';

        if (schemaMissing) {
          const {
            phone,
            location,
            location_en,
            navbar_border_color,
            navbar_glow_color,
            navbar_glow_intensity,
            ...fallback
          } = payload;
          const { error: fallbackError } = await supabase
            .from('settings')
            .update(fallback)
            .eq('id', settings.id);
          if (fallbackError) throw fallbackError;
          usedFallback = true;
        } else {
          throw error;
        }
      }

      const nextAdminTitle = settings.admin_meta_title?.trim() || 'Admin Dashboard';
      window.dispatchEvent(
        new CustomEvent('admin-meta-title-updated', { detail: nextAdminTitle })
      );
      window.dispatchEvent(
        new CustomEvent('admin-theme-updated', {
          detail: {
            portfolio: {
              accent: settings.admin_portfolio_primary_color,
              accentStrong: settings.admin_portfolio_secondary_color,
            },
            studio: {
              accent: settings.admin_studio_primary_color,
              accentStrong: settings.admin_studio_secondary_color,
            },
          },
        })
      );
      if (usedFallback) {
        toast({
          title: 'Saved with warning',
          description:
            'تم الحفظ، لكن حقول الهاتف/الموقع تحتاج تحديث قاعدة البيانات.',
        });
      } else {
        toast({ title: 'Success', description: 'Settings saved successfully' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!user) return;

    const { currentEmail, currentPassword, newEmail, newPassword, confirmPassword } = accountForm;

    if (!currentEmail || !currentPassword) {
      toast({
        title: 'Missing info',
        description: 'Please enter your current email and password.',
        variant: 'destructive',
      });
      return;
    }

    if (!newEmail && !newPassword) {
      toast({
        title: 'Nothing to update',
        description: 'Enter a new email or a new password.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please confirm the new password correctly.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingAccount(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });

      if (authError) throw authError;

      if (newEmail) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
      }

      let passwordChanged = false;
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        passwordChanged = true;
      }

      toast({
        title: 'Account updated',
        description: passwordChanged
          ? 'Password updated. Please sign in again.'
          : 'Email update requested. Check your inbox if confirmation is required.',
      });

      setAccountForm({
        currentEmail: newEmail || currentEmail,
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmPassword: '',
      });

      if (passwordChanged) {
        await signOut();
        navigate('/admin/login', { replace: true });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update account details.';
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingAccount(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Settings" subtitle="Configure global settings" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div>
        <AdminHeader title="Settings" subtitle="Configure global settings" />
        <div className="p-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No settings found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <AdminHeader title="Settings" subtitle="Configure global settings" />
        <div className="p-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">Only admins can modify settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Configure global settings" />

      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="bg-slate-800/50 flex w-full max-w-[360px] sm:max-w-3xl overflow-x-auto gap-2 p-1 rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger value="theme" className="data-[state=active]:bg-blue-600 shrink-0 whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600 shrink-0 whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
              <Globe className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-blue-600 shrink-0 whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-blue-600 shrink-0 whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
              <Link2 className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-blue-600 shrink-0 whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
              <FileText className="w-4 h-4 mr-2" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-4">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Theme & UI Controls</CardTitle>
                <CardDescription className="text-slate-400">
                  Customize the look and feel of your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.primary_color}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                        className="bg-slate-800 border-slate-600 flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.secondary_color}
                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                        className="bg-slate-800 border-slate-600 flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Header Scroll Border Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.navbar_border_color || '#22d3ee'}
                        onChange={(e) => setSettings({ ...settings, navbar_border_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.navbar_border_color || ''}
                        onChange={(e) => setSettings({ ...settings, navbar_border_color: e.target.value })}
                        className="bg-slate-800 border-slate-600 flex-1"
                        placeholder="#22d3ee"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Header Scroll Glow Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.navbar_glow_color || '#22d3ee'}
                        onChange={(e) => setSettings({ ...settings, navbar_glow_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.navbar_glow_color || ''}
                        onChange={(e) => setSettings({ ...settings, navbar_glow_color: e.target.value })}
                        className="bg-slate-800 border-slate-600 flex-1"
                        placeholder="#22d3ee"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Header Glow Intensity: {settings.navbar_glow_intensity ?? 100}%</Label>
                  <Slider
                    value={[settings.navbar_glow_intensity ?? 100]}
                    onValueChange={([value]) => setSettings({ ...settings, navbar_glow_intensity: value })}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                </div>

                {/* Admin Theme Colors */}
                <div className="space-y-3">
                  <Label>Admin Theme Colors</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 space-y-3">
                      <p className="text-sm text-slate-300">Portfolio Theme</p>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Primary Accent</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.admin_portfolio_primary_color || '#22d3ee'}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_portfolio_primary_color: e.target.value })
                            }
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.admin_portfolio_primary_color || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_portfolio_primary_color: e.target.value })
                            }
                            className="bg-slate-800 border-slate-600 flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Secondary Accent</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.admin_portfolio_secondary_color || '#8b5cf6'}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_portfolio_secondary_color: e.target.value })
                            }
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.admin_portfolio_secondary_color || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_portfolio_secondary_color: e.target.value })
                            }
                            className="bg-slate-800 border-slate-600 flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 space-y-3">
                      <p className="text-sm text-slate-300">Studio Theme</p>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Primary Accent</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.admin_studio_primary_color || '#3b82f6'}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_studio_primary_color: e.target.value })
                            }
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.admin_studio_primary_color || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_studio_primary_color: e.target.value })
                            }
                            className="bg-slate-800 border-slate-600 flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Secondary Accent</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.admin_studio_secondary_color || '#8b5cf6'}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_studio_secondary_color: e.target.value })
                            }
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.admin_studio_secondary_color || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, admin_studio_secondary_color: e.target.value })
                            }
                            className="bg-slate-800 border-slate-600 flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gradient Presets */}
                <div className="space-y-2">
                  <Label>Background Gradient</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {gradientPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setSettings({ ...settings, background_gradient: preset.value })}
                        className={`p-4 rounded-xl border transition-all ${
                          settings.background_gradient === preset.value
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${preset.colors} mb-2`} />
                        <p className="text-sm text-white">{preset.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Theme Toggle (Alternate)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {gradientPresets.map((preset) => (
                      <button
                        key={`alt-${preset.value}`}
                        onClick={() => setSettings({ ...settings, background_gradient_alt: preset.value })}
                        className={`p-4 rounded-xl border transition-all ${
                          settings.background_gradient_alt === preset.value
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${preset.colors} mb-2`} />
                        <p className="text-sm text-white">{preset.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    This palette shows when you toggle the theme button on the portfolio.
                  </p>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Border Radius: {settings.border_radius}px</Label>
                    <Slider
                      value={[settings.border_radius]}
                      onValueChange={([value]) => setSettings({ ...settings, border_radius: value })}
                      max={32}
                      step={2}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shadow Intensity: {settings.shadow_intensity}%</Label>
                    <Slider
                      value={[settings.shadow_intensity]}
                      onValueChange={([value]) => setSettings({ ...settings, shadow_intensity: value })}
                      max={100}
                      step={5}
                      className="py-2"
                    />
                  </div>
                </div>

                {/* Fonts */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>UI Font</Label>
                    <Select
                      value={settings.ui_font}
                      onValueChange={(value) => setSettings({ ...settings, ui_font: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Site Font</Label>
                    <Select
                      value={settings.site_font}
                      onValueChange={(value) => setSettings({ ...settings, site_font: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select
                      value={settings.locale ?? 'ar'}
                      onValueChange={(value) =>
                        setSettings({ ...settings, locale: value as 'ar' | 'en' })
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="ar">Arabic (AR)</SelectItem>
                        <SelectItem value="en">English (EN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Spacing & Animations */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Spacing Density</Label>
                    <Select
                      value={settings.spacing_density}
                      onValueChange={(value) => setSettings({ ...settings, spacing_density: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <Label htmlFor="animations">Animations Enabled</Label>
                    <Switch
                      id="animations"
                      checked={settings.animations_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, animations_enabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">SEO Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Optimize your portfolio for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_meta_title">Dashboard Meta Title</Label>
                  <Input
                    id="admin_meta_title"
                    value={settings.admin_meta_title || ''}
                    onChange={(e) => setSettings({ ...settings, admin_meta_title: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Admin Dashboard"
                  />
                  <p className="text-xs text-slate-500">
                    {(settings.admin_meta_title || '').length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={settings.meta_title}
                    onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Your Portfolio Title"
                  />
                  <p className="text-xs text-slate-500">{settings.meta_title.length}/60 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={settings.meta_description || ''}
                    onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Brief description of your portfolio..."
                  />
                  <p className="text-xs text-slate-500">
                    {(settings.meta_description || '').length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image">OG Image URL</Label>
                  <Input
                    id="og_image"
                    value={settings.og_image_url || ''}
                    onChange={(e) => setSettings({ ...settings, og_image_url: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={settings.keywords || ''}
                    onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="web developer, react, portfolio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical">Canonical URL</Label>
                  <Input
                    id="canonical"
                    value={settings.canonical_url || ''}
                    onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Account Security</CardTitle>
                <CardDescription className="text-slate-400">
                  Update the admin login email or password. For security, confirm your current credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_email">Current Email</Label>
                    <Input
                      id="current_email"
                      value={accountForm.currentEmail}
                      onChange={(e) =>
                        setAccountForm({ ...accountForm, currentEmail: e.target.value })
                      }
                      className="bg-slate-800 border-slate-600"
                      placeholder="admin@local.test"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={accountForm.currentPassword}
                      onChange={(e) =>
                        setAccountForm({ ...accountForm, currentPassword: e.target.value })
                      }
                      className="bg-slate-800 border-slate-600"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_email">New Email</Label>
                    <Input
                      id="new_email"
                      value={accountForm.newEmail}
                      onChange={(e) =>
                        setAccountForm({ ...accountForm, newEmail: e.target.value })
                      }
                      className="bg-slate-800 border-slate-600"
                      placeholder="new-admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={accountForm.newPassword}
                      onChange={(e) =>
                        setAccountForm({ ...accountForm, newPassword: e.target.value })
                      }
                      className="bg-slate-800 border-slate-600"
                      placeholder="Create a strong password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={accountForm.confirmPassword}
                      onChange={(e) =>
                        setAccountForm({ ...accountForm, confirmPassword: e.target.value })
                      }
                      className="bg-slate-800 border-slate-600"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    If you update the email, Supabase may require email confirmation.
                  </p>
                  <Button
                    onClick={handleUpdateCredentials}
                    disabled={updatingAccount}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {updatingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription className="text-slate-400">
                  Add your social media and contact links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={settings.github_url || ''}
                      onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={settings.linkedin_url || ''}
                      onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="behance">Behance</Label>
                    <Input
                      id="behance"
                      value={settings.behance_url || ''}
                      onChange={(e) => setSettings({ ...settings, behance_url: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="https://behance.net/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={settings.email || ''}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="+20 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Arabic)</Label>
                    <Input
                      id="location"
                      value={settings.location || ''}
                      onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="القاهرة، مصر"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_en">Location (English)</Label>
                  <Input
                    id="location_en"
                    value={settings.location_en || ''}
                    onChange={(e) => setSettings({ ...settings, location_en: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Cairo, Egypt"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Settings */}
          <TabsContent value="footer">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Footer Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Customize your footer content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright Text</Label>
                  <Input
                    id="copyright"
                    value={settings.copyright_text}
                    onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="© 2024 Your Name. All rights reserved."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_contact">Contact Info</Label>
                  <Textarea
                    id="footer_contact"
                    value={settings.footer_contact_info || ''}
                    onChange={(e) => setSettings({ ...settings, footer_contact_info: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Your address, phone number, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
