-- Add video URL support for project details
-- Generated: 2026-02-09

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS video_url TEXT;
