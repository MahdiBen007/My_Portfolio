import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Clock, User, Upload, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface About {
  id: string;
  bio: string | null;
  bio_ar: string | null;
  profile_image_url: string | null;
  resume_url: string | null;
}

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  icon: string | null;
  sort_order: number;
  visible: boolean;
}

const iconOptions = ['Briefcase', 'GraduationCap', 'Award', 'Star', 'Code', 'Building'];

const AdminAbout = () => {
  const [about, setAbout] = useState<About | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAbout, setSavingAbout] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingTimeline, setSavingTimeline] = useState(false);
  const { toast } = useToast();

  const [aboutForm, setAboutForm] = useState({
    bio: '',
    bio_ar: '',
    profile_image_url: '',
    resume_url: '',
  });

  const [timelineForm, setTimelineForm] = useState({
    year: '',
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    icon: 'Briefcase',
    visible: true,
  });

  const fetchData = async () => {
    try {
      const [aboutRes, timelineRes] = await Promise.all([
        supabase.from('about').select('*').limit(1).single(),
        supabase.from('timeline').select('*').order('sort_order', { ascending: true }),
      ]);

      if (aboutRes.data) {
        setAbout(aboutRes.data);
        setAboutForm({
          bio: aboutRes.data.bio || '',
          bio_ar: aboutRes.data.bio_ar || '',
          profile_image_url: aboutRes.data.profile_image_url || '',
          resume_url: aboutRes.data.resume_url || '',
        });
      }

      setTimeline(timelineRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveAbout = async () => {
    if (!about) return;

    setSavingAbout(true);
    try {
      const { error } = await supabase
        .from('about')
        .update({
          bio: aboutForm.bio || null,
          bio_ar: aboutForm.bio_ar || null,
          profile_image_url: aboutForm.profile_image_url || null,
          resume_url: aboutForm.resume_url || null,
        })
        .eq('id', about.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'About section updated' });
    } catch (error) {
      console.error('Error saving about:', error);
      toast({
        title: 'Error',
        description: 'Failed to save about section',
        variant: 'destructive',
      });
    } finally {
      setSavingAbout(false);
    }
  };

  const uploadFile = async (file: File, folder: 'profiles' | 'resumes') => {
    const category = folder === 'resumes' ? 'document' : 'image';
    const validation = validateFile(file, category);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const safeName = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from('uploads').upload(safeName, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('uploads').getPublicUrl(safeName);
    return data.publicUrl;
  };

  const handleProfileUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingProfile(true);
    try {
      const url = await uploadFile(file, 'profiles');
      setAboutForm((prev) => ({ ...prev, profile_image_url: url }));
      toast({ title: 'Success', description: 'Profile image uploaded' });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile image',
        variant: 'destructive',
      });
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleResumeUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadFile(file, 'resumes');
      setAboutForm((prev) => ({ ...prev, resume_url: url }));
      toast({ title: 'Success', description: 'Resume uploaded' });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const openTimelineCreateDialog = () => {
    setEditingTimeline(null);
    setTimelineForm({
      year: '',
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      icon: 'Briefcase',
      visible: true,
    });
    setIsTimelineDialogOpen(true);
  };

  const openTimelineEditDialog = (item: TimelineItem) => {
    setEditingTimeline(item);
    setTimelineForm({
      year: item.year,
      title: item.title,
      title_ar: item.title_ar || '',
      description: item.description || '',
      description_ar: item.description_ar || '',
      icon: item.icon || 'Briefcase',
      visible: item.visible,
    });
    setIsTimelineDialogOpen(true);
  };

  const saveTimeline = async () => {
    if (!timelineForm.year || !timelineForm.title) {
      toast({
        title: 'Validation Error',
        description: 'Year and title are required',
        variant: 'destructive',
      });
      return;
    }

    setSavingTimeline(true);
    try {
      const data = {
        year: timelineForm.year,
        title: timelineForm.title,
        title_ar: timelineForm.title_ar || null,
        description: timelineForm.description || null,
        description_ar: timelineForm.description_ar || null,
        icon: timelineForm.icon,
        visible: timelineForm.visible,
      };

      if (editingTimeline) {
        const { error } = await supabase
          .from('timeline')
          .update(data)
          .eq('id', editingTimeline.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Timeline item updated' });
      } else {
        const { error } = await supabase.from('timeline').insert({
          ...data,
          sort_order: timeline.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Timeline item created' });
      }

      setIsTimelineDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving timeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to save timeline item',
        variant: 'destructive',
      });
    } finally {
      setSavingTimeline(false);
    }
  };

  const deleteTimeline = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from('timeline').delete().eq('id', deletingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Timeline item deleted' });
      fetchData();
    } catch (error) {
      console.error('Error deleting timeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete timeline item',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const toggleTimelineVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('timeline')
        .update({ visible: !visible })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="About & Timeline" subtitle="Manage about section and timeline" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="About & Timeline" subtitle="Manage about section and timeline" />

      <div className="p-6">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="about" className="data-[state=active]:bg-blue-600">
              <User className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">About Section</CardTitle>
                <CardDescription className="text-slate-400">
                  Update your bio and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (English)</Label>
                    <Textarea
                      id="bio"
                      value={aboutForm.bio}
                      onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                      className="bg-slate-800 border-slate-600 min-h-[150px]"
                      placeholder="Tell visitors about yourself..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio_ar">Bio (Arabic)</Label>
                    <Textarea
                      id="bio_ar"
                      value={aboutForm.bio_ar}
                      onChange={(e) => setAboutForm({ ...aboutForm, bio_ar: e.target.value })}
                      className="bg-slate-800 border-slate-600 min-h-[150px]"
                      dir="rtl"
                      placeholder="أخبر الزوار عن نفسك..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile_image_url">Profile Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="profile_image_url"
                        value={aboutForm.profile_image_url}
                        onChange={(e) => setAboutForm({ ...aboutForm, profile_image_url: e.target.value })}
                        className="bg-slate-800 border-slate-600"
                        placeholder="https://example.com/profile.jpg"
                      />
                      {aboutForm.profile_image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-600"
                          onClick={() => window.open(aboutForm.profile_image_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-slate-600 bg-slate-800/60 hover:bg-slate-800">
                        <Upload className="w-4 h-4" />
                        {uploadingProfile ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProfileUpload(e.target.files?.[0] || null)}
                          disabled={uploadingProfile}
                        />
                      </label>
                      <span>Use a URL or upload a new image</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume_url">Resume/CV URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="resume_url"
                        value={aboutForm.resume_url}
                        onChange={(e) => setAboutForm({ ...aboutForm, resume_url: e.target.value })}
                        className="bg-slate-800 border-slate-600"
                        placeholder="https://example.com/resume.pdf"
                      />
                      {aboutForm.resume_url && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-600"
                          onClick={() => window.open(aboutForm.resume_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-slate-600 bg-slate-800/60 hover:bg-slate-800">
                        <Upload className="w-4 h-4" />
                        {uploadingResume ? 'Uploading...' : 'Upload PDF'}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                          disabled={uploadingResume}
                        />
                      </label>
                      <span>Use a URL or upload your PDF</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveAbout}
                    disabled={savingAbout}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {savingAbout ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-400">
                {timeline.length} item{timeline.length !== 1 ? 's' : ''}
              </p>
              <Button
                onClick={openTimelineCreateDialog}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Timeline Item
              </Button>
            </div>

            {timeline.length === 0 ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400 mb-4">No timeline items yet</p>
                  <Button onClick={openTimelineCreateDialog} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first timeline item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-slate-300 cursor-grab">
                          <GripVertical className="w-5 h-5" />
                        </button>

                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">{item.year}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{item.title}</h3>
                            {!item.visible && (
                              <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-slate-400 truncate">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTimelineVisibility(item.id, item.visible)}
                            className="text-slate-400 hover:text-white"
                          >
                            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTimelineEditDialog(item)}
                            className="text-slate-400 hover:text-white"
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
                            className="text-slate-400 hover:text-red-400"
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Timeline Dialog */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTimeline ? 'Edit Timeline Item' : 'Create Timeline Item'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Add experience, education, or achievements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  value={timelineForm.year}
                  onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setTimelineForm({ ...timelineForm, icon })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        timelineForm.icon === icon
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline_title">Title (English) *</Label>
                <Input
                  id="timeline_title"
                  value={timelineForm.title}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Senior Developer at Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline_title_ar">Title (Arabic)</Label>
                <Input
                  id="timeline_title_ar"
                  value={timelineForm.title_ar}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline_description">Description (English)</Label>
                <Textarea
                  id="timeline_description"
                  value={timelineForm.description}
                  onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline_description_ar">Description (Arabic)</Label>
                <Textarea
                  id="timeline_description_ar"
                  value={timelineForm.description_ar}
                  onChange={(e) => setTimelineForm({ ...timelineForm, description_ar: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="timeline_visible">Visible on website</Label>
              <Switch
                id="timeline_visible"
                checked={timelineForm.visible}
                onCheckedChange={(checked) => setTimelineForm({ ...timelineForm, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimelineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveTimeline}
              disabled={savingTimeline}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {savingTimeline ? (
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
            <AlertDialogTitle className="text-white">Delete Timeline Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTimeline}
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

export default AdminAbout;
