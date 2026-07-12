import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Crown, Sparkles, Rocket, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface PricingPlan {
  id: string;
  name_ar: string;
  name_en: string;
  price_ar: string;
  price_en: string;
  currency_ar: string;
  currency_en: string;
  desc_ar: string;
  desc_en: string;
  icon: string;
  badge_ar: string | null;
  badge_en: string | null;
  featured: boolean;
  features_ar: string[];
  features_en: string[];
  cta_ar: string;
  cta_en: string;
  cta_link: string | null;
  sort_order: number;
  visible: boolean;
}

const iconOptions = [
  { value: 'Rocket', label: 'Rocket', icon: Rocket },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Crown', label: 'Crown', icon: Crown },
  { value: 'Star', label: 'Star', icon: Star },
];

const getIcon = (name: string) => {
  const found = iconOptions.find((i) => i.value === name);
  return found ? found.icon : Rocket;
};

const AdminPricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    price_ar: '',
    price_en: '',
    currency_ar: 'دج',
    currency_en: 'DZD',
    desc_ar: '',
    desc_en: '',
    icon: 'Rocket',
    badge_ar: '',
    badge_en: '',
    featured: false,
    features_ar: '',
    features_en: '',
    cta_ar: '',
    cta_en: '',
    cta_link: '',
    visible: true,
  });

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pricing plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name_ar: '',
      name_en: '',
      price_ar: '',
      price_en: '',
      currency_ar: 'دج',
      currency_en: 'DZD',
      desc_ar: '',
      desc_en: '',
      icon: 'Rocket',
      badge_ar: '',
      badge_en: '',
      featured: false,
      features_ar: '',
      features_en: '',
      cta_ar: '',
      cta_en: '',
      cta_link: '',
      visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name_ar: plan.name_ar,
      name_en: plan.name_en,
      price_ar: plan.price_ar,
      price_en: plan.price_en,
      currency_ar: plan.currency_ar,
      currency_en: plan.currency_en,
      desc_ar: plan.desc_ar,
      desc_en: plan.desc_en,
      icon: plan.icon,
      badge_ar: plan.badge_ar || '',
      badge_en: plan.badge_en || '',
      featured: plan.featured,
      features_ar: plan.features_ar?.join('\n') || '',
      features_en: plan.features_en?.join('\n') || '',
      cta_ar: plan.cta_ar,
      cta_en: plan.cta_en,
      cta_link: plan.cta_link || '',
      visible: plan.visible,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_en || !formData.price_en) {
      toast({
        title: 'Validation Error',
        description: 'Plan name and price are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const featuresAr = formData.features_ar
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f);
      const featuresEn = formData.features_en
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f);

      const planData = {
        name_ar: formData.name_ar || formData.name_en,
        name_en: formData.name_en,
        price_ar: formData.price_ar || formData.price_en,
        price_en: formData.price_en,
        currency_ar: formData.currency_ar,
        currency_en: formData.currency_en,
        desc_ar: formData.desc_ar || formData.desc_en,
        desc_en: formData.desc_en,
        icon: formData.icon,
        badge_ar: formData.badge_ar || null,
        badge_en: formData.badge_en || null,
        featured: formData.featured,
        features_ar: featuresAr,
        features_en: featuresEn,
        cta_ar: formData.cta_ar || formData.cta_en,
        cta_en: formData.cta_en,
        cta_link: formData.cta_link || null,
        visible: formData.visible,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Plan updated successfully' });
      } else {
        const { error } = await supabase.from('pricing_plans').insert({
          ...planData,
          sort_order: plans.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Plan created successfully' });
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('pricing_plans').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Plan deleted successfully' });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchPlans();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      fetchPlans();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  return (
    <div>
      <AdminHeader title="Pricing Plans" subtitle="Manage your pricing plans" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-400">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} total
          </p>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 mb-4">No pricing plans yet</p>
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create your first plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const Icon = getIcon(plan.icon);
              return (
                <Card
                  key={plan.id}
                  className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <button className="text-slate-500 hover:text-slate-300 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </button>

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.featured
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                          : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                      }`}>
                        <Icon className={`w-5 h-5 ${plan.featured ? 'text-yellow-400' : 'text-blue-400'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{plan.name_en}</h3>
                          <span className="text-sm text-slate-500">{plan.name_ar}</span>
                          {plan.featured && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Featured
                            </Badge>
                          )}
                          {!plan.visible && (
                            <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">{plan.desc_en}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg font-bold text-white">{plan.price_en} {plan.currency_en}</span>
                          <span className="text-sm text-slate-500">{plan.features_en?.length || 0} features</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(plan.id, plan.featured)}
                          className="text-slate-400 hover:text-yellow-400"
                          title="Toggle featured"
                        >
                          <Star className={`w-4 h-4 ${plan.featured ? 'fill-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(plan.id, plan.visible)}
                          className="text-slate-400 hover:text-white"
                        >
                          {plan.visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(plan)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(plan.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingPlan ? 'Update the plan details below' : 'Add a new pricing plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">Plan Name (English) *</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Business"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ar">Plan Name (Arabic)</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="بيزنس"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_en">Price (English) *</Label>
                <Input
                  id="price_en"
                  value={formData.price_en}
                  onChange={(e) => setFormData({ ...formData, price_en: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="20,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_ar">Price (Arabic)</Label>
                <Input
                  id="price_ar"
                  value={formData.price_ar}
                  onChange={(e) => setFormData({ ...formData, price_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="20,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency_en">Currency (English)</Label>
                <Input
                  id="currency_en"
                  value={formData.currency_en}
                  onChange={(e) => setFormData({ ...formData, currency_en: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="DZD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_ar">Currency (Arabic)</Label>
                <Input
                  id="currency_ar"
                  value={formData.currency_ar}
                  onChange={(e) => setFormData({ ...formData, currency_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="دج"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desc_en">Description (English) *</Label>
                <Textarea
                  id="desc_en"
                  value={formData.desc_en}
                  onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[80px]"
                  placeholder="Perfect for businesses that want a unique online presence."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc_ar">Description (Arabic)</Label>
                <Textarea
                  id="desc_ar"
                  value={formData.desc_ar}
                  onChange={(e) => setFormData({ ...formData, desc_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[80px]"
                  dir="rtl"
                  placeholder="مثالي للشركات التي تريد حضورًا إلكترونيًا فريدًا."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      formData.icon === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge_en">Badge (English)</Label>
                <Input
                  id="badge_en"
                  value={formData.badge_en}
                  onChange={(e) => setFormData({ ...formData, badge_en: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="MOST POPULAR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge_ar">Badge (Arabic)</Label>
                <Input
                  id="badge_ar"
                  value={formData.badge_ar}
                  onChange={(e) => setFormData({ ...formData, badge_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="الأكثر طلباً"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features_en">Features (English, one per line)</Label>
              <Textarea
                id="features_en"
                value={formData.features_en}
                onChange={(e) => setFormData({ ...formData, features_en: e.target.value })}
                className="bg-slate-800 border-slate-600 min-h-[150px]"
                placeholder={"Complete Admin Dashboard\nUnlimited Products\nResponsive Design"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features_ar">Features (Arabic, one per line)</Label>
              <Textarea
                id="features_ar"
                value={formData.features_ar}
                onChange={(e) => setFormData({ ...formData, features_ar: e.target.value })}
                className="bg-slate-800 border-slate-600 min-h-[150px]"
                dir="rtl"
                placeholder={"لوحة تحكم إدارية كاملة\nمنتجات غير محدودة\nتصميم متجاوب"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_en">CTA Button (English)</Label>
                <Input
                  id="cta_en"
                  value={formData.cta_en}
                  onChange={(e) => setFormData({ ...formData, cta_en: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Choose Business"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_ar">CTA Button (Arabic)</Label>
                <Input
                  id="cta_ar"
                  value={formData.cta_ar}
                  onChange={(e) => setFormData({ ...formData, cta_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="اختر بيزنس"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_link">CTA Link (optional)</Label>
              <Input
                id="cta_link"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured plan</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visible">Visible on website</Label>
              <Switch
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
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
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The pricing plan will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default AdminPricing;
