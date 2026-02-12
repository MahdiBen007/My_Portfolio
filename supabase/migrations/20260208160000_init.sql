-- Clean schema init for Portfolio Admin
-- Generated: 2026-02-08

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.skill_category AS ENUM ('frontend', 'backend', 'database', 'tools', 'other');
CREATE TYPE public.project_status AS ENUM ('completed', 'in_progress', 'planned');

-- Profiles
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role app_role NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,
    icon TEXT NOT NULL DEFAULT 'Code',
    tags TEXT[] DEFAULT '{}',
    cta_label TEXT,
    cta_link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skills
CREATE TABLE public.skills (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    icon TEXT NOT NULL DEFAULT 'Code',
    category skill_category NOT NULL DEFAULT 'frontend',
    level INTEGER NOT NULL DEFAULT 80 CHECK (level >= 0 AND level <= 100),
    brand_color TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,
    thumbnail_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    github_link TEXT,
    live_demo_link TEXT,
    category TEXT,
    status project_status NOT NULL DEFAULT 'completed',
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Sections
CREATE TABLE public.project_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- About
CREATE TABLE public.about (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bio TEXT,
    bio_ar TEXT,
    profile_image_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timeline
CREATE TABLE public.timeline (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    icon TEXT DEFAULT 'Briefcase',
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_starred BOOLEAN NOT NULL DEFAULT false,
    is_replied BOOLEAN NOT NULL DEFAULT false,
    is_spam BOOLEAN NOT NULL DEFAULT false,
    internal_notes TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings
CREATE TABLE public.settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Theme settings
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#8b5cf6',
    navbar_border_color TEXT DEFAULT '#22d3ee',
    navbar_glow_color TEXT DEFAULT '#22d3ee',
    navbar_glow_intensity INTEGER DEFAULT 100,
    background_gradient TEXT DEFAULT 'night',
    border_radius INTEGER DEFAULT 16,
    spacing_density TEXT DEFAULT 'comfortable',
    ui_font TEXT DEFAULT 'Plus Jakarta Sans',
    site_font TEXT DEFAULT 'Plus Jakarta Sans',
    animations_enabled BOOLEAN DEFAULT true,
    shadow_intensity INTEGER DEFAULT 50,
    -- SEO settings
    meta_title TEXT DEFAULT 'Web Developer Portfolio',
    admin_meta_title TEXT DEFAULT 'Admin Dashboard',
    meta_description TEXT,
    og_image_url TEXT,
    keywords TEXT,
    canonical_url TEXT,
    -- Social links
    github_url TEXT,
    linkedin_url TEXT,
    behance_url TEXT,
    email TEXT,
    whatsapp TEXT,
    custom_links JSONB DEFAULT '[]',
    -- Footer settings
    copyright_text TEXT DEFAULT '© 2024 All rights reserved.',
    footer_links JSONB DEFAULT '[]',
    footer_contact_info TEXT,
    locale TEXT DEFAULT 'ar',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT settings_locale_check CHECK (locale IN ('ar', 'en'))
);

-- Pages
CREATE TABLE public.pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Page Blocks
CREATE TABLE public.page_blocks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    layout_variant TEXT DEFAULT 'default',
    padding_top INTEGER DEFAULT 80,
    padding_bottom INTEGER DEFAULT 80,
    background_style TEXT DEFAULT 'transparent',
    animation_preset TEXT DEFAULT 'fade-up',
    visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    custom_content TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = _user_id AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = _user_id AND role = 'admin'
    )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_sections_updated_at BEFORE UPDATE ON public.project_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON public.about FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON public.timeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_page_blocks_updated_at BEFORE UPDATE ON public.page_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Services policies
CREATE POLICY "Admins can view services" ON public.services FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view visible services" ON public.services FOR SELECT USING (visible = true);

-- Skills policies
CREATE POLICY "Admins can view skills" ON public.skills FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert skills" ON public.skills FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update skills" ON public.skills FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete skills" ON public.skills FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view visible skills" ON public.skills FOR SELECT USING (visible = true);

-- Projects policies
CREATE POLICY "Admins can view projects" ON public.projects FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view visible projects" ON public.projects FOR SELECT USING (visible = true);

-- Project sections policies
CREATE POLICY "Admins can view project sections" ON public.project_sections FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert project sections" ON public.project_sections FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update project sections" ON public.project_sections FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete project sections" ON public.project_sections FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- About policies
CREATE POLICY "Admins can view about" ON public.about FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert about" ON public.about FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update about" ON public.about FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete about" ON public.about FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view about" ON public.about FOR SELECT USING (true);

-- Timeline policies
CREATE POLICY "Admins can view timeline" ON public.timeline FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert timeline" ON public.timeline FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update timeline" ON public.timeline FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete timeline" ON public.timeline FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view visible timeline" ON public.timeline FOR SELECT USING (visible = true);

-- Messages policies
CREATE POLICY "Admins can view messages" ON public.messages FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert messages" ON public.messages FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update messages" ON public.messages FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Settings policies
CREATE POLICY "Admins can view settings" ON public.settings FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Only admins can insert settings" ON public.settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update settings" ON public.settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete settings" ON public.settings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);

-- Pages policies
CREATE POLICY "Admins can view pages" ON public.pages FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert pages" ON public.pages FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view published pages" ON public.pages FOR SELECT USING (is_published = true);

-- Page blocks policies
CREATE POLICY "Admins can view page blocks" ON public.page_blocks FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert page blocks" ON public.page_blocks FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update page blocks" ON public.page_blocks FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete page blocks" ON public.page_blocks FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Public can view visible blocks for published pages" ON public.page_blocks
FOR SELECT
USING (
  visible = true
  AND EXISTS (
    SELECT 1
    FROM public.pages
    WHERE pages.id = page_blocks.page_id
      AND pages.is_published = true
  )
);

-- Storage bucket and policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update files" ON storage.objects
FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete files" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Public can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Default rows
INSERT INTO public.settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.about (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.pages (slug, title, is_published)
VALUES ('home', 'Homepage', true)
ON CONFLICT (slug) DO NOTHING;
