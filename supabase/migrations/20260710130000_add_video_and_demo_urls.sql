-- Add video_url and demo_url to dashboard_screenshots
ALTER TABLE public.dashboard_screenshots
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS demo_url TEXT;

-- Add demo_video_url and demo_url to settings
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
ADD COLUMN IF NOT EXISTS demo_url TEXT;
