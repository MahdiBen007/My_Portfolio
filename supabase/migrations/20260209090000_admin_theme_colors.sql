-- Add admin theme color controls to settings
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS admin_portfolio_primary_color TEXT,
  ADD COLUMN IF NOT EXISTS admin_portfolio_secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS admin_studio_primary_color TEXT,
  ADD COLUMN IF NOT EXISTS admin_studio_secondary_color TEXT;

UPDATE public.settings
SET
  admin_portfolio_primary_color = COALESCE(admin_portfolio_primary_color, '#22d3ee'),
  admin_portfolio_secondary_color = COALESCE(admin_portfolio_secondary_color, '#8b5cf6'),
  admin_studio_primary_color = COALESCE(admin_studio_primary_color, '#3b82f6'),
  admin_studio_secondary_color = COALESCE(admin_studio_secondary_color, '#8b5cf6');
