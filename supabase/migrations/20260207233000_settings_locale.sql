ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'ar';

UPDATE public.settings
SET locale = 'ar'
WHERE locale IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'settings_locale_check'
      AND conrelid = 'public.settings'::regclass
  ) THEN
    ALTER TABLE public.settings
    ADD CONSTRAINT settings_locale_check CHECK (locale IN ('ar', 'en'));
  END IF;
END $$;
