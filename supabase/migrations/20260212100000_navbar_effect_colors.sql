-- Add portfolio navbar scroll effect colors to settings
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS navbar_border_color TEXT,
  ADD COLUMN IF NOT EXISTS navbar_glow_color TEXT;

UPDATE public.settings
SET
  navbar_border_color = COALESCE(navbar_border_color, primary_color, '#22d3ee'),
  navbar_glow_color = COALESCE(navbar_glow_color, primary_color, '#22d3ee');
