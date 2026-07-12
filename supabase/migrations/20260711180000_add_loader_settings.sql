-- Add loader settings columns to the settings table
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS loader_text_ar text NOT NULL DEFAULT 'أنا مطور ويب',
  ADD COLUMN IF NOT EXISTS loader_text_en text NOT NULL DEFAULT 'I am Web Developer',
  ADD COLUMN IF NOT EXISTS loader_subtitle_ar text NOT NULL DEFAULT 'جارٍ تحميل البرتفوليو...',
  ADD COLUMN IF NOT EXISTS loader_subtitle_en text NOT NULL DEFAULT 'Loading portfolio...',
  ADD COLUMN IF NOT EXISTS loader_duration integer NOT NULL DEFAULT 1400,
  ADD COLUMN IF NOT EXISTS typing_speed integer NOT NULL DEFAULT 80;
