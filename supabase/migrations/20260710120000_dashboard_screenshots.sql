-- Dashboard screenshots table for the DemoSection gallery
CREATE TABLE public.dashboard_screenshots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.dashboard_screenshots ENABLE ROW LEVEL SECURITY;

-- Admins/editors full CRUD
CREATE POLICY "Admins can view all dashboard screenshots" ON public.dashboard_screenshots
FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert dashboard screenshots" ON public.dashboard_screenshots
FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update dashboard screenshots" ON public.dashboard_screenshots
FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete dashboard screenshots" ON public.dashboard_screenshots
FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- Public can read active screenshots
CREATE POLICY "Public can view active dashboard screenshots" ON public.dashboard_screenshots
FOR SELECT USING (is_active = true);
