-- Add goal/challenges/result fields to projects (EN + AR)
-- Generated: 2026-02-10

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS goal TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS goal_ar TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS challenges TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS challenges_ar TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS result TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS result_ar TEXT;

