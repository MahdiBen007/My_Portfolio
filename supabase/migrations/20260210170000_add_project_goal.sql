-- Add goal fields to projects (EN + AR)
-- Generated: 2026-02-10

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS goal TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS goal_ar TEXT;

