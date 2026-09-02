-- ============================================================================
-- InventoryPro — Lifetime License System
-- Additive migration. Does NOT drop or alter any existing object.
-- Tables: public.licenses, public.license_devices
-- Access: Admin-only (Supabase Auth + RLS). The InventoryPro desktop app never
--         touches these tables directly — it goes through Edge Functions that
--         use the service role. Therefore NO anon/public policies exist here.
-- ============================================================================

-- 1. Enums --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.license_status AS ENUM ('active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.device_binding_status AS ENUM ('active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. licenses -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.licenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key    TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT,
  notes          TEXT,
  status         public.license_status NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. license_devices (currently: 1 license = 1 device) ------------------------
CREATE TABLE IF NOT EXISTS public.license_devices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id         UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name        TEXT,
  os                 TEXT,
  activated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status             public.device_binding_status NOT NULL DEFAULT 'active'
);

-- One binding per license enforces "one device per license".
CREATE UNIQUE INDEX IF NOT EXISTS license_devices_one_per_license
  ON public.license_devices (license_id);

CREATE INDEX IF NOT EXISTS license_devices_fingerprint_idx
  ON public.license_devices (device_fingerprint);

-- 4. Row Level Security -------------------------------------------------------
ALTER TABLE public.licenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_devices ENABLE ROW LEVEL SECURITY;

-- Admin-only full access (idempotent: drop then recreate).
DROP POLICY IF EXISTS "admin_all_licenses" ON public.licenses;
CREATE POLICY "admin_all_licenses" ON public.licenses
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_all_license_devices" ON public.license_devices;
CREATE POLICY "admin_all_license_devices" ON public.license_devices
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
