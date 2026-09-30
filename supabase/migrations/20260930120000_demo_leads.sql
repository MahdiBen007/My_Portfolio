-- =====================================================
-- DEMO LEADS TABLE MIGRATION
-- Run this in Supabase SQL Editor to enable cloud sync
-- between Landing Page and Admin Dashboard
-- =====================================================

CREATE TABLE IF NOT EXISTS public.demo_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    business_type TEXT NOT NULL,
    downloads_count INTEGER NOT NULL DEFAULT 1,
    last_download_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'not_interested',
    notes TEXT,
    ip TEXT
);

-- Index for phone search and deduplication
CREATE INDEX IF NOT EXISTS demo_leads_phone_idx ON public.demo_leads (phone);
CREATE INDEX IF NOT EXISTS demo_leads_created_at_idx ON public.demo_leads (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- 1. Allow Landing Page (public anon) to insert leads
DROP POLICY IF EXISTS "Public can submit demo leads" ON public.demo_leads;
CREATE POLICY "Public can submit demo leads" ON public.demo_leads
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (
        length(full_name) >= 2
        AND length(phone) >= 10
        AND length(business_type) >= 2
    );

-- 2. Allow reading leads (public/authenticated for Dashboard)
DROP POLICY IF EXISTS "Allow read demo leads" ON public.demo_leads;
CREATE POLICY "Allow read demo leads" ON public.demo_leads
    FOR SELECT
    TO public, anon, authenticated
    USING (true);

-- 3. Allow updating status / notes from Dashboard
DROP POLICY IF EXISTS "Allow update demo leads" ON public.demo_leads;
CREATE POLICY "Allow update demo leads" ON public.demo_leads
    FOR UPDATE
    TO public, anon, authenticated
    USING (true);

-- 4. Allow deleting demo leads from Dashboard
DROP POLICY IF EXISTS "Allow delete demo leads" ON public.demo_leads;
CREATE POLICY "Allow delete demo leads" ON public.demo_leads
    FOR DELETE
    TO public, anon, authenticated
    USING (true);
