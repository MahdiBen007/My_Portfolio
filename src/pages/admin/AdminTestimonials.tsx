import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Star, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { validateFile, sanitizeFileName } from '@/lib/fileValidation';
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

interface Testimonial {
  id: string;
  customer_name: string;
  customer_name_ar: string;
  company: string;
  company_ar: string;
  review: string;
  review_ar: string;
  photo_url: string | null;
  stars: number;
  sort_order: number;
  visible: boolean;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_name_ar: '',
    company: '',
    company_ar: '',
    review: '',
    review_ar: '',
    photo_url: '',
    stars: 5,
    visible: true,
  });

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch testimonials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      customer_name: '',
      customer_name_ar: '',
      company: '',
      company_ar: '',
      review: '',
      review_ar: '',
      photo_url: '',
      stars: 5,
      visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      customer_name: item.customer_name,
      customer_name_ar: item.customer_name_ar,
      company: item.company,
      company_ar: item.company_ar,
      review: item.review,
      review_ar: item.review_ar,
      photo_url: item.photo_url || '',
      stars: item.stars,
      visible: item.visible,
    });
    setIsDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      toast({ title: 'Error', description: validation.error, variant: 'destructive' });
      return;
    }

    setUploadingPhoto(true);
    try {
      const safeName = sanitizeFileName(file.name);
      const filePath = `testimonials/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: urlData.publicUrl });
      toast({ title: 'Success', description: 'Photo uploaded successfully' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customer_name || !formData.review) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and review are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const testimonialData = {
        customer_name: formData.customer_name,
        customer_name_ar: formData.customer_name_ar || formData.customer_name,
        company: formData.company,
        company_ar: formData.company_ar || formData.company,
        review: formData.review,
        review_ar: formData.review_ar || formData.review,
        photo_url: formData.photo_url || null,
        stars: formData.stars,
        visible: formData.visible,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Testimonial updated successfully' });
      } else {
        const { error } = await supabase.from('testimonials').insert({
          ...testimonialData,
          sort_order: testimonials.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Testimonial created successfully' });
      }

      setIsDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to save testimonial',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Testimonial deleted successfully' });
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
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
        .from('testimonials')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div>
      <AdminHeader title="Testimonials" subtitle="Manage customer testimonials" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-sm sm:text-base text-slate-400">
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} total
          </p>
          <Button
            onClick={openCreateDialog}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 mb-4">No testimonials yet</p>
              <Button onClick={openCreateDialog} variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add your first testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {testimonials.map((item) => (
              <Card
                key={item.id}
                className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <button className="text-slate-500 hover:text-slate-300 cursor-grab shrink-0 mt-1 sm:mt-0">
                        <GripVertical className="w-5 h-5" />
                      </button>

                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.customer_name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-600 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-base sm:text-lg font-bold text-blue-400 shrink-0">
                          {item.customer_name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-medium text-white text-sm sm:text-base">{item.customer_name}</h3>
                          {item.customer_name_ar && (
                            <span className="text-xs sm:text-sm text-slate-400">({item.customer_name_ar})</span>
                          )}
                          {!item.visible && (
                            <Badge variant="secondary" className="bg-slate-700 text-slate-400 text-[10px] sm:text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-0.5">{item.review}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.company && <span className="text-xs text-slate-500">{item.company}</span>}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < item.stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-t-0 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(item.id, item.visible)}
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        title="Toggle visibility"
                      >
                        {item.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                        title="Delete"
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingItem ? 'Update the testimonial details below' : 'Add a new customer testimonial'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 sm:py-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Customer Photo</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {formData.photo_url ? (
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-slate-600 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {formData.photo_url ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {formData.photo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, photo_url: '' })}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name (English) *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Ahmed Benali"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name_ar">Customer Name (Arabic)</Label>
                <Input
                  id="customer_name_ar"
                  value={formData.customer_name_ar}
                  onChange={(e) => setFormData({ ...formData, customer_name_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="أحمد بن علي"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company (English)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="TechCorp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_ar">Company (Arabic)</Label>
                <Input
                  id="company_ar"
                  value={formData.company_ar}
                  onChange={(e) => setFormData({ ...formData, company_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                  placeholder="تك كورب"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Review (English) *</Label>
              <Textarea
                id="review"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="bg-slate-800 border-slate-600 min-h-[80px]"
                placeholder="Amazing service and professional team..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_ar">Review (Arabic)</Label>
              <Textarea
                id="review_ar"
                value={formData.review_ar}
                onChange={(e) => setFormData({ ...formData, review_ar: e.target.value })}
                className="bg-slate-800 border-slate-600 min-h-[80px]"
                dir="rtl"
                placeholder="خدمة مذهلة وفريق محترف..."
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, stars: i + 1 })}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        i < formData.stars
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 py-1">
              <Switch
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
              />
              <Label className="text-sm">Visible on website</Label>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTestimonials;
