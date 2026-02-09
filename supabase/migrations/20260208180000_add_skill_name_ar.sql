ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS name_ar TEXT;

UPDATE public.skills
SET name_ar = COALESCE(name_ar, name)
WHERE name_ar IS NULL;
