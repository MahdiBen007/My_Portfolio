-- =====================================================
-- COMBINED SECURITY HARDENING + PHONE MIGRATION
-- Run this SINGLE migration in Supabase SQL Editor
-- =====================================================

-- 1. Make email nullable (phone replaces it in contact form)
ALTER TABLE public.messages ALTER COLUMN email DROP NOT NULL;

-- 2. Add phone column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Drop old conflicting policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Public can submit messages with validation" ON public.messages;

-- 4. New insert policy: validates phone format
CREATE POLICY "Public can submit messages with validation" ON public.messages
  FOR INSERT
  WITH CHECK (
    length(name) >= 2
    AND length(name) <= 100
    AND phone ~* '^0[567][0-9]{8}$'
    AND length(message) >= 10
    AND length(message) <= 5000
  );

-- 5. Create rate_limits table (safe even if it exists)
CREATE TABLE IF NOT EXISTS public.message_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage rate limits" ON public.message_rate_limits;
CREATE POLICY "System can manage rate limits" ON public.message_rate_limits
  FOR ALL USING (true);

-- 6. Rate limit function: 1 message per phone per 24 hours
DROP FUNCTION IF EXISTS public.check_message_rate_limit(TEXT);

CREATE OR REPLACE FUNCTION public.check_message_rate_limit(p_identifier TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.message_rate_limits
  WHERE identifier = p_identifier
    AND submitted_at > now() - interval '24 hours';

  IF recent_count >= 1 THEN
    RETURN false;
  END IF;

  INSERT INTO public.message_rate_limits (identifier) VALUES (p_identifier);
  RETURN true;
END;
$$;

-- 7. Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.message_rate_limits
  WHERE submitted_at < now() - interval '24 hours';
END;
$$;

-- 8. Server-side rate limit trigger (runs on every INSERT)
CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  IF NEW.phone IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.message_rate_limits
  WHERE identifier = NEW.phone
    AND submitted_at > now() - interval '24 hours';

  IF recent_count >= 1 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 1 message per phone per 24 hours';
  END IF;

  INSERT INTO public.message_rate_limits (identifier) VALUES (NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rate_limit_messages ON public.messages;
CREATE TRIGGER rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_message_rate_limit();
