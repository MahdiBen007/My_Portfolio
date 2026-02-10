import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Star,
  ExternalLink,
  Github,
  Filter,
  Upload,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

type ProjectStatus = 'completed' | 'in_progress' | 'planned';

interface Project {
  id: string;
  title: string;
  title_ar: string | null;
  description: string;
  description_ar: string | null;
  goal: string | null;
  goal_ar: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  gallery_images: string[];
  tech_stack: string[];
  github_link: string | null;
  live_demo_link: string | null;
  category: string | null;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
  visible: boolean;
}

const statusColors: Record<ProjectStatus, string> = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const categories = ['E-commerce', 'Dashboard', 'Landing Page', 'API', 'UI/UX', 'Mobile App', 'Games', 'Portfolio', 'Other'];

const SortableProjectCard = ({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-70' : ''}>
      <div className="relative">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute bottom-2 left-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur cursor-grab active:cursor-grabbing"
          aria-label="Reorder project"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    goal: '',
    goal_ar: '',
    thumbnail_url: '',
    video_url: '',
    gallery_images: [''],
    tech_stack: '',
    github_link: '',
    live_demo_link: '',
    category: 'Other',
    status: 'completed' as ProjectStatus,
    featured: false,
    visible: true,
  });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousOrder = new Map(projects.map((p) => [p.id, p.sort_order ?? 0]));
    const reordered = arrayMove(projects, oldIndex, newIndex).map((project, index) => ({
      ...project,
      sort_order: index,
    }));

    setProjects(reordered);

    try {
      const updates = reordered.filter(
        (project) => (previousOrder.get(project.id) ?? 0) !== project.sort_order
      );
      await Promise.all(
        updates.map((project) =>
          supabase.from('projects').update({ sort_order: project.sort_order }).eq('id', project.id)
        )
      );
      window.dispatchEvent(new Event('portfolio-data-updated'));
    } catch (error) {
      console.error('Error updating project order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project order',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      goal: '',
      goal_ar: '',
      thumbnail_url: '',
      video_url: '',
      gallery_images: [''],
      tech_stack: '',
      github_link: '',
      live_demo_link: '',
      category: 'Other',
      status: 'completed',
      featured: false,
      visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      title_ar: project.title_ar || '',
      description: project.description,
      description_ar: project.description_ar || '',
      goal: project.goal || '',
      goal_ar: project.goal_ar || '',
      thumbnail_url: project.thumbnail_url || '',
      video_url: project.video_url || '',
      gallery_images: project.gallery_images?.length ? project.gallery_images : [''],
      tech_stack: project.tech_stack?.join(', ') || '',
      github_link: project.github_link || '',
      live_demo_link: project.live_demo_link || '',
      category: project.category || 'Other',
      status: project.status,
      featured: project.featured,
      visible: project.visible,
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
      const techArray = formData.tech_stack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
      const galleryImages = formData.gallery_images
        .map((url) => url.trim())
        .filter((url) => url);

      const projectData = {
        title: formData.title,
        title_ar: formData.title_ar || null,
        description: formData.description,
        description_ar: formData.description_ar || null,
        goal: formData.goal || null,
        goal_ar: formData.goal_ar || null,
        thumbnail_url: formData.thumbnail_url || null,
        video_url: formData.video_url || null,
        gallery_images: galleryImages,
        tech_stack: techArray,
        github_link: formData.github_link || null,
        live_demo_link: formData.live_demo_link || null,
        category: formData.category,
        status: formData.status,
        featured: formData.featured,
        visible: formData.visible,
      };

      const { goal, goal_ar, ...fallbackProjectData } = projectData;
      let usedFallback = false;

      if (editingProject) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);

        if (error) {
          const message = typeof error?.message === 'string' ? error.message : '';
          const code = (error as { code?: string }).code;
          const schemaMissing =
            message.includes('schema cache') ||
            message.includes('column') ||
            code === 'PGRST204' ||
            code === '42703';

          if (schemaMissing) {
            const { error: fallbackError } = await supabase
              .from('projects')
              .update(fallbackProjectData)
              .eq('id', editingProject.id);
            if (fallbackError) throw fallbackError;
            usedFallback = true;
          } else {
            throw error;
          }
        }

        toast(
          usedFallback
            ? { title: 'Saved with warning', description: 'Project updated, but goal fields need a database migration.' }
            : { title: 'Success', description: 'Project updated successfully' }
        );
      } else {
        const { error } = await supabase.from('projects').insert({
          ...projectData,
          sort_order: projects.length,
        });

        if (error) {
          const message = typeof error?.message === 'string' ? error.message : '';
          const code = (error as { code?: string }).code;
          const schemaMissing =
            message.includes('schema cache') ||
            message.includes('column') ||
            code === 'PGRST204' ||
            code === '42703';

          if (schemaMissing) {
            const { error: fallbackError } = await supabase.from('projects').insert({
              ...fallbackProjectData,
              sort_order: projects.length,
            });
            if (fallbackError) throw fallbackError;
            usedFallback = true;
          } else {
            throw error;
          }
        }

        toast(
          usedFallback
            ? { title: 'Saved with warning', description: 'Project created, but goal fields need a database migration.' }
            : { title: 'Success', description: 'Project created successfully' }
        );
      }

      setIsDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadProjectImage = async (file: File) => {
    const extension = file.name.split('.').pop() || 'bin';
    const safeName = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error } = await supabase.storage.from('uploads').upload(safeName, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('uploads').getPublicUrl(safeName);
    return data.publicUrl;
  };

  const handleThumbnailUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const url = await uploadProjectImage(file);
      setFormData((prev) => ({ ...prev, thumbnail_url: url }));
      toast({ title: 'Success', description: 'Thumbnail uploaded' });
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload thumbnail',
        variant: 'destructive',
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleGalleryUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingGalleryIndex(index);
    try {
      const url = await uploadProjectImage(file);
      handleGalleryChange(index, url);
      toast({ title: 'Success', description: 'Gallery image uploaded' });
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload gallery image',
        variant: 'destructive',
      });
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadProjectImage(file);
      setFormData((prev) => ({ ...prev, video_url: url }));
      toast({ title: 'Success', description: 'Video uploaded' });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleGalleryChange = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.gallery_images];
      next[index] = value;
      return { ...prev, gallery_images: next };
    });
  };

  const addGalleryField = () => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, ''],
    }));
  };

  const removeGalleryField = (index: number) => {
    setFormData((prev) => {
      const next = prev.gallery_images.filter((_, i) => i !== index);
      return { ...prev, gallery_images: next.length ? next : [''] };
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted successfully' });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div>
      <AdminHeader title="Projects" subtitle="Manage your projects" />

      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-slate-400">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 mb-4">No projects found</p>
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add your first project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredProjects.map((project) => project.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <SortableProjectCard key={project.id} project={project}>
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all group overflow-hidden">
                      <div className="relative aspect-[1360/606] bg-slate-800">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            No Image
                          </div>
                        )}
                        {project.featured && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500/90 text-yellow-900">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        {!project.visible && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-slate-800/80 text-slate-400">
                              Hidden
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-white">{project.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`text-xs ${statusColors[project.status]}`}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          {project.category && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {project.category}
                            </Badge>
                          )}
                        </div>

                        {project.tech_stack?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.tech_stack.slice(0, 3).map((tech) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs bg-slate-800 text-slate-300"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.tech_stack.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-400">
                                +{project.tech_stack.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                          <div className="flex gap-2">
                            {project.github_link && (
                              <a
                                href={project.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {project.live_demo_link && (
                              <a
                                href={project.live_demo_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(project.id, project.featured)}
                              className={`h-8 w-8 ${
                                project.featured ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                              }`}
                            >
                              <Star className="w-4 h-4" fill={project.featured ? 'currentColor' : 'none'} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleVisibility(project.id, project.visible)}
                              className="text-slate-400 hover:text-white h-8 w-8"
                            >
                              {project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(project)}
                              className="text-slate-400 hover:text-white h-8 w-8"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingId(project.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-slate-400 hover:text-red-400 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SortableProjectCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingProject ? 'Update project details' : 'Add a new project to your portfolio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (English) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="E-Commerce Platform"
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
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabic)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[100px]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal (English)</Label>
                <Textarea
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[90px]"
                  placeholder="What was the main objective of this project?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal_ar">Goal (Arabic)</Label>
                <Textarea
                  id="goal_ar"
                  value={formData.goal_ar}
                  onChange={(e) => setFormData({ ...formData, goal_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600 min-h-[90px]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="https://example.com/image.jpg"
                />
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleThumbnailUpload(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  {uploadingThumbnail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL (Details)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="https://example.com/demo.mp4 or YouTube link"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoUpload(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="space-y-2">
                {formData.gallery_images.map((url, index) => (
                  <div key={`gallery-${index}`} className="flex items-center gap-2">
                    <Input
                      value={url}
                      onChange={(e) => handleGalleryChange(index, e.target.value)}
                      className="bg-slate-800 border-slate-600"
                      placeholder="https://example.com/image.jpg"
                    />
                    <input
                      id={`gallery-file-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGalleryUpload(index, e.target.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const input = document.getElementById(`gallery-file-${index}`) as HTMLInputElement | null;
                        input?.click();
                      }}
                      disabled={uploadingGalleryIndex === index}
                      className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      title="Upload image"
                    >
                      {uploadingGalleryIndex === index ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addGalleryField}
                      className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {formData.gallery_images.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGalleryField(index)}
                        className="text-slate-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
              <Input
                id="tech_stack"
                value={formData.tech_stack}
                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="React, TypeScript, Tailwind CSS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="github_link">GitHub Link</Label>
                <Input
                  id="github_link"
                  value={formData.github_link}
                  onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="live_demo_link">Live Demo Link</Label>
                <Input
                  id="live_demo_link"
                  value={formData.live_demo_link}
                  onChange={(e) => setFormData({ ...formData, live_demo_link: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  Featured Project
                </Label>
              </div>
              <Label htmlFor="visible" className="flex items-center gap-2 cursor-pointer">
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                />
                Visible
              </Label>
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
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The project and all its sections will be permanently deleted.
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

export default AdminProjects;
