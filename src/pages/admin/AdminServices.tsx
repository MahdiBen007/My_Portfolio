import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Service {
  id: string;
  title: string;
  title_ar: string | null;
  description: string;
  description_ar: string | null;
  icon: string;
  tags: string[];
  cta_label: string | null;
  cta_link: string | null;
  sort_order: number;
  visible: boolean;
}

const iconOptions = [
  'Code', 'Layout', 'Smartphone', 'Globe', 'Server', 'Database',
  'Shield', 'Zap', 'Palette', 'Settings', 'Terminal', 'Cloud',
];

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    icon: 'Code',
    tags: '',
    cta_label: '',
    cta_link: '',
    visible: true,
  });

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      icon: 'Code',
      tags: '',
      cta_label: '',
      cta_link: '',
      visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      title_ar: service.title_ar || '',
      description: service.description,
      description_ar: service.description_ar || '',
      icon: service.icon,
      tags: service.tags?.join(', ') || '',
      cta_label: service.cta_label || '',
      cta_link: service.cta_link || '',
      visible: service.visible,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const serviceData = {
        title: formData.title,
        title_ar: formData.title_ar || null,
        description: formData.description,
        description_ar: formData.description_ar || null,
        icon: formData.icon,
        tags: tagsArray,
        cta_label: formData.cta_label || null,
        cta_link: formData.cta_link || null,
        visible: formData.visible,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Service updated successfully' });
      } else {
        const { error } = await supabase.from('services').insert({
          ...serviceData,
          sort_order: services.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Service created successfully' });
      }

      setIsDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Error',
        description: 'Failed to save service',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Service deleted successfully' });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
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
        .from('services')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div>
      <AdminHeader title="Services" subtitle="Manage your services" />

      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <p className="text-xs sm:text-sm text-slate-400">
            {services.length} service{services.length !== 1 ? 's' : ''} total
          </p>
          <Button
            onClick={openCreateDialog}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 mb-4">No services yet</p>
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create your first service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <button className="text-slate-500 hover:text-slate-300 cursor-grab mt-1 sm:mt-0 shrink-0" aria-label="Reorder">
                        <GripVertical className="w-5 h-5" />
                      </button>

                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <span className="text-blue-400 text-xs sm:text-sm font-medium">{service.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-medium text-sm sm:text-base text-white truncate">{service.title}</h3>
                          {!service.visible && (
                            <Badge variant="secondary" className="bg-slate-700 text-slate-400 text-[10px] sm:text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-0.5">{service.description}</p>
                        {service.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                            {service.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] sm:text-xs border-slate-600 text-slate-400"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {service.tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] sm:text-xs border-slate-600 text-slate-400"
                              >
                                +{service.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(service.id, service.visible)}
                        className="text-slate-400 hover:text-white h-8 w-8"
                        aria-label="Toggle visibility"
                      >
                        {service.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                        className="text-slate-400 hover:text-white h-8 w-8"
                        aria-label="Edit service"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(service.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-slate-400 hover:text-red-400 h-8 w-8"
                        aria-label="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Create Service'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingService ? 'Update the service details below' : 'Add a new service to your portfolio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (English) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Web Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_ar">Title (Arabic)</Label>
                <Input
                  id="title_ar"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="تطوير الويب"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[80px] sm:min-h-[100px]"
                  placeholder="Building modern, responsive websites..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabic)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[80px] sm:min-h-[100px]"
                  dir="rtl"
                  placeholder="بناء مواقع ويب حديثة..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                      formData.icon === icon
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="React, Node.js, TypeScript"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_label">CTA Label</Label>
                <Input
                  id="cta_label"
                  value={formData.cta_label}
                  onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">CTA Link</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="/services/web-development"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="visible" className="text-xs sm:text-sm">Visible on website</Label>
              <Switch
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600"
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
            <AlertDialogTitle className="text-white">Delete Service?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The service will be permanently deleted.
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

export default AdminServices;
