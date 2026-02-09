import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseConfigured } from '@/features/portfolio/portfolioApi';

export type PageBlock = {
  id: string;
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
};

export const usePageBlocks = (slug = 'home') => {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    const fetchBlocks = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: page, error: pageError } = await supabase
          .from('pages')
          .select('id,is_published')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (pageError) throw pageError;
        if (!page) {
          setBlocks([]);
          return;
        }

        const { data, error: blocksError } = await supabase
          .from('page_blocks')
          .select(
            'id,block_type,title,subtitle,layout_variant,padding_top,padding_bottom,background_style,animation_preset,visible,sort_order'
          )
          .eq('page_id', page.id)
          .eq('visible', true)
          .order('sort_order', { ascending: true });

        if (blocksError) throw blocksError;
        setBlocks(data || []);
      } catch (err) {
        console.error('Error loading page blocks:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [slug]);

  return { blocks, loading, error };
};
