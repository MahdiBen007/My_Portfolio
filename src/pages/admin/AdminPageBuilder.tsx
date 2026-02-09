import { useState, useEffect } from 'react';
import {
  Plus, GripVertical, Eye, EyeOff, Trash2, Settings, Loader2, Smartphone, Monitor, Tablet,
  LayoutGrid, Users, Briefcase, Code2, FolderKanban, User, Clock, Mail, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AdminHeader from '@/components/admin/AdminHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PageBlock {
  id: string;
  page_id: string;
  block_type: string;
  title: string | null;
  subtitle: string | null;
  layout_variant: string;
  padding_top: number;
  padding_bottom: number;
  background_style: string;
  animation_preset: string;
  visible: boolean;
  sort_order: number;
  custom_content: string | null;
  settings: any;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
}

const blockTypes = [
  { type: 'hero', icon: Users, label: 'Hero Section', description: 'Main hero with intro' },
  { type: 'services', icon: Briefcase, label: 'Services', description: 'Display your services' },
  { type: 'skills', icon: Code2, label: 'Skills', description: 'Show your skills grid' },
  { type: 'featured_projects', icon: FolderKanban, label: 'Featured Projects', description: 'Highlight key projects' },
  { type: 'projects_grid', icon: LayoutGrid, label: 'Projects Grid', description: 'Full project gallery' },
  { type: 'about', icon: User, label: 'About', description: 'About section with bio' },
  { type: 'timeline', icon: Clock, label: 'Timeline', description: 'Experience timeline' },
  { type: 'contact', icon: Mail, label: 'Contact', description: 'Contact form section' },
];

const layoutVariants = ['default', 'centered', 'left-aligned', 'right-aligned', 'grid-2', 'grid-3'];
const backgroundStyles = ['transparent', 'solid', 'gradient', 'subtle-gradient'];
const animationPresets = ['none', 'fade-up', 'fade-in', 'slide-left', 'slide-right', 'zoom-in'];

const AdminPageBuilder = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [blockForm, setBlockForm] = useState({
    block_type: 'hero',
    title: '',
    subtitle: '',
    layout_variant: 'default',
    padding_top: 80,
    padding_bottom: 80,
    background_style: 'transparent',
    animation_preset: 'fade-up',
    visible: true,
  });

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPages(data || []);
      
      if (data && data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchBlocks(selectedPage.id);
    }
  }, [selectedPage]);

  const openAddBlockDialog = () => {
    setEditingBlock(null);
    setBlockForm({
      block_type: 'hero',
      title: '',
      subtitle: '',
      layout_variant: 'default',
      padding_top: 80,
      padding_bottom: 80,
      background_style: 'transparent',
      animation_preset: 'fade-up',
      visible: true,
    });
    setIsBlockDialogOpen(true);
  };

  const openEditBlockDialog = (block: PageBlock) => {
    setEditingBlock(block);
    setBlockForm({
      block_type: block.block_type,
      title: block.title || '',
      subtitle: block.subtitle || '',
      layout_variant: block.layout_variant,
      padding_top: block.padding_top,
      padding_bottom: block.padding_bottom,
      background_style: block.background_style,
      animation_preset: block.animation_preset,
      visible: block.visible,
    });
    setIsBlockDialogOpen(true);
  };

  const saveBlock = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      const blockData = {
        page_id: selectedPage.id,
        block_type: blockForm.block_type,
        title: blockForm.title || null,
        subtitle: blockForm.subtitle || null,
        layout_variant: blockForm.layout_variant,
        padding_top: blockForm.padding_top,
        padding_bottom: blockForm.padding_bottom,
        background_style: blockForm.background_style,
        animation_preset: blockForm.animation_preset,
        visible: blockForm.visible,
      };

      if (editingBlock) {
        const { error } = await supabase
          .from('page_blocks')
          .update(blockData)
          .eq('id', editingBlock.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Block updated' });
      } else {
        const { error } = await supabase.from('page_blocks').insert({
          ...blockData,
          sort_order: blocks.length,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Block added' });
      }

      setIsBlockDialogOpen(false);
      fetchBlocks(selectedPage.id);
    } catch (error) {
      console.error('Error saving block:', error);
      toast({
        title: 'Error',
        description: 'Failed to save block',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase.from('page_blocks').delete().eq('id', blockId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Block deleted' });
      if (selectedPage) fetchBlocks(selectedPage.id);
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const toggleBlockVisibility = async (block: PageBlock) => {
    try {
      const { error } = await supabase
        .from('page_blocks')
        .update({ visible: !block.visible })
        .eq('id', block.id);

      if (error) throw error;
      if (selectedPage) fetchBlocks(selectedPage.id);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const togglePublishPage = async () => {
    if (!selectedPage) return;

    try {
      const nextState = !selectedPage.is_published;
      const { error } = await supabase
        .from('pages')
        .update({ is_published: nextState })
        .eq('id', selectedPage.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: nextState ? 'Page published!' : 'Page unpublished',
      });
      fetchPages();
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update publish status',
        variant: 'destructive',
      });
    }
  };

  const moveBlock = async (blockId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= blocks.length) return;

    const current = blocks[currentIndex];
    const target = blocks[targetIndex];

    try {
      const { error: currentError } = await supabase
        .from('page_blocks')
        .update({ sort_order: target.sort_order })
        .eq('id', current.id);
      if (currentError) throw currentError;

      const { error: targetError } = await supabase
        .from('page_blocks')
        .update({ sort_order: current.sort_order })
        .eq('id', target.id);
      if (targetError) throw targetError;

      fetchBlocks(selectedPage.id);
    } catch (error) {
      console.error('Error reordering blocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder blocks',
        variant: 'destructive',
      });
    }
  };

  const toggleExpand = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const getBlockIcon = (type: string) => {
    const blockType = blockTypes.find((b) => b.type === type);
    return blockType?.icon || LayoutGrid;
  };

  const visibleBlocks = blocks.filter((block) => block.visible);
  const visibleBlockCount = visibleBlocks.length;

  if (loading) {
    return (
      <div>
        <AdminHeader title="Page Builder" subtitle="Build and customize your pages" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Page Builder" subtitle="Build and customize your pages" />

      <div className="p-6">
        {/* Page Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedPage?.id || ''}
              onValueChange={(value) => {
                const page = pages.find((p) => p.id === value);
                setSelectedPage(page || null);
              }}
            >
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
                    {page.is_published && (
                      <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">Live</Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewMode('desktop')}
                className={previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400'}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewMode('tablet')}
                className={previewMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400'}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewMode('mobile')}
                className={previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openAddBlockDialog} variant="outline" className="border-slate-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Block
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div>
            {/* Blocks List */}
            {blocks.length === 0 ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 border-dashed">
                <CardContent className="py-16 text-center">
                  <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No blocks yet. Start building your page!</p>
                  <Button onClick={openAddBlockDialog} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Block
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {blocks.map((block, index) => {
                  const BlockIcon = getBlockIcon(block.block_type);
                  const isExpanded = expandedBlocks.has(block.id);

                  return (
                    <Collapsible key={block.id} open={isExpanded} onOpenChange={() => toggleExpand(block.id)}>
                      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <button className="text-slate-500 hover:text-slate-300 cursor-grab">
                              <GripVertical className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                              <BlockIcon className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-white capitalize">
                                  {block.block_type.replace('_', ' ')}
                                </h3>
                                {!block.visible && (
                                  <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                              {block.title && (
                                <p className="text-sm text-slate-400 truncate">{block.title}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={index === 0}
                                className="text-slate-400 hover:text-white disabled:opacity-30"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={index === blocks.length - 1}
                                className="text-slate-400 hover:text-white disabled:opacity-30"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleBlockVisibility(block)}
                                className="text-slate-400 hover:text-white"
                              >
                                {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditBlockDialog(block)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBlock(block.id)}
                                className="text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <CollapsibleContent>
                            <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Layout</p>
                                <p className="text-slate-300 capitalize">{block.layout_variant}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Background</p>
                                <p className="text-slate-300 capitalize">{block.background_style}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Animation</p>
                                <p className="text-slate-300 capitalize">{block.animation_preset}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Padding</p>
                                <p className="text-slate-300">{block.padding_top}px / {block.padding_bottom}px</p>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription className="text-slate-400">
                  Structure preview for the selected page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-950/80 to-slate-900/70 p-4">
                  <div
                    className={`mx-auto w-full transition-all ${
                      previewMode === 'desktop'
                        ? 'max-w-full'
                        : previewMode === 'tablet'
                          ? 'max-w-[720px]'
                          : 'max-w-[420px]'
                    }`}
                  >
                    <div className="space-y-2">
                      {visibleBlocks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                          No visible blocks to preview
                        </div>
                      ) : (
                        visibleBlocks.map((block, index) => (
                          <div
                            key={`${block.id}-preview`}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                          >
                            <div>
                              <p className="text-xs uppercase tracking-wider text-slate-400">
                                {block.block_type.replace('_', ' ')}
                              </p>
                              <p className="text-white">
                                {block.title || block.block_type.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-300">#{index + 1}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Blocks</p>
                    <p className="text-base font-semibold text-white">
                      {visibleBlockCount} visible / {blocks.length} total
                    </p>
                  </div>
                  <Badge className={selectedPage?.is_published ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}>
                    {selectedPage?.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <Button
                  onClick={togglePublishPage}
                  className={
                    selectedPage?.is_published
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }
                >
                  {selectedPage?.is_published ? 'Unpublish' : 'Publish'}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Add/Edit Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Block' : 'Add Block'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure the block settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Block Type Selection */}
            {!editingBlock && (
              <div className="space-y-2">
                <Label>Block Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {blockTypes.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => setBlockForm({ ...blockForm, block_type: bt.type })}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        blockForm.block_type === bt.type
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <bt.icon className={`w-5 h-5 mb-2 ${
                        blockForm.block_type === bt.type ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <p className="text-sm font-medium text-white">{bt.label}</p>
                      <p className="text-xs text-slate-500">{bt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block_title">Section Title</Label>
                <Input
                  id="block_title"
                  value={blockForm.title}
                  onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Optional title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block_subtitle">Section Subtitle</Label>
                <Input
                  id="block_subtitle"
                  value={blockForm.subtitle}
                  onChange={(e) => setBlockForm({ ...blockForm, subtitle: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  placeholder="Optional subtitle"
                />
              </div>
            </div>

            {/* Layout & Background */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Layout Variant</Label>
                <Select
                  value={blockForm.layout_variant}
                  onValueChange={(value) => setBlockForm({ ...blockForm, layout_variant: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {layoutVariants.map((v) => (
                      <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Background Style</Label>
                <Select
                  value={blockForm.background_style}
                  onValueChange={(value) => setBlockForm({ ...blockForm, background_style: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {backgroundStyles.map((v) => (
                      <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Animation */}
            <div className="space-y-2">
              <Label>Animation Preset</Label>
              <Select
                value={blockForm.animation_preset}
                onValueChange={(value) => setBlockForm({ ...blockForm, animation_preset: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {animationPresets.map((v) => (
                    <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Padding */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Padding Top: {blockForm.padding_top}px</Label>
                <Slider
                  value={[blockForm.padding_top]}
                  onValueChange={([value]) => setBlockForm({ ...blockForm, padding_top: value })}
                  max={160}
                  step={8}
                  className="py-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Padding Bottom: {blockForm.padding_bottom}px</Label>
                <Slider
                  value={[blockForm.padding_bottom]}
                  onValueChange={([value]) => setBlockForm({ ...blockForm, padding_bottom: value })}
                  max={160}
                  step={8}
                  className="py-2"
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <Label htmlFor="block_visible">Visible on website</Label>
              <Switch
                id="block_visible"
                checked={blockForm.visible}
                onCheckedChange={(checked) => setBlockForm({ ...blockForm, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveBlock}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Block'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPageBuilder;
