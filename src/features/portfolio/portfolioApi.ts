import type { PortfolioData } from "./data/portfolio-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const getHeaders = () => ({
  apikey: SUPABASE_ANON_KEY ?? "",
  Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
  "Content-Type": "application/json",
});

const getBaseUrl = (table: string) => `${SUPABASE_URL}/rest/v1/${table}`;

const normalizeAssetUrl = (value: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  if (SUPABASE_URL && (trimmed.startsWith('uploads/') || trimmed.startsWith('public/'))) {
    const path = trimmed.replace(/^public\//, '');
    return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
  }
  return `/${trimmed}`;
};

const parseErrorMessage = async (res: Response) => {
  try {
    const body = await res.json();
    if (body?.message) return body.message;
  } catch {
    // ignore
  }
  return `${res.status} ${res.statusText}`;
};

const requestJson = async <T>(table: string, query: string): Promise<T> => {
  const url = `${getBaseUrl(table)}${query}`;
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(`Supabase fetch failed: ${message}`);
  }

  return (await response.json()) as T;
};

const safeRequest = async <T>(table: string, query: string): Promise<T | undefined> => {
  if (!isSupabaseConfigured) return undefined;
  try {
    return await requestJson<T>(table, query);
  } catch (error) {
    console.error(`[portfolioApi] Failed to fetch ${table}:`, error);
    return undefined;
  }
};

type ServiceRow = {
  title: string | null;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  icon: string | null;
  sort_order: number | null;
  visible: boolean | null;
};

type SkillRow = {
  name: string | null;
  name_ar: string | null;
  icon: string | null;
  category: string | null;
  brand_color: string | null;
  sort_order: number | null;
  visible: boolean | null;
};

type ProjectRow = {
  id: string;
  title: string | null;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  goal?: string | null;
  goal_ar?: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  gallery_images: string[] | null;
  tech_stack: string[] | null;
  github_link: string | null;
  live_demo_link: string | null;
  category: string | null;
  status: string | null;
  featured: boolean | null;
  sort_order: number | null;
  visible: boolean | null;
  package_type: string | null;
};

type AboutRow = {
  bio: string | null;
  bio_ar: string | null;
  profile_image_url: string | null;
  resume_url: string | null;
};

type TimelineRow = {
  id: string;
  year: string | null;
  title: string | null;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  sort_order: number | null;
  visible: boolean | null;
};

type SettingsRow = {
  primary_color: string | null;
  secondary_color: string | null;
  navbar_border_color?: string | null;
  navbar_glow_color?: string | null;
  navbar_glow_intensity?: number | null;
  background_gradient: string | null;
  background_gradient_alt: string | null;
  border_radius: number | null;
  spacing_density: string | null;
  ui_font: string | null;
  site_font: string | null;
  animations_enabled: boolean | null;
  shadow_intensity: number | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  behance_url: string | null;
  email: string | null;
  whatsapp: string | null;
  phone: string | null;
  location: string | null;
  location_en: string | null;
  footer_contact_info: string | null;
  copyright_text: string | null;
  locale: "ar" | "en" | null;
};

const parseKeywords = (keywords: string | null) =>
  keywords
    ? keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

export type PartialPortfolioData = Omit<Partial<PortfolioData>, "personalData" | "settings"> & {
  personalData?: Partial<PortfolioData["personalData"]>;
  settings?: Partial<PortfolioData["settings"]>;
};

export const fetchPortfolioData = async (): Promise<PartialPortfolioData | null> => {
  if (!isSupabaseConfigured) return null;

  const projectsQueryV2 =
    "?select=id,title,title_ar,description,description_ar,goal,goal_ar,thumbnail_url,video_url,gallery_images,tech_stack,github_link,live_demo_link,category,status,featured,sort_order,visible,package_type&visible=eq.true&order=sort_order.asc";
  const projectsQueryV1 =
    "?select=id,title,title_ar,description,description_ar,thumbnail_url,video_url,gallery_images,tech_stack,github_link,live_demo_link,category,status,featured,sort_order,visible,package_type&visible=eq.true&order=sort_order.asc";
  const settingsQueryV2 =
    "?select=primary_color,secondary_color,navbar_border_color,navbar_glow_color,navbar_glow_intensity,background_gradient,background_gradient_alt,border_radius,spacing_density,ui_font,site_font,animations_enabled,shadow_intensity,meta_title,meta_description,keywords,github_url,linkedin_url,behance_url,email,whatsapp,phone,location,location_en,footer_contact_info,copyright_text,locale,featured_category,loader_text_ar,loader_text_en,loader_subtitle_ar,loader_subtitle_en,loader_duration,typing_speed&limit=1";
  const settingsQueryV1 =
    "?select=primary_color,secondary_color,background_gradient,background_gradient_alt,border_radius,spacing_density,ui_font,site_font,animations_enabled,shadow_intensity,meta_title,meta_description,keywords,github_url,linkedin_url,behance_url,email,whatsapp,phone,location,location_en,footer_contact_info,copyright_text,locale&limit=1";

  const [
    servicesRows,
    skillsRows,
    projectsRows,
    aboutRows,
    timelineRows,
    settingsRows,
  ] = await Promise.all([
    safeRequest<ServiceRow[]>(
      "services",
      "?select=title,title_ar,description,description_ar,icon,sort_order,visible&visible=eq.true&order=sort_order.asc"
    ),
    safeRequest<SkillRow[]>(
      "skills",
      "?select=name,name_ar,icon,category,brand_color,sort_order,visible&visible=eq.true&order=sort_order.asc"
    ),
    (async () => {
      try {
        return await requestJson<ProjectRow[]>("projects", projectsQueryV2);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const schemaMissing = message.includes("schema cache") || message.includes("column");
        if (schemaMissing) {
          try {
            return await requestJson<ProjectRow[]>("projects", projectsQueryV1);
          } catch (fallbackError) {
            console.error("[portfolioApi] Failed to fetch projects:", fallbackError);
            return undefined;
          }
        }
        console.error("[portfolioApi] Failed to fetch projects:", error);
        return undefined;
      }
    })(),
    safeRequest<AboutRow[]>("about", "?select=bio,bio_ar,profile_image_url,resume_url&limit=1"),
    safeRequest<TimelineRow[]>(
      "timeline",
      "?select=id,year,title,title_ar,description,description_ar,sort_order,visible&visible=eq.true&order=sort_order.asc"
    ),
    (async () => {
      try {
        return await requestJson<SettingsRow[]>("settings", settingsQueryV2);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const schemaMissing = message.includes("schema cache") || message.includes("column");
        if (schemaMissing) {
          try {
            return await requestJson<SettingsRow[]>("settings", settingsQueryV1);
          } catch (fallbackError) {
            console.error("[portfolioApi] Failed to fetch settings:", fallbackError);
            return undefined;
          }
        }
        console.error("[portfolioApi] Failed to fetch settings:", error);
        return undefined;
      }
    })(),
  ]);

  const partial: PartialPortfolioData = {};

  if (servicesRows !== undefined) {
    partial.services = (servicesRows ?? []).map((service) => ({
      icon: service.icon ?? "Code",
      title: service.title_ar ?? service.title ?? "",
      titleEn: service.title ?? service.title_ar ?? "",
      description: service.description_ar ?? service.description ?? "",
      descriptionEn: service.description ?? service.description_ar ?? "",
    }));
  }

  if (skillsRows !== undefined) {
    partial.skills = (skillsRows ?? []).map((skill) => ({
      name: skill.name_ar ?? skill.name ?? "",
      nameEn: skill.name ?? skill.name_ar ?? "",
      icon: skill.icon ?? "code",
      category: skill.category ?? "other",
      customColor: skill.brand_color ?? undefined,
    }));
  }

  if (projectsRows !== undefined) {
    const mappedProjects = (projectsRows ?? []).map((project) => {
      const galleryImages = (project.gallery_images ?? []).filter(Boolean);
      const cleanedGallery = galleryImages.filter((image) => image !== "/project-placeholder.jpg");
      const images = [
        ...(project.thumbnail_url ? [project.thumbnail_url] : []),
        ...cleanedGallery,
      ];

      const descriptionAr = project.description_ar ?? project.description ?? "";
      const descriptionEn = project.description ?? project.description_ar ?? "";
      const goalAr = project.goal_ar ?? project.goal ?? "";
      const goalEn = project.goal ?? project.goal_ar ?? "";

      return {
        id: project.id,
        title: project.title_ar ?? project.title ?? "",
        titleEn: project.title ?? project.title_ar ?? "",
        shortDescription: descriptionAr,
        shortDescriptionEn: descriptionEn,
        fullDescription: descriptionAr,
        fullDescriptionEn: descriptionEn,
        category: project.category ?? "Other",
        technologies: project.tech_stack ?? [],
        features: [],
        featuresEn: [],
        goal: goalAr,
        goalEn: goalEn,
        challenges: "",
        challengesEn: "",
        result: "",
        resultEn: "",
        liveUrl: project.live_demo_link ?? "",
        githubUrl: project.github_link ?? "",
        videoUrl: project.video_url ?? "",
        images,
        featured: project.featured ?? false,
        status: project.status ?? "completed",
        order: project.sort_order ?? 0,
        packageType: project.package_type ?? "other",
      };
    });

    partial.projects = mappedProjects;

    const categories = Array.from(
      new Set(mappedProjects.map((project) => project.category).filter(Boolean))
    );
    partial.projectCategories = [
      { id: "all", label: "الكل", labelEn: "All" },
      ...categories.map((category) => ({
        id: category,
        label: category,
        labelEn: category,
      })),
    ];
  }

  const aboutRow = aboutRows?.[0];
  const settingsRow = settingsRows?.[0];

  if (aboutRow || settingsRow) {
    const personalData: Partial<PortfolioData["personalData"]> = {};

    if (aboutRow?.bio_ar) personalData.aboutBio = aboutRow.bio_ar;
    if (aboutRow?.bio) personalData.aboutBioEn = aboutRow.bio;
    if (aboutRow?.resume_url) personalData.cvLink = normalizeAssetUrl(aboutRow.resume_url);
    if (aboutRow?.profile_image_url) {
      personalData.profileImageUrl = normalizeAssetUrl(aboutRow.profile_image_url);
    }
    if (settingsRow) {
      personalData.email = settingsRow.email ?? "";
      personalData.whatsapp = settingsRow.whatsapp ?? "";
      personalData.github = settingsRow.github_url ?? "";
      personalData.linkedin = settingsRow.linkedin_url ?? "";
      personalData.phone = settingsRow.phone ?? "";
      personalData.location = settingsRow.location ?? "";
      personalData.locationEn = settingsRow.location_en ?? "";
    }

    if (Object.keys(personalData).length > 0) {
      partial.personalData = personalData;
    }
  }

  if (timelineRows !== undefined) {
    partial.experience = (timelineRows ?? []).map((item, index) => ({
      id: item.id ?? index,
      year: item.year ?? "",
      yearEn: item.year ?? "",
      title: item.title_ar ?? item.title ?? "",
      titleEn: item.title ?? item.title_ar ?? "",
      company: item.description_ar ?? item.description ?? "",
      companyEn: item.description ?? item.description_ar ?? "",
      description: item.description_ar ?? item.description ?? "",
      descriptionEn: item.description ?? item.description_ar ?? "",
    }));
  }

  if (settingsRow) {
    const keywords = parseKeywords(settingsRow.keywords);
    const themePrimary = settingsRow.primary_color ?? undefined;
    const themeSecondary = settingsRow.secondary_color ?? undefined;
    const locale = settingsRow.locale === "en" ? "en" : "ar";
    const ui = {
      backgroundGradient: settingsRow.background_gradient ?? "night",
      backgroundGradientAlt: settingsRow.background_gradient_alt ?? "midnight",
      borderRadius: settingsRow.border_radius ?? 16,
      spacingDensity: settingsRow.spacing_density ?? "comfortable",
      uiFont: settingsRow.ui_font ?? "Plus Jakarta Sans",
      siteFont: settingsRow.site_font ?? "Plus Jakarta Sans",
      animationsEnabled: settingsRow.animations_enabled ?? true,
      shadowIntensity: settingsRow.shadow_intensity ?? 50,
      navbarBorderColor: settingsRow.navbar_border_color ?? "",
      navbarGlowColor: settingsRow.navbar_glow_color ?? "",
      navbarGlowIntensity: settingsRow.navbar_glow_intensity ?? 100,
    };

    partial.settings = {
      seo: {
        title: settingsRow.meta_title ?? "",
        description: settingsRow.meta_description ?? "",
        keywords: keywords ?? [],
      },
      theme: {
        primary: themePrimary ?? "",
        secondary: themeSecondary ?? "",
        accent: themeSecondary ?? themePrimary ?? "",
      },
      locale,
      ui,
      featuredCategory: settingsRow.featured_category ?? "all",
      loader: {
        textAr: settingsRow.loader_text_ar ?? "أنا مطور ويب",
        textEn: settingsRow.loader_text_en ?? "I am Web Developer",
        subtitleAr: settingsRow.loader_subtitle_ar ?? "جارٍ تحميل البرتفوليو...",
        subtitleEn: settingsRow.loader_subtitle_en ?? "Loading portfolio...",
        duration: settingsRow.loader_duration ?? 1400,
        typingSpeed: settingsRow.typing_speed ?? 80,
      },
    };
  }

  if (Object.keys(partial).length === 0) return null;
  return partial;
};

export const upsertPortfolioData = async (_data: PortfolioData) => {
  if (!isSupabaseConfigured) return;
  console.warn("[portfolioApi] upsertPortfolioData is not configured for table-based storage.");
};
