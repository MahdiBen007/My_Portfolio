export type PortfolioData = {
  personalData: {
    name: string;
    nameEn: string;
    title: string;
    titleEn: string;
    location: string;
    locationEn: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    whatsapp: string;
    cvLink: string;
    profileImageUrl: string;
    heroHeadline: string;
    heroHeadlineEn: string;
    heroDescription: string;
    heroDescriptionEn: string;
    aboutBio: string;
    aboutBioEn: string;
    stats: {
      yearsExperience: number;
      projectsCompleted: number;
      happyClients: number;
    };
  };
  services: Array<{
    icon: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
  }>;
  skills: Array<{
    name: string;
    nameEn: string;
    icon: string;
    category: string;
    customColor?: string;
  }>;
  skillCategories: Array<{
    id: string;
    label: string;
    labelEn: string;
    visible?: boolean;
  }>;
  projectCategories: Array<{
    id: string;
    label: string;
    labelEn: string;
    icon?: string;
  }>;
  projects: Array<{
    id: string | number;
    title: string;
    titleEn: string;
    shortDescription: string;
    shortDescriptionEn: string;
    fullDescription: string;
    fullDescriptionEn: string;
    category: string;
    technologies: string[];
    features: string[];
    featuresEn: string[];
    goal: string;
    goalEn: string;
    challenges: string;
    challengesEn: string;
    result: string;
    resultEn: string;
    liveUrl: string;
    githubUrl: string;
    images: string[];
    videoUrl?: string;
    featured?: boolean;
    status?: string;
    order?: number;
    gradient?: string;
    accentColor?: string;
    packageType?: string;
  }>;
  experience: Array<{
    year: string;
    yearEn: string;
    title: string;
    titleEn: string;
    company: string;
    companyEn: string;
    description?: string;
    descriptionEn?: string;
    id?: string | number;
  }>;
  testimonials: Array<{
    name: string;
    nameEn: string;
    role: string;
    content: string;
    contentEn: string;
    avatar: string;
  }>;
  certificates: Array<{
    id: string;
    title: string;
    titleEn: string;
    issuer: string;
    issuerEn: string;
    issueDate: string;
    credentialUrl?: string;
    fileUrl?: string;
    published?: boolean;
    order?: number;
    archived?: boolean;
  }>;
  navLinks: Array<{
    href: string;
    label: string;
    labelEn: string;
    order?: number;
  }>;
  settings: {
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    theme: {
      primary: string;
      secondary: string;
      accent: string;
    };
    locale: "ar" | "en";
    ui: {
      backgroundGradient: string;
      backgroundGradientAlt: string;
      borderRadius: number;
      spacingDensity: string;
      uiFont: string;
      siteFont: string;
      animationsEnabled: boolean;
      shadowIntensity: number;
      navbarBorderColor: string;
      navbarGlowColor: string;
      navbarGlowIntensity: number;
    };
    featuredCategory: string;
    loader: {
      textAr: string;
      textEn: string;
      subtitleAr: string;
      subtitleEn: string;
      duration: number;
      typingSpeed: number;
    };
  };
};

export const defaultPortfolioData: PortfolioData = {
  personalData: {
    name: "StoreCraft",
    nameEn: "StoreCraft",
    title: "منصة التجارة الإلكترونية",
    titleEn: "E-commerce Platform",
    location: "الجزائر",
    locationEn: "Algiers, Algeria",
    email: "contact@storecraft.dz",
    phone: "+213 555 000 000",
    github: "",
    linkedin: "https://linkedin.com/company/storecraft",
    whatsapp: "https://wa.me/213555000000",
    cvLink: "#demo",
    profileImageUrl: "/hero-portrait.svg",

    heroHeadline: "من الفكرة إلى متجرك الإلكتروني... اشترِ مرة واحدة وبِع بلا حدود.",
    heroHeadlineEn: "Build your professional online store in days, not months",

    heroDescription: "منصة متكاملة لإنشاء المتاجر الإلكترونية في الجزائر. لوحة تحكم متقدمة، تصميم مخصص، وأداء فائق — مصممة خصيصًا للسوق الجزائري.",
    heroDescriptionEn: "A complete platform for building e-commerce stores in Algeria. Advanced dashboard, custom design, and fast performance — built specifically for the Algerian market.",

    aboutBio: " StoreCraft هي منصة الجزائر الرائدة لإنشاء المتاجر الإلكترونية. نوفر حلولاً متكاملة تشمل تصميم المتاجر، إدارة المنتجات، الطلبات، المخزون، والتكامل مع منصات الدفع المحلية. مهمتنا هي تمكين الشركات الجزائرية من البيع عبر الإنترنت بسهولة واحترافية.",
    aboutBioEn: "StoreCraft is Algeria's leading e-commerce platform. We provide complete solutions including store design, product management, orders, inventory, and integration with local payment platforms. Our mission is to enable Algerian businesses to sell online with ease and professionalism.",

    stats: {
      yearsExperience: 100,
      projectsCompleted: 50,
      happyClients: 30,
    },
  },
  services: [
    {
      icon: "Palette",
      title: "متجر إلكتروني احترافي",
      titleEn: "Professional E-commerce Store",
      description: "تصميم متجر إلكتروني مخصص يعكس هوية علامتك التجارية",
      descriptionEn: "Custom e-commerce store design that reflects your brand identity",
    },
    {
      icon: "Server",
      title: "لوحة تحكم متقدمة",
      titleEn: "Advanced Dashboard",
      description: "لوحة تحكم شاملة لإدارة كل جانب من جوانب متجرك",
      descriptionEn: "Complete dashboard to manage every aspect of your store",
    },
    {
      icon: "Database",
      title: "إدارة المنتجات",
      titleEn: "Product Management",
      description: "إضافة وتعديل وتنظيم المنتجات بسهولة مع صور متعددة",
      descriptionEn: "Easily add, edit, and organize products with multiple images",
    },
    {
      icon: "Code",
      title: "إدارة الطلبات",
      titleEn: "Order Management",
      description: "تتبع الطلبات من الاستلام إلى التوصيل مع إشعارات فورية",
      descriptionEn: "Track orders from receipt to delivery with instant notifications",
    },
    {
      icon: "Briefcase",
      title: "إدارة المخزون",
      titleEn: "Inventory Management",
      description: "نظام مخزون ذكي يتنبأ بالاحتياجات ويمنع نفاد المنتجات",
      descriptionEn: "Smart inventory system that predicts needs and prevents stockouts",
    },
    {
      icon: "Sparkles",
      title: "جاهز لمحركات البحث",
      titleEn: "SEO Ready",
      description: "تحسين تلقائي لمحركات البحث لزيادة الزيارات والمبيعات",
      descriptionEn: "Automatic SEO optimization to increase traffic and sales",
    },
    {
      icon: "Globe",
      title: "تكامل فيسبوك بيكسل",
      titleEn: "Facebook Pixel Integration",
      description: "تتبع الحملات الإعلانية وتحسين العائد على الاستثمار",
      descriptionEn: "Track ad campaigns and optimize return on investment",
    },
    {
      icon: "Eye",
      title: "تحليلات متقدمة",
      titleEn: "Analytics",
      description: "تقارير مفصلة عن المبيعات والزيارات سلوك العملاء",
      descriptionEn: "Detailed reports on sales, traffic, and customer behavior",
    },
  ],
  skills: [
    { name: "React", nameEn: "React", icon: "react", category: "frontend" },
    { name: "TypeScript", nameEn: "TypeScript", icon: "typescript", category: "frontend" },
    { name: "Tailwind CSS", nameEn: "Tailwind CSS", icon: "tailwind", category: "frontend" },
    { name: "Node.js", nameEn: "Node.js", icon: "nodejs", category: "backend" },
    { name: "PostgreSQL", nameEn: "PostgreSQL", icon: "postgresql", category: "database" },
    { name: "Supabase", nameEn: "Supabase", icon: "postgresql", category: "backend" },
    { name: "Stripe", nameEn: "Stripe", icon: "javascript", category: "tools" },
    { name: "Docker", nameEn: "Docker", icon: "docker", category: "tools" },
  ],
  skillCategories: [
    { id: "all", label: "الكل", labelEn: "All" },
    { id: "frontend", label: "الواجهة الأمامية", labelEn: "Frontend" },
    { id: "backend", label: "الخادم", labelEn: "Backend" },
    { id: "database", label: "قواعد البيانات", labelEn: "Database" },
    { id: "tools", label: "الأدوات", labelEn: "Tools" },
  ],
  projectCategories: [
    { id: "all", label: "الكل", labelEn: "All", icon: "Grid3X3" },
    { id: "perfume", label: "عطور", labelEn: "Perfumes", icon: "Flower2" },
    { id: "fashion", label: "أزياء", labelEn: "Fashion", icon: "Shirt" },
    { id: "electronics", label: "إلكترونيات", labelEn: "Electronics", icon: "Cpu" },
    { id: "beauty", label: "تجميل", labelEn: "Beauty", icon: "Sparkles" },
    { id: "accessories", label: "إكسسوارات", labelEn: "Accessories", icon: "Gem" },
    { id: "food", label: "طعام", labelEn: "Food", icon: "UtensilsCrossed" },
    { id: "furniture", label: "أثاث", labelEn: "Furniture", icon: "Armchair" },
  ],
  projects: [
    {
      id: 1,
      title: "عطور فاخرة",
      titleEn: "Luxury Perfume",
      shortDescription: "متجر عطور فاخرة مع عرض تفاعلي وخيارات تخصيص الزجاجة",
      shortDescriptionEn: "Luxury perfume store with interactive display and bottle customization options",
      fullDescription: "متجر عطور فاخرة متكامل مع نظام تخصيص الزجاجة، عروض تفاعلية، وتجربة تسوق مميزة.",
      fullDescriptionEn: "Complete luxury perfume store with bottle customization system, interactive displays, and premium shopping experience.",
      category: "perfume",
      technologies: ["React", "Node.js", "Stripe", "PostgreSQL"],
      features: [
        "تخصيص الزجاجة",
        "سلة تسوق ذكية",
        "نظام الدفع الآمن",
        "معرض الصور التفاعلي",
        "تصميم متجاوب",
        "جاهز لمحركات البحث",
      ],
      featuresEn: [
        "Bottle customization",
        "Smart cart",
        "Secure checkout",
        "Interactive gallery",
        "Responsive design",
        "SEO ready",
      ],
      goal: "تقديم تجربة تسوق فاخرة تعكس جودة المنتجات",
      goalEn: "Deliver a luxury shopping experience reflecting product quality",
      challenges: "إدارة تخصيصات المنتجات المتعددة والتسعير Dinamically",
      challengesEn: "Managing multiple product customizations and dynamic pricing",
      result: "زيادة معدل التحويل بنسبة 52% ونمو المبيعات بنسبة 180%",
      resultEn: "52% conversion rate increase and 180% sales growth",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-perfume-1.jpg", "/store-perfume-2.jpg", "/store-perfume-3.jpg"],
      featured: true,
      gradient: "from-amber-900/40 via-yellow-900/20 to-orange-900/30",
      accentColor: "#F59E0B",
    },
    {
      id: 2,
      title: "متجر أزياء عصري",
      titleEn: "Modern Fashion",
      shortDescription: "متجر أزياء احترافي مع نظام قياس ذكي وإدارة مخزون متقدمة",
      shortDescriptionEn: "Professional fashion store with smart sizing guide and advanced inventory management",
      fullDescription: "متجر أزياء عصري متكامل يوفر تجربة تسوق سلسة مع نظام قياس ذكي وإدارة مخزون متقدمة.",
      fullDescriptionEn: "Modern fashion store with smooth shopping experience, smart sizing, and advanced inventory management.",
      category: "fashion",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
      features: [
        "نظام قياس ذكي",
        "إدارة المخزون",
        "سلة تسوق متقدمة",
        "نظام الدفع الآمن",
        "تصميم متجاوب",
        "جاهز لمحركات البحث",
      ],
      featuresEn: [
        "Smart sizing guide",
        "Inventory management",
        "Advanced cart",
        "Secure checkout",
        "Responsive design",
        "SEO ready",
      ],
      goal: "زيادة التحويلات وتحسين تجربة التسوق عبر الإنترنت",
      goalEn: "Increase conversions and improve online shopping experience",
      challenges: "إدارة المخزون المتعدد الأحجام والألوان في الوقت الفعلي",
      challengesEn: "Managing multi-size, multi-color inventory in real-time",
      result: "معدل تحويل بنسبة 45% وزيادة المبيعات بنسبة 120%",
      resultEn: "45% conversion rate increase and 120% sales growth",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-fashion-1.jpg", "/store-fashion-2.jpg", "/store-fashion-3.jpg"],
      featured: true,
      gradient: "from-pink-900/40 via-rose-900/20 to-fuchsia-900/30",
      accentColor: "#EC4899",
    },
    {
      id: 3,
      title: "متجر أحذية رياضية",
      titleEn: "Sneakers Store",
      shortDescription: "متجر أحذية رياضية مع عرض سريع ونظام مفضلة متكامل",
      shortDescriptionEn: "Sneakers store with quick view and integrated wishlist system",
      fullDescription: "متجر أحذية رياضية احترافي مع نظام عرض سريع، قائمة مفضلة، ومتابعة الطلبات.",
      fullDescriptionEn: "Professional sneakers store with quick view system, wishlist, and order tracking.",
      category: "fashion",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Stripe"],
      features: [
        "عرض سريع للمنتج",
        "قائمة المفضلة",
        "نظام المراجعات",
        "تصميم متجاوب",
        "دفع آمن",
        "تتبع الطلبات",
      ],
      featuresEn: [
        "Quick product view",
        "Wishlist system",
        "Review system",
        "Responsive design",
        "Secure checkout",
        "Order tracking",
      ],
      goal: "تسهيل عملية التسوق وزيادة معدلات إعادة الشراء",
      goalEn: "Simplify shopping and increase repeat purchase rates",
      challenges: "إدارة مستويات المخزون للأحجام والألوان المتعددة",
      challengesEn: "Managing stock levels for multiple sizes and colors",
      result: "زيادة المبيعات بنسبة 95% وتقليل معدل التخلي عن السلة بنسبة 40%",
      resultEn: "95% sales increase and 40% cart abandonment reduction",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-sneakers-1.jpg", "/store-sneakers-2.jpg", "/store-sneakers-3.jpg"],
      gradient: "from-blue-900/40 via-cyan-900/20 to-indigo-900/30",
      accentColor: "#3B82F6",
    },
    {
      id: 4,
      title: "متجر إلكترونيات",
      titleEn: "Electronics Store",
      shortDescription: "متجر إلكترونيات مع مقارنة المنتجات المواصفات التفصيلية",
      shortDescriptionEn: "Electronics store with product comparison and detailed specifications",
      fullDescription: "متجر إلكترونيات متكامل مع نظام مقارنة المنتجات، مواصفات تفصيلية، وضمان المنتجات.",
      fullDescriptionEn: "Complete electronics store with product comparison system, detailed specs, and warranty tracking.",
      category: "electronics",
      technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
      features: [
        "مقارنة المنتجات",
        "مواصفات تفصيلية",
        "تتبع الضمان",
        "دفع آمن",
        "تصميم متجاوب",
        "تحليلات متقدمة",
      ],
      featuresEn: [
        "Product comparison",
        "Detailed specifications",
        "Warranty tracking",
        "Secure checkout",
        "Responsive design",
        "Advanced analytics",
      ],
      goal: "تقديم معلومات شاملة لمساعدة العملاء على اتخاذ قرارات شراء مدروسة",
      goalEn: "Provide comprehensive information to help customers make informed purchase decisions",
      challenges: "إدارة مئات المنتجات مع مواصفات معقدة ومتعددة",
      challengesEn: "Managing hundreds of products with complex, multi-faceted specifications",
      result: "زيادة متوسط قيمة الطلب بنسبة 65% وتحسين رضا العملاء بنسبة 88%",
      resultEn: "65% average order value increase and 88% customer satisfaction improvement",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-electronics-1.jpg", "/store-electronics-2.jpg", "/store-electronics-3.jpg"],
      gradient: "from-cyan-900/40 via-teal-900/20 to-blue-900/30",
      accentColor: "#06B6D4",
    },
    {
      id: 5,
      title: "متجر مستحضرات تجميل",
      titleEn: "Cosmetics Store",
      shortDescription: "متجر تجميل مع اختبار نوع البشرة ونظام نقاط الولاء",
      shortDescriptionEn: "Cosmetics store with skin type quiz and loyalty points system",
      fullDescription: "متجر مستحضرات تجميل متكامل مع اختبار نوع البشرة، نظام نقاط الولاء، وخيارات اشتراك المنتجات.",
      fullDescriptionEn: "Complete cosmetics store with skin type quiz, loyalty points system, and product subscription options.",
      category: "beauty",
      technologies: ["React", "TypeScript", "Stripe", "Supabase"],
      features: [
        "اختبار نوع البشرة",
        "نظام نقاط الولاء",
        "اشتراك المنتجات",
        "معرض الصور",
        "تصميم متجاوب",
        "جاهز لمحركات البحث",
      ],
      featuresEn: [
        "Skin type quiz",
        "Loyalty points",
        "Product subscriptions",
        "Photo gallery",
        "Responsive design",
        "SEO ready",
      ],
      goal: "بناء ولاء العملاء من خلال تجربة تسوق مخصصة و program ولاء",
      goalEn: "Build customer loyalty through personalized shopping experience and loyalty program",
      challenges: "دمج نظام الاختبار مع التوصيات الذكية للمنتجات",
      challengesEn: "Integrating quiz system with intelligent product recommendations",
      result: "زيادة ولاء العملاء بنسبة 78% ونمو الإيرادات المتكررة بنسبة 120%",
      resultEn: "78% customer loyalty increase and 120% recurring revenue growth",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-cosmetics-1.jpg", "/store-cosmetics-2.jpg", "/store-cosmetics-3.jpg"],
      gradient: "from-purple-900/40 via-pink-900/20 to-violet-900/30",
      accentColor: "#A855F7",
    },
    {
      id: 6,
      title: "متجر أثاث منزلي",
      titleEn: "Furniture Store",
      shortDescription: "متجر أثاث مع مخطط غرف وتتبع مواعيد التوصيل",
      shortDescriptionEn: "Furniture store with room planner and delivery scheduling",
      fullDescription: "متجر أثاث منزلي متكامل مع مخطط غرف تفاعلي، جدولة التوصيل، وخدمات التركيب.",
      fullDescriptionEn: "Complete furniture store with interactive room planner, delivery scheduling, and assembly services.",
      category: "furniture",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
      features: [
        "مخطط الغرف التفاعلي",
        "جدولة التوصيل",
        "خدمات التركيب",
        "عرض المنتجات ثلاثي الأبعاد",
        "دفع آمن",
        "تصميم متجاوب",
      ],
      featuresEn: [
        "Interactive room planner",
        "Delivery scheduling",
        "Assembly services",
        "3D product views",
        "Secure checkout",
        "Responsive design",
      ],
      goal: "تسهيل عملية اختيار الأثاث وتقديم تجربة تخطيط مرئية",
      goalEn: "Simplify furniture selection and provide visual planning experience",
      challenges: "إدارة خيارات التخصيص المتعددة وحسابات الشحن المعقدة",
      challengesEn: "Managing multiple customization options and complex shipping calculations",
      result: "زيادة مبيعات التخزين بنسبة 110% وتحسين رضا العملاء بنسبة 92%",
      resultEn: "110% upsell increase and 92% customer satisfaction improvement",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-furniture-1.jpg", "/store-furniture-2.jpg", "/store-furniture-3.jpg"],
      gradient: "from-orange-900/40 via-amber-900/20 to-yellow-900/30",
      accentColor: "#F97316",
    },
    {
      id: 7,
      title: "متجر مجوهرات",
      titleEn: "Jewelry Store",
      shortDescription: "متجر مجوهرات فاخرة مع شهادات أصالة وتغليف هدايا",
      shortDescriptionEn: "Luxury jewelry store with authenticity certificates and gift wrapping",
      fullDescription: "متجر مجوهرات فاخرة مع شهادات الأصالة، خدمات التغليف الفاخر، وخيارات التخصيص.",
      fullDescriptionEn: "Luxury jewelry store with authenticity certificates, premium gift wrapping, and customization options.",
      category: "accessories",
      technologies: ["React", "TypeScript", "Stripe", "PostgreSQL"],
      features: [
        "شهادات الأصالة",
        "تغليف الهدايا الفاخر",
        "خيارات التخصيص",
        "عرض ثلاثي الأبعاد",
        "دفع آمن",
        "تصميم فاخر",
      ],
      featuresEn: [
        "Authenticity certificates",
        "Premium gift wrapping",
        "Customization options",
        "3D display",
        "Secure checkout",
        "Luxury design",
      ],
      goal: "تقديم تجربة تسوق فاخرة تليق بقيمة المنتجات",
      goalEn: "Deliver a luxury shopping experience matching product value",
      challenges: "عرض المنتجات الفاخرة بطريقة تعكس جودتها وقيمتها",
      challengesEn: "Displaying luxury products in a way that reflects their quality and value",
      result: "زيادة متوسط قيمة الطلب بنسبة 85% وبناء قاعدة عملاء مخلصين",
      resultEn: "85% average order value increase and building a loyal customer base",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-jewelry-1.jpg", "/store-jewelry-2.jpg", "/store-jewelry-3.jpg"],
      gradient: "from-yellow-900/40 via-amber-900/20 to-orange-900/30",
      accentColor: "#EAB308",
    },
    {
      id: 8,
      title: "متجر طعام ومشروبات",
      titleEn: "Food & Beverages",
      shortDescription: "متجر طعام مع ضمان النظافة واقتراحات الوصفات",
      shortDescriptionEn: "Food store with freshness guarantee and recipe suggestions",
      fullDescription: "متجر طعام ومشروبات متكامل مع ضمان النظافة، اقتراحات الوصفات، والطلب بالجملة.",
      fullDescriptionEn: "Complete food and beverages store with freshness guarantee, recipe suggestions, and bulk ordering.",
      category: "food",
      technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
      features: [
        "ضمان النظافة",
        "اقتراحات الوصفات",
        "طلب بالجملة",
        "تتبع التوصيل",
        "دفع آمن",
        "تصميم متجاوب",
      ],
      featuresEn: [
        "Freshness guarantee",
        "Recipe suggestions",
        "Bulk ordering",
        "Delivery tracking",
        "Secure checkout",
        "Responsive design",
      ],
      goal: "تقديم تجربة تسوق طعام سريعة وموثوقة مع ضمان الجودة",
      goalEn: "Deliver fast and reliable food shopping experience with quality guarantee",
      challenges: "إدارة تواريخ انتهاء الصلاحية وحسابات الشحن للمتطلبات الفريدة",
      challengesEn: "Managing expiry dates and shipping calculations for unique requirements",
      result: "نمو الطلبات بنسبة 130% وزيادة معدل إعادة الطلب بنسبة 75%",
      resultEn: "130% order growth and 75% reorder rate increase",
      liveUrl: "#demo",
      githubUrl: "",
      images: ["/store-food-1.jpg", "/store-food-2.jpg", "/store-food-3.jpg"],
      gradient: "from-green-900/40 via-emerald-900/20 to-teal-900/30",
      accentColor: "#22C55E",
    },
  ],
  experience: [
    {
      year: "2024",
      yearEn: "2024",
      title: "إطلاق المنصة",
      titleEn: "Platform Launch",
      company: "StoreCraft",
      companyEn: "StoreCraft",
      description: "إطلاق منصة StoreCraft للسوق الجزائري",
      descriptionEn: "Launched StoreCraft platform for the Algerian market",
    },
    {
      year: "2023",
      yearEn: "2023",
      title: "تطوير النظام الأساسي",
      titleEn: "Core System Development",
      company: "StoreCraft",
      companyEn: "StoreCraft",
      description: "بناء لوحة التحكم وإدارة المنتجات والطلبات",
      descriptionEn: "Built dashboard, product and order management",
    },
    {
      year: "2022",
      yearEn: "2022",
      title: "بداية المشروع",
      titleEn: "Project Inception",
      company: "StoreCraft",
      companyEn: "StoreCraft",
      description: "دراسة السوق الجزائري وتحديد الاحتياجات",
      descriptionEn: "Market research and needs assessment for Algeria",
    },
  ],
  testimonials: [],
  certificates: [],
  navLinks: [
    { href: "#home", label: "الرئيسية", labelEn: "Home" },
    { href: "#pricing", label: "الأسعار", labelEn: "Pricing" },
    { href: "#demo", label: "العرض", labelEn: "Demo" },
    { href: "#portfolio", label: "أعمالنا", labelEn: "Projects" },
    { href: "#services", label: "الخدمات", labelEn: "Services" },
    { href: "#contact", label: "تواصل", labelEn: "Contact" },
  ],
  settings: {
    seo: {
      title: "StoreCraft DZ - منصة التجارة الإلكترونية في الجزائر",
      description: "من الفكرة إلى متجرك الإلكتروني... اشترِ مرة واحدة وبِع بلا حدود. منصة متكاملة للتجارة الإلكترونية في الجزائر مع لوحة تحكم متقدمة.",
      keywords: ["e-commerce", "ecommerce", "Algeria", "online store", "storecraft", "storecraftdz", "تجارة إلكترونية", "متجر إلكتروني", "الجزائر", "ستور كرافت"],
    },
    theme: {
      primary: "#6E7DFF",
      secondary: "#1E293B",
      accent: "#22C55E",
    },
    locale: "ar",
    ui: {
      backgroundGradient: "night",
      backgroundGradientAlt: "midnight",
      borderRadius: 16,
      spacingDensity: "comfortable",
      uiFont: "Plus Jakarta Sans",
      siteFont: "Plus Jakarta Sans",
      animationsEnabled: true,
      shadowIntensity: 50,
      navbarBorderColor: "",
      navbarGlowColor: "",
      navbarGlowIntensity: 100,
    },
    featuredCategory: "all",
    loader: {
      textAr: "أنا مطور ويب",
      textEn: "I am Web Developer",
      subtitleAr: "جارٍ تحميل البرتفوليو...",
      subtitleEn: "Loading portfolio...",
      duration: 1400,
      typingSpeed: 80,
    },
  },
};
