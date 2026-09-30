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
  Monitor,
  FolderKanban,
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
  package_type: string | null;
}

interface DashboardScreenshot {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  image_url: string;
  video_url: string | null;
  demo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<ProjectStatus, string> = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const categories = ['E-commerce', 'Dashboard', 'Landing Page', 'API', 'UI/UX', 'Mobile App', 'Games', 'Portfolio', 'Other'];
const MAX_IMAGE_UPLOAD_SIZE = 4 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_SIZE = 25 * 1024 * 1024;

const SortableProjectCard = ({ project, children }: { project: Project; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-70' : ''}>
      <div className="relative">
        <button type="button" {...attributes} {...listeners}
          className="absolute bottom-2 left-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur cursor-grab active:cursor-grabbing"
          aria-label="Reorder project">
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

const SortableScreenshotCard = ({ screenshot, children }: { screenshot: DashboardScreenshot; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: screenshot.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-70 z-50' : ''}>
      <div className="relative">
        <button type="button" {...attributes} {...listeners}
          className="absolute bottom-2 left-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur cursor-grab active:cursor-grabbing"
          aria-label="Reorder screenshot">
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'screenshots'>('projects');

  // ── Projects State ──
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [featuredCategory, setFeaturedCategory] = useState<string>('all');
  const [savingFeatured, setSavingFeatured] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [projectForm, setProjectForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    goal: '', goal_ar: '', thumbnail_url: '', video_url: '',
    gallery_images: [''], tech_stack: '', github_link: '', live_demo_link: '',
    category: 'Other', status: 'completed' as ProjectStatus,
    featured: false, visible: true, package_type: 'other',
  });

  // ── Screenshots State ──
  const [screenshots, setScreenshots] = useState<DashboardScreenshot[]>([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(true);
  const [isScreenshotDialogOpen, setIsScreenshotDialogOpen] = useState(false);
  const [isDeleteScreenshotDialogOpen, setIsDeleteScreenshotDialogOpen] = useState(false);
  const [editingScreenshot, setEditingScreenshot] = useState<DashboardScreenshot | null>(null);
  const [deletingScreenshotId, setDeletingScreenshotId] = useState<string | null>(null);
  const [savingScreenshot, setSavingScreenshot] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement | null>(null);

  const [screenshotForm, setScreenshotForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    image_url: '', video_url: '', demo_url: '', is_active: true,
  });

  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // ── Projects Logic ──
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Failed to fetch projects', variant: 'destructive' });
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchFeaturedCategory = async () => {
    try {
      const { data } = await supabase.from('settings').select('featured_category').limit(1).single();
      if (data?.featured_category) setFeaturedCategory(data.featured_category);
    } catch { /* ignore */ }
  };

  const saveFeaturedCategory = async (value: string) => {
    setSavingFeatured(true);
    try {
      const { data: existing } = await supabase.from('settings').select('id').limit(1).single();
      if (existing) {
        await supabase.from('settings').update({ featured_category: value }).eq('id', existing.id);
      }
      setFeaturedCategory(value);
      toast({ title: 'Updated', description: 'Default category saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setSavingFeatured(false);
    }
  };

  useEffect(() => { fetchProjects(); fetchFeaturedCategory(); }, []);

  const filteredProjects = projects.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleProjectDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const previousOrder = new Map(projects.map((p) => [p.id, p.sort_order ?? 0]));
    const reordered = arrayMove(projects, oldIndex, newIndex).map((project, index) => ({ ...project, sort_order: index }));
    setProjects(reordered);
    try {
      const updates = reordered.filter((p) => (previousOrder.get(p.id) ?? 0) !== p.sort_order);
      await Promise.all(updates.map((p) => supabase.from('projects').update({ sort_order: p.sort_order }).eq('id', p.id)));
      window.dispatchEvent(new Event('portfolio-data-updated'));
    } catch (error) {
      console.error('Error updating project order:', error);
      toast({ title: 'Error', description: 'Failed to update project order', variant: 'destructive' });
    }
  };

  const validateUpload = (file: File, kind: 'image' | 'video') => {
    const isExpectedType = kind === 'image' ? file.type.startsWith('image/') : file.type.startsWith('video/');
    if (!isExpectedType) {
      toast({ title: 'Invalid file type', description: kind === 'image' ? 'Please upload an image file.' : 'Please upload a video file.', variant: 'destructive' });
      return false;
    }
    const maxSize = kind === 'image' ? MAX_IMAGE_UPLOAD_SIZE : MAX_VIDEO_UPLOAD_SIZE;
    if (file.size > maxSize) {
      const maxLabel = `${Math.round(maxSize / (1024 * 1024))}MB`;
      toast({ title: 'File too large', description: kind === 'image' ? `Image size must be ${maxLabel} or less.` : `Video size must be ${maxLabel} or less.`, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const uploadToStorage = async (file: File, path: string) => {
    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const safeName = `${path}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from('uploads').upload(safeName, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = supabase.storage.from('uploads').getPublicUrl(safeName);
    return data.publicUrl;
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm({ title: '', title_ar: '', description: '', description_ar: '', goal: '', goal_ar: '', thumbnail_url: '', video_url: '', gallery_images: [''], tech_stack: '', github_link: '', live_demo_link: '', category: 'Other', status: 'completed', featured: false, visible: true, package_type: 'other' });
    setIsProjectDialogOpen(true);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title, title_ar: project.title_ar || '', description: project.description, description_ar: project.description_ar || '',
      goal: project.goal || '', goal_ar: project.goal_ar || '', thumbnail_url: project.thumbnail_url || '', video_url: project.video_url || '',
      gallery_images: project.gallery_images?.length ? project.gallery_images : [''], tech_stack: project.tech_stack?.join(', ') || '',
      github_link: project.github_link || '', live_demo_link: project.live_demo_link || '', category: project.category || 'Other',
      status: project.status, featured: project.featured, visible: project.visible, package_type: project.package_type || 'other',
    });
    setIsProjectDialogOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      toast({ title: 'Validation Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }
    setSavingProject(true);
    try {
      const techArray = projectForm.tech_stack.split(',').map((t) => t.trim()).filter((t) => t);
      const galleryImages = projectForm.gallery_images.map((url) => url.trim()).filter((url) => url);
      const payload = {
        title: projectForm.title, title_ar: projectForm.title_ar || null, description: projectForm.description,
        description_ar: projectForm.description_ar || null, goal: projectForm.goal || null, goal_ar: projectForm.goal_ar || null,
        thumbnail_url: projectForm.thumbnail_url || null, video_url: projectForm.video_url || null,
        gallery_images: galleryImages, tech_stack: techArray, github_link: projectForm.github_link || null,
        live_demo_link: projectForm.live_demo_link || null, category: projectForm.category, status: projectForm.status,
        featured: projectForm.featured, visible: projectForm.visible, package_type: projectForm.package_type,
      };
      const { goal, goal_ar, ...fallbackPayload } = payload;
      let usedFallback = false;

      if (editingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
        if (error) {
          const message = typeof error?.message === 'string' ? error.message : '';
          const code = (error as { code?: string }).code;
          if (message.includes('schema cache') || message.includes('column') || code === 'PGRST204' || code === '42703') {
            const { error: fb } = await supabase.from('projects').update(fallbackPayload).eq('id', editingProject.id);
            if (fb) throw fb;
            usedFallback = true;
          } else throw error;
        }
        toast(usedFallback ? { title: 'Saved with warning', description: 'Project updated, but goal fields need a migration.' } : { title: 'Success', description: 'Project updated successfully' });
      } else {
        const { error } = await supabase.from('projects').insert({ ...payload, sort_order: projects.length });
        if (error) {
          const message = typeof error?.message === 'string' ? error.message : '';
          const code = (error as { code?: string }).code;
          if (message.includes('schema cache') || message.includes('column') || code === 'PGRST204' || code === '42703') {
            const { error: fb } = await supabase.from('projects').insert({ ...fallbackPayload, sort_order: projects.length });
            if (fb) throw fb;
            usedFallback = true;
          } else throw error;
        }
        toast(usedFallback ? { title: 'Saved with warning', description: 'Project created, but goal fields need a migration.' } : { title: 'Success', description: 'Project created successfully' });
      }
      setIsProjectDialogOpen(false);
      fetchProjects();
      window.dispatchEvent(new Event('portfolio-data-updated'));
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Error', description: 'Failed to save project', variant: 'destructive' });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProjectId) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', deletingProjectId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted successfully' });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } finally {
      setIsDeleteProjectDialogOpen(false);
      setDeletingProjectId(null);
    }
  };

  const toggleProjectFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase.from('projects').update({ featured: !featured }).eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error) { console.error('Error toggling featured:', error); }
  };

  const toggleProjectVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase.from('projects').update({ visible: !visible }).eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error) { console.error('Error toggling visibility:', error); }
  };

  // ── Screenshots Logic ──
  const fetchScreenshots = async () => {
    try {
      const { data, error } = await supabase.from('dashboard_screenshots').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setScreenshots(data || []);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      toast({ title: 'Error', description: 'Failed to fetch screenshots', variant: 'destructive' });
    } finally {
      setScreenshotsLoading(false);
    }
  };

  useEffect(() => { fetchScreenshots(); }, []);

  const handleScreenshotDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = screenshots.findIndex((s) => s.id === active.id);
    const newIndex = screenshots.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const previousOrder = new Map(screenshots.map((s) => [s.id, s.sort_order ?? 0]));
    const reordered = arrayMove(screenshots, oldIndex, newIndex).map((item, index) => ({ ...item, sort_order: index }));
    setScreenshots(reordered);
    try {
      const updates = reordered.filter((s) => (previousOrder.get(s.id) ?? 0) !== s.sort_order);
      await Promise.all(updates.map((s) => supabase.from('dashboard_screenshots').update({ sort_order: s.sort_order }).eq('id', s.id)));
    } catch (error) {
      console.error('Error updating screenshot order:', error);
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    }
  };

  const openCreateScreenshot = () => {
    setEditingScreenshot(null);
    setScreenshotForm({ title: '', title_ar: '', description: '', description_ar: '', image_url: '', video_url: '', demo_url: '', is_active: true });
    setIsScreenshotDialogOpen(true);
  };

  const openEditScreenshot = (item: DashboardScreenshot) => {
    setEditingScreenshot(item);
    setScreenshotForm({ title: item.title, title_ar: item.title_ar || '', description: item.description || '', description_ar: item.description_ar || '', image_url: item.image_url, video_url: item.video_url || '', demo_url: item.demo_url || '', is_active: item.is_active });
    setIsScreenshotDialogOpen(true);
  };

  const handleSaveScreenshot = async () => {
    if (!screenshotForm.title || !screenshotForm.image_url) {
      toast({ title: 'Validation Error', description: 'Title and image are required', variant: 'destructive' });
      return;
    }
    setSavingScreenshot(true);
    try {
      const payload = {
        title: screenshotForm.title, title_ar: screenshotForm.title_ar || null,
        description: screenshotForm.description || null, description_ar: screenshotForm.description_ar || null,
        image_url: screenshotForm.image_url, video_url: screenshotForm.video_url || null,
        demo_url: screenshotForm.demo_url || null, is_active: screenshotForm.is_active,
      };
      if (editingScreenshot) {
        const { error } = await supabase.from('dashboard_screenshots').update(payload).eq('id', editingScreenshot.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Screenshot updated successfully' });
      } else {
        const { error } = await supabase.from('dashboard_screenshots').insert({ ...payload, sort_order: screenshots.length });
        if (error) throw error;
        toast({ title: 'Success', description: 'Screenshot created successfully' });
      }
      setIsScreenshotDialogOpen(false);
      fetchScreenshots();
    } catch (error) {
      console.error('Error saving screenshot:', error);
      toast({ title: 'Error', description: 'Failed to save screenshot', variant: 'destructive' });
    } finally {
      setSavingScreenshot(false);
    }
  };

  const handleScreenshotFileUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      toast({ title: 'File too large', description: 'Image size must be 4MB or less.', variant: 'destructive' });
      return;
    }
    setUploadingScreenshot(true);
    try {
      const url = await uploadToStorage(file, 'dashboard');
      setScreenshotForm((prev) => ({ ...prev, image_url: url }));
      toast({ title: 'Success', description: 'Image uploaded' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!deletingScreenshotId) return;
    try {
      const { error } = await supabase.from('dashboard_screenshots').delete().eq('id', deletingScreenshotId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Screenshot deleted successfully' });
      fetchScreenshots();
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast({ title: 'Error', description: 'Failed to delete screenshot', variant: 'destructive' });
    } finally {
      setIsDeleteScreenshotDialogOpen(false);
      setDeletingScreenshotId(null);
    }
  };

  const toggleScreenshotActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('dashboard_screenshots').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      fetchScreenshots();
    } catch (error) { console.error('Error toggling active:', error); }
  };

  return (
    <div>
      <AdminHeader title="Projects" subtitle="Manage your projects and dashboard screenshots" />

      <div className="p-3 sm:p-4 md:p-6">
        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1 mb-6 bg-slate-800/50 rounded-xl p-1 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'projects' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Projects
            <span className="text-xs opacity-70">({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'screenshots' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Screenshots
            <span className="text-xs opacity-70">({screenshots.length})</span>
          </button>
        </div>

        {/* ═══ Projects Tab ═══ */}
        {activeTab === 'projects' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-300">Default category shown:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={featuredCategory} onValueChange={saveFeaturedCategory} disabled={savingFeatured}>
                  <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-600 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
                {savingFeatured && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-xs sm:text-sm text-slate-400">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-32 bg-slate-800 border-slate-600 text-xs sm:text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32 bg-slate-800 border-slate-600 text-xs sm:text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={openCreateProject} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />Add Project
              </Button>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : filteredProjects.length === 0 ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400 mb-4">No projects found</p>
                  <Button onClick={openCreateProject} variant="outline"><Plus className="w-4 h-4 mr-2" />Add your first project</Button>
                </CardContent>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext items={filteredProjects.map((p) => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <SortableProjectCard key={project.id} project={project}>
                        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all group overflow-hidden">
                          <div className="relative aspect-[1360/606] bg-slate-800">
                            {project.thumbnail_url ? (
                              <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                            )}
                            {project.featured && <div className="absolute top-2 left-2"><Badge className="bg-yellow-500/90 text-yellow-900"><Star className="w-3 h-3 mr-1" />Featured</Badge></div>}
                            {!project.visible && <div className="absolute top-2 right-2"><Badge variant="secondary" className="bg-slate-800/80 text-slate-400">Hidden</Badge></div>}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-white">{project.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={`text-xs ${statusColors[project.status]}`}>{project.status.replace('_', ' ')}</Badge>
                              {project.category && <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{project.category}</Badge>}
                            </div>
                            {project.tech_stack?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {project.tech_stack.slice(0, 3).map((tech) => <Badge key={tech} variant="secondary" className="text-xs bg-slate-800 text-slate-300">{tech}</Badge>)}
                                {project.tech_stack.length > 3 && <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-400">+{project.tech_stack.length - 3}</Badge>}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                              <div className="flex gap-2">
                                {project.github_link && <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                                {project.live_demo_link && <a href={project.live_demo_link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => toggleProjectFeatured(project.id, project.featured)} className={`h-8 w-8 ${project.featured ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}>
                                  <Star className="w-4 h-4" fill={project.featured ? 'currentColor' : 'none'} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleProjectVisibility(project.id, project.visible)} className="text-slate-400 hover:text-white h-8 w-8">
                                  {project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditProject(project)} className="text-slate-400 hover:text-white h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setDeletingProjectId(project.id); setIsDeleteProjectDialogOpen(true); }} className="text-slate-400 hover:text-red-400 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
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
          </>
        )}

        {/* ═══ Screenshots Tab ═══ */}
        {activeTab === 'screenshots' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-6">
              <p className="text-xs sm:text-sm text-slate-400">{screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}</p>
              <Button onClick={openCreateScreenshot} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />Add Screenshot
              </Button>
            </div>

            {screenshotsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : screenshots.length === 0 ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                <CardContent className="py-12 text-center">
                  <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No screenshots yet</p>
                  <Button onClick={openCreateScreenshot} variant="outline"><Plus className="w-4 h-4 mr-2" />Add your first screenshot</Button>
                </CardContent>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleScreenshotDragEnd}>
                <SortableContext items={screenshots.map((s) => s.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {screenshots.map((screenshot) => (
                      <SortableScreenshotCard key={screenshot.id} screenshot={screenshot}>
                        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all group overflow-hidden">
                          <div className="relative aspect-[16/10] bg-slate-800">
                            <img src={screenshot.image_url} alt={screenshot.title} className="w-full h-full object-cover" loading="lazy" />
                            {!screenshot.is_active && (
                              <div className="absolute top-2 right-2"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-800/80 text-slate-400 border border-slate-600/50">Hidden</span></div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="mb-3">
                              <h3 className="font-medium text-white">{screenshot.title}</h3>
                              {screenshot.description && <p className="text-sm text-slate-400 line-clamp-2 mt-1">{screenshot.description}</p>}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                              <Button variant="ghost" size="icon" onClick={() => toggleScreenshotActive(screenshot.id, screenshot.is_active)}
                                className={`h-8 w-8 ${screenshot.is_active ? 'text-green-400' : 'text-slate-400 hover:text-green-400'}`}
                                title={screenshot.is_active ? 'Active' : 'Inactive'}>
                                {screenshot.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditScreenshot(screenshot)} className="text-slate-400 hover:text-white h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setDeletingScreenshotId(screenshot.id); setIsDeleteScreenshotDialogOpen(true); }} className="text-slate-400 hover:text-red-400 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SortableScreenshotCard>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </>
        )}
      </div>

      {/* ═══ Project Dialog ═══ */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingProject ? 'Update project details' : 'Add a new project to your portfolio'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-title">Title (English) *</Label>
                <Input id="p-title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="E-Commerce Platform" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-title_ar">Title (Arabic)</Label>
                <Input id="p-title_ar" value={projectForm.title_ar} onChange={(e) => setProjectForm({ ...projectForm, title_ar: e.target.value })} className="bg-slate-800 border-slate-600" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-desc">Description (English) *</Label>
                <Textarea id="p-desc" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px] sm:min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc_ar">Description (Arabic)</Label>
                <Textarea id="p-desc_ar" value={projectForm.description_ar} onChange={(e) => setProjectForm({ ...projectForm, description_ar: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px] sm:min-h-[100px]" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-goal">Goal (English)</Label>
                <Textarea id="p-goal" value={projectForm.goal} onChange={(e) => setProjectForm({ ...projectForm, goal: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[70px] sm:min-h-[90px]" placeholder="What was the main objective?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-goal_ar">Goal (Arabic)</Label>
                <Textarea id="p-goal_ar" value={projectForm.goal_ar} onChange={(e) => setProjectForm({ ...projectForm, goal_ar: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[70px] sm:min-h-[90px]" dir="rtl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input value={projectForm.thumbnail_url} onChange={(e) => setProjectForm({ ...projectForm, thumbnail_url: e.target.value })} className="bg-slate-800 border-slate-600 flex-1" placeholder="https://example.com/image.jpg" />
                <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  if (!validateUpload(file, 'image')) return;
                  setUploadingThumbnail(true);
                  uploadToStorage(file, 'projects').then((url) => { setProjectForm((prev) => ({ ...prev, thumbnail_url: url })); toast({ title: 'Success', description: 'Thumbnail uploaded' }); }).catch(() => toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' })).finally(() => setUploadingThumbnail(false));
                }} />
                <Button type="button" variant="outline" onClick={() => thumbnailInputRef.current?.click()} disabled={uploadingThumbnail} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0">
                  {uploadingThumbnail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingThumbnail ? 'Uploading' : 'Upload'}
                </Button>
              </div>
              <p className="text-xs text-slate-400">Recommended: WebP, 1360x607, max 4MB.</p>
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input value={projectForm.video_url} onChange={(e) => setProjectForm({ ...projectForm, video_url: e.target.value })} className="bg-slate-800 border-slate-600 flex-1" placeholder="https://example.com/demo.mp4" />
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  if (!validateUpload(file, 'video')) return;
                  setUploadingVideo(true);
                  uploadToStorage(file, 'projects').then((url) => { setProjectForm((prev) => ({ ...prev, video_url: url })); toast({ title: 'Success', description: 'Video uploaded' }); }).catch(() => toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' })).finally(() => setUploadingVideo(false));
                }} />
                <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0">
                  {uploadingVideo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingVideo ? 'Uploading' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="space-y-2">
                {projectForm.gallery_images.map((url, index) => (
                  <div key={`gallery-${index}`} className="flex items-center gap-2">
                    <Input value={url} onChange={(e) => { const next = [...projectForm.gallery_images]; next[index] = e.target.value; setProjectForm({ ...projectForm, gallery_images: next }); }} className="bg-slate-800 border-slate-600 min-w-0 flex-1" placeholder="https://example.com/image.jpg" />
                    <input id={`gallery-file-${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      if (!validateUpload(file, 'image')) return;
                      setUploadingGalleryIndex(index);
                      uploadToStorage(file, 'projects').then((url) => { const next = [...projectForm.gallery_images]; next[index] = url; setProjectForm({ ...projectForm, gallery_images: next }); toast({ title: 'Success', description: 'Gallery image uploaded' }); }).catch(() => toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' })).finally(() => setUploadingGalleryIndex(null));
                    }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => { const input = document.getElementById(`gallery-file-${index}`) as HTMLInputElement | null; input?.click(); }} disabled={uploadingGalleryIndex === index} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0" title="Upload image">
                      {uploadingGalleryIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setProjectForm({ ...projectForm, gallery_images: [...projectForm.gallery_images, ''] })} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0"><Plus className="h-4 w-4" /></Button>
                    {projectForm.gallery_images.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => { const next = projectForm.gallery_images.filter((_, i) => i !== index); setProjectForm({ ...projectForm, gallery_images: next.length ? next : [''] }); }} className="text-slate-400 hover:text-red-300 shrink-0"><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tech Stack (comma separated)</Label>
              <Input value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="React, TypeScript, Tailwind CSS" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2"><Label>GitHub Link</Label><Input value={projectForm.github_link} onChange={(e) => setProjectForm({ ...projectForm, github_link: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://github.com/..." /></div>
              <div className="space-y-2"><Label>Live Demo Link</Label><Input value={projectForm.live_demo_link} onChange={(e) => setProjectForm({ ...projectForm, live_demo_link: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://example.com" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={projectForm.category} onValueChange={(value) => setProjectForm({ ...projectForm, category: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Package</Label>
                <Select value={projectForm.package_type} onValueChange={(value) => setProjectForm({ ...projectForm, package_type: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={projectForm.status} onValueChange={(value: ProjectStatus) => setProjectForm({ ...projectForm, status: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm"><Switch checked={projectForm.featured} onCheckedChange={(checked) => setProjectForm({ ...projectForm, featured: checked })} />Featured Project</Label>
              <Label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm"><Switch checked={projectForm.visible} onCheckedChange={(checked) => setProjectForm({ ...projectForm, visible: checked })} />Visible</Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveProject} disabled={savingProject} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600">
              {savingProject ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">This action cannot be undone. The project and all its sections will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ Screenshot Dialog ═══ */}
      <Dialog open={isScreenshotDialogOpen} onOpenChange={setIsScreenshotDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScreenshot ? 'Edit Screenshot' : 'Add Screenshot'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingScreenshot ? 'Update screenshot details' : 'Add a new dashboard screenshot to the gallery'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">Title (English) *</Label>
                <Input id="s-title" value={screenshotForm.title} onChange={(e) => setScreenshotForm({ ...screenshotForm, title: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="Dashboard Overview" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-title_ar">Title (Arabic)</Label>
                <Input id="s-title_ar" value={screenshotForm.title_ar} onChange={(e) => setScreenshotForm({ ...screenshotForm, title_ar: e.target.value })} className="bg-slate-800 border-slate-600" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-desc">Description (English)</Label>
                <Textarea id="s-desc" value={screenshotForm.description} onChange={(e) => setScreenshotForm({ ...screenshotForm, description: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px]" placeholder="Brief description of this dashboard view" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-desc_ar">Description (Arabic)</Label>
                <Textarea id="s-desc_ar" value={screenshotForm.description_ar} onChange={(e) => setScreenshotForm({ ...screenshotForm, description_ar: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px]" dir="rtl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Screenshot Image *</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input value={screenshotForm.image_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, image_url: e.target.value })} className="bg-slate-800 border-slate-600 flex-1" placeholder="https://example.com/screenshot.png" />
                <input ref={screenshotInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotFileUpload(e.target.files?.[0] ?? null)} />
                <Button type="button" variant="outline" onClick={() => screenshotInputRef.current?.click()} disabled={uploadingScreenshot} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0">
                  {uploadingScreenshot ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingScreenshot ? 'Uploading' : 'Upload'}
                </Button>
              </div>
              <p className="text-xs text-slate-400">Recommended: 1360x850px, WebP or PNG, max 4MB.</p>
              {screenshotForm.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50">
                  <img src={screenshotForm.image_url} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-video_url">Video URL (optional)</Label>
                <Input id="s-video_url" value={screenshotForm.video_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, video_url: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://youtube.com/watch?v=..." />
                <p className="text-xs text-slate-400">YouTube, Vimeo, or direct video link</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-demo_url">Demo URL (optional)</Label>
                <Input id="s-demo_url" value={screenshotForm.demo_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, demo_url: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://your-store.com" />
                <p className="text-xs text-slate-400">Link to try the live dashboard</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Label className="flex items-center gap-2 cursor-pointer"><Switch checked={projectForm.featured} onCheckedChange={(checked) => setProjectForm({ ...projectForm, featured: checked })} />Featured Project</Label>
              <Label className="flex items-center gap-2 cursor-pointer"><Switch checked={projectForm.visible} onCheckedChange={(checked) => setProjectForm({ ...projectForm, visible: checked })} />Visible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject} disabled={savingProject} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {savingProject ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">This action cannot be undone. The project and all its sections will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ Screenshot Dialog ═══ */}
      <Dialog open={isScreenshotDialogOpen} onOpenChange={setIsScreenshotDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScreenshot ? 'Edit Screenshot' : 'Add Screenshot'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingScreenshot ? 'Update screenshot details' : 'Add a new dashboard screenshot to the gallery'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">Title (English) *</Label>
                <Input id="s-title" value={screenshotForm.title} onChange={(e) => setScreenshotForm({ ...screenshotForm, title: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="Dashboard Overview" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-title_ar">Title (Arabic)</Label>
                <Input id="s-title_ar" value={screenshotForm.title_ar} onChange={(e) => setScreenshotForm({ ...screenshotForm, title_ar: e.target.value })} className="bg-slate-800 border-slate-600" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-desc">Description (English)</Label>
                <Textarea id="s-desc" value={screenshotForm.description} onChange={(e) => setScreenshotForm({ ...screenshotForm, description: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px]" placeholder="Brief description of this dashboard view" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-desc_ar">Description (Arabic)</Label>
                <Textarea id="s-desc_ar" value={screenshotForm.description_ar} onChange={(e) => setScreenshotForm({ ...screenshotForm, description_ar: e.target.value })} className="bg-slate-800 border-slate-600 min-h-[80px]" dir="rtl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Screenshot Image *</Label>
              <div className="flex items-center gap-2">
                <Input value={screenshotForm.image_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, image_url: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://example.com/screenshot.png" />
                <input ref={screenshotInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotFileUpload(e.target.files?.[0] ?? null)} />
                <Button type="button" variant="outline" onClick={() => screenshotInputRef.current?.click()} disabled={uploadingScreenshot} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0">
                  {uploadingScreenshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-400">Recommended: 1360x850px, WebP or PNG, max 4MB.</p>
              {screenshotForm.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50">
                  <img src={screenshotForm.image_url} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-video_url">Video URL (optional)</Label>
                <Input id="s-video_url" value={screenshotForm.video_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, video_url: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://youtube.com/watch?v=..." />
                <p className="text-xs text-slate-400">YouTube, Vimeo, or direct video link</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-demo_url">Demo URL (optional)</Label>
                <Input id="s-demo_url" value={screenshotForm.demo_url} onChange={(e) => setScreenshotForm({ ...screenshotForm, demo_url: e.target.value })} className="bg-slate-800 border-slate-600" placeholder="https://your-store.com" />
                <p className="text-xs text-slate-400">Link to try the live dashboard</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={screenshotForm.is_active} onCheckedChange={(checked) => setScreenshotForm({ ...screenshotForm, is_active: checked })} />
                Active (visible on frontend)
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsScreenshotDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveScreenshot} disabled={savingScreenshot} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600">
              {savingScreenshot ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Screenshot Confirmation */}
      <AlertDialog open={isDeleteScreenshotDialogOpen} onOpenChange={setIsDeleteScreenshotDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Screenshot?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">This action cannot be undone. The screenshot will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteScreenshot} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjects;
