-- Add contact fields to settings for portfolio contact cards
-- Generated: 2026-02-09

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS location_en TEXT;
