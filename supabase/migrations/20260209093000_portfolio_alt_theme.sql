-- Add alternate portfolio theme gradient for toggle
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS background_gradient_alt TEXT;

UPDATE public.settings
SET background_gradient_alt = COALESCE(background_gradient_alt, 'midnight');
