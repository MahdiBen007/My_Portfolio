import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminHeader from '@/components/admin/AdminHeader';
import { skillBrandColors, skillIcons } from '@/components/skills/skillAssets';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SkillCategory = 'frontend' | 'backend' | 'database' | 'tools' | 'other';

interface Skill {
  id: string;
  name: string;
  name_ar: string | null;
  icon: string;
  category: SkillCategory;
  level: number;
  brand_color: string | null;
  sort_order: number;
  visible: boolean;
}

const categoryColors: Record<SkillCategory, string> = {
  frontend: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  backend: 'bg-green-500/20 text-green-400 border-green-500/30',
  database: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  tools: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const iconOptions = [
  'Code', 'Braces', 'FileCode', 'Terminal', 'Database', 'Server',
  'Globe', 'Layout', 'Palette', 'GitBranch', 'Box', 'Cloud',
];

const AdminSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<SkillCategory | 'all'>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    icon: 'Code',
    category: 'frontend' as SkillCategory,
    level: 80,
    brand_color: '#3b82f6',
    visible: true,
  });

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch skills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const filteredSkills = filterCategory === 'all'
    ? skills
    : skills.filter((s) => s.category === filterCategory);
  const previewSkills = filteredSkills.filter((skill) => skill.visible);

  const openCreateDialog = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      name_ar: '',
      icon: 'Code',
      category: 'frontend',
      level: 80,
      brand_color: '#3b82f6',
      visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      name_ar: skill.name_ar || '',
      icon: skill.icon,
      category: skill.category,
      level: skill.level,
      brand_color: skill.brand_color || '#3b82f6',
      visible: skill.visible,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.name_ar) {
      toast({
        title: 'Validation Error',
        description: 'English and Arabic names are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const skillData = {
        name: formData.name,
        name_ar: formData.name_ar,
        icon: formData.icon,
        category: formData.category,
        level: formData.level,
        brand_color: formData.brand_color,
        visible: formData.visible,
      };

      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Skill updated successfully' });
      } else {
        const { error } = await supabase.from('skills').insert({
          ...skillData,
          sort_order: skills.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Skill created successfully' });
      }

      setIsDialogOpen(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to save skill',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('skills').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Skill deleted successfully' });
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete skill',
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
        .from('skills')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchSkills();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div>
      <AdminHeader title="Skills" subtitle="Manage your skills" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <p className="text-slate-400">
              {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              {(['all', 'frontend', 'backend', 'database', 'tools', 'other'] as const).map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className={`capitalize ${filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-700/50 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2 mb-6">
                  <h3 className="text-lg font-semibold text-white">Portfolio Preview</h3>
                  <p className="text-sm text-slate-400">
                    Preview how skills will appear on the portfolio (visible skills only).
                  </p>
                </div>

                {previewSkills.length === 0 ? (
                  <p className="text-slate-400 text-sm">No visible skills to preview.</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {previewSkills.map((skill, index) => {
                      const iconKey = (skill.icon ?? '').toLowerCase();
                      const brand = skill.brand_color
                        ? { color: skill.brand_color, glow: `${skill.brand_color}40` }
                        : skillBrandColors[iconKey] ?? {
                          color: '#22d3ee',
                          glow: 'rgba(34,211,238,0.35)',
                        };

                      return (
                        <div
                          key={`${skill.name}-${skill.category}-${index}`}
                          className="group glass-card rounded-2xl p-6 aspect-[5/2] w-[220px] md:w-[240px] flex flex-col items-center justify-center text-center shadow-card overflow-hidden relative"
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                            style={{
                              color: brand.color,
                              boxShadow: `0 10px 35px ${brand.glow}`,
                              background:
                                'linear-gradient(135deg, hsl(var(--glass)), hsl(var(--glass-border) / 0.45))',
                            }}
                          >
                            {skillIcons[iconKey] ?? skillIcons.react}
                          </div>
                          <p className="font-semibold text-base md:text-lg leading-tight">
                            {skill.name}
                          </p>
                          {skill.name_ar && (
                            <p className="text-xs text-slate-400 mt-1" dir="rtl">
                              {skill.name_ar}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredSkills.length === 0 ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400 mb-4">No skills yet</p>
                  <Button onClick={openCreateDialog} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first skill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                  <Card
                    key={skill.id}
                    className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: skill.brand_color ? `${skill.brand_color}20` : undefined,
                              borderColor: skill.brand_color || undefined,
                              borderWidth: skill.brand_color ? 1 : 0,
                            }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: skill.brand_color || '#fff' }}
                            >
                              {skill.icon.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{skill.name}</h3>
                            {skill.name_ar && (
                              <p className="text-xs text-slate-400" dir="rtl">
                                {skill.name_ar}
                              </p>
                            )}
                            <Badge className={`text-xs ${categoryColors[skill.category]}`}>
                              {skill.category}
                            </Badge>
                          </div>
                        </div>
                        {!skill.visible && (
                          <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                            Hidden
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Proficiency</span>
                          <span className="text-white">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${skill.level}%`,
                              backgroundColor: skill.brand_color || '#3b82f6',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(skill.id, skill.visible)}
                          className="text-slate-400 hover:text-white h-8 w-8"
                        >
                          {skill.visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(skill)}
                          className="text-slate-400 hover:text-white h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(skill.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-slate-400 hover:text-red-400 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Create Skill'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingSkill ? 'Update skill details' : 'Add a new skill'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name (English) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="React"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_ar">Name (Arabic) *</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="ريأكت"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: SkillCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all w-full ${formData.icon === icon
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
              <Label>Proficiency: {formData.level}%</Label>
              <Slider
                value={[formData.level]}
                onValueChange={([value]) => setFormData({ ...formData, level: value })}
                max={100}
                step={5}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_color">Brand Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="brand_color"
                  value={formData.brand_color}
                  onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.brand_color}
                  onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                  className="bg-slate-800 border-slate-600 flex-1"
                  placeholder="#3b82f6"
                />
              </div>
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
            <AlertDialogTitle className="text-white">Delete Skill?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone.
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

export default AdminSkills;
