-- Add navbar glow intensity control to settings
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS navbar_glow_intensity INTEGER DEFAULT 100;

UPDATE public.settings
SET navbar_glow_intensity = COALESCE(navbar_glow_intensity, 100);
