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
    featured?: boolean;
    status?: string;
    order?: number;
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
  };
};

export const defaultPortfolioData: PortfolioData = {
  personalData: {
    name: "مهدي بن صالح",
    nameEn: "Mahdi Bensalah",
    title: "مطور ويب متكامل",
    titleEn: "Full Stack Web Developer",
    location: "القاهرة، مصر",
    locationEn: "Cairo, Egypt",
    email: "contact@ahmeddev.com",
    phone: "+20 123 456 7890",
    github: "https://github.com/ahmeddev",
    linkedin: "https://linkedin.com/in/ahmeddev",
    whatsapp: "https://wa.me/201234567890",
    cvLink: "/cv.pdf",
    profileImageUrl: "/hero-portrait.png",

    heroHeadline: "أحوّل الأفكار إلى تجارب ويب سريعة وأنيقة وقابلة للتطوير",
    heroHeadlineEn: "I transform ideas into fast, elegant, and scalable web experiences",

    heroDescription: "مطور ويب متخصص في بناء تطبيقات حديثة وعالية الأداء. أجمع بين التصميم الإبداعي والكود النظيف لإنشاء حلول رقمية استثنائية.",
    heroDescriptionEn: "A web developer specialized in building modern, high-performance applications. I combine creative design with clean code to create exceptional digital solutions.",

    aboutBio: "مرحبًا! أنا مطور ويب شغوف بأكثر من 5 سنوات من الخبرة في بناء تطبيقات ويب حديثة. أؤمن بأن التكنولوجيا يجب أن تكون بسيطة وفعّالة. أسعى دائمًا لتعلم التقنيات الجديدة وتطبيقها في مشاريع حقيقية تحدث فرقًا.",
    aboutBioEn: "Hello! I'm a passionate web developer with over 5 years of experience in building modern web applications. I believe technology should be simple and effective. I constantly strive to learn new technologies and apply them in real projects that make a difference.",

    stats: {
      yearsExperience: 5,
      projectsCompleted: 50,
      happyClients: 30,
    },
  },
  services: [
    {
      icon: "Code",
      title: "تطوير الواجهات الأمامية",
      titleEn: "Frontend Development",
      description: "بناء واجهات مستخدم تفاعلية وسريعة الاستجابة باستخدام React و Vue.js",
      descriptionEn: "Building interactive and responsive user interfaces using React and Vue.js",
    },
    {
      icon: "Server",
      title: "تطوير الخوادم",
      titleEn: "Backend Development",
      description: "إنشاء APIs قوية وآمنة مع Node.js و Express",
      descriptionEn: "Creating powerful and secure APIs with Node.js and Express",
    },
    {
      icon: "Database",
      title: "إدارة قواعد البيانات",
      titleEn: "Database Management",
      description: "تصميم وإدارة قواعد بيانات فعّالة مع MySQL و MongoDB",
      descriptionEn: "Designing and managing efficient databases with MySQL and MongoDB",
    },
    {
      icon: "Palette",
      title: "تصميم UI/UX",
      titleEn: "UI/UX Design",
      description: "تصميم تجارب مستخدم بديهية وجذابة بصريًا",
      descriptionEn: "Designing intuitive and visually appealing user experiences",
    },
  ],
  skills: [
    { name: "HTML5", nameEn: "HTML5", icon: "html", category: "frontend" },
    { name: "CSS3", nameEn: "CSS3", icon: "css", category: "frontend" },
    { name: "Tailwind CSS", nameEn: "Tailwind CSS", icon: "tailwind", category: "frontend" },
    { name: "جافاسكربت", nameEn: "JavaScript", icon: "javascript", category: "frontend" },
    { name: "تايب سكربت", nameEn: "TypeScript", icon: "typescript", category: "frontend" },
    { name: "ريأكت", nameEn: "React", icon: "react", category: "frontend" },
    { name: "فيو", nameEn: "Vue.js", icon: "vue", category: "frontend" },
    { name: "نود جي اس", nameEn: "Node.js", icon: "nodejs", category: "backend" },
    { name: "إكسبريس", nameEn: "Express.js", icon: "express", category: "backend" },
    { name: "PHP", nameEn: "PHP", icon: "php", category: "backend" },
    { name: "ماي إس كيو إل", nameEn: "MySQL", icon: "mysql", category: "database" },
    { name: "مونجو دي بي", nameEn: "MongoDB", icon: "mongodb", category: "database" },
    { name: "بوستجري إس كيو إل", nameEn: "PostgreSQL", icon: "postgresql", category: "database" },
    { name: "جِت", nameEn: "Git", icon: "git", category: "tools" },
    { name: "جِت هب", nameEn: "GitHub", icon: "github", category: "tools" },
    { name: "دوكر", nameEn: "Docker", icon: "docker", category: "tools" },
    { name: "ووردبريس", nameEn: "WordPress", icon: "wordpress", category: "tools" },
  ],
  skillCategories: [
    { id: "all", label: "الكل", labelEn: "All" },
    { id: "frontend", label: "الواجهة الأمامية", labelEn: "Frontend" },
    { id: "backend", label: "الخادم", labelEn: "Backend" },
    { id: "database", label: "قواعد البيانات", labelEn: "Database" },
    { id: "tools", label: "الأدوات", labelEn: "Tools" },
  ],
  projectCategories: [
    { id: "all", label: "الكل", labelEn: "All" },
    { id: "ecommerce", label: "متاجر إلكترونية", labelEn: "E-commerce" },
    { id: "dashboard", label: "لوحات تحكم", labelEn: "Dashboard" },
    { id: "landing", label: "صفحات هبوط", labelEn: "Landing Page" },
    { id: "api", label: "واجهات API", labelEn: "API" },
    { id: "ui", label: "تصميم واجهات", labelEn: "UI Design" },
  ],
  projects: [
    {
      id: 1,
      title: "متجر إلكتروني متكامل",
      titleEn: "Complete E-commerce Store",
      shortDescription: "منصة تجارة إلكترونية حديثة مع نظام دفع متكامل",
      shortDescriptionEn: "Modern e-commerce platform with integrated payment system",
      fullDescription: "منصة تجارة إلكترونية شاملة تتضمن سلة تسوق ذكية، نظام دفع آمن، وإدارة مخزون متقدمة.",
      fullDescriptionEn: "Comprehensive e-commerce platform featuring smart shopping cart, secure payment system, and advanced inventory management.",
      category: "ecommerce",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      features: [
        "نظام سلة تسوق ذكي",
        "دفع آمن عبر Stripe",
        "لوحة تحكم للمدير",
        "إشعارات بريدية",
        "تصميم متجاوب",
      ],
      featuresEn: [
        "Smart shopping cart system",
        "Secure Stripe payments",
        "Admin dashboard",
        "Email notifications",
        "Responsive design",
      ],
      goal: "إنشاء منصة تسوق سهلة الاستخدام تزيد من معدل التحويل",
      goalEn: "Create a user-friendly shopping platform that increases conversion rates",
      challenges: "التعامل مع الدفع الآمن وإدارة المخزون في الوقت الفعلي",
      challengesEn: "Handling secure payments and real-time inventory management",
      result: "زيادة المبيعات بنسبة 150% وتحسين تجربة المستخدم",
      resultEn: "150% increase in sales and improved user experience",
      liveUrl: "https://example-store.com",
      githubUrl: "https://github.com/example/store",
      images: ["/project1-1.jpg", "/project1-2.jpg"],
    },
    {
      id: 2,
      title: "لوحة تحكم تحليلية",
      titleEn: "Analytics Dashboard",
      shortDescription: "لوحة تحكم لتحليل البيانات مع رسوم بيانية تفاعلية",
      shortDescriptionEn: "Data analytics dashboard with interactive charts",
      fullDescription: "لوحة تحكم متقدمة لتحليل البيانات وعرضها بطريقة مرئية جذابة مع تقارير قابلة للتصدير.",
      fullDescriptionEn: "Advanced dashboard for data analysis with visually appealing displays and exportable reports.",
      category: "dashboard",
      technologies: ["React", "TypeScript", "D3.js", "Tailwind CSS"],
      features: [
        "رسوم بيانية تفاعلية",
        "تقارير قابلة للتصدير",
        "فلاتر متقدمة",
        "تحديث في الوقت الفعلي",
        "وضع داكن وفاتح",
      ],
      featuresEn: [
        "Interactive charts",
        "Exportable reports",
        "Advanced filters",
        "Real-time updates",
        "Dark and light mode",
      ],
      goal: "تبسيط عملية تحليل البيانات للشركات",
      goalEn: "Simplify data analysis for businesses",
      challenges: "عرض كميات كبيرة من البيانات بشكل سلس",
      challengesEn: "Displaying large amounts of data smoothly",
      result: "توفير 40% من وقت إعداد التقارير",
      resultEn: "40% time savings in report preparation",
      liveUrl: "https://example-dashboard.com",
      githubUrl: "https://github.com/example/dashboard",
      images: ["/project2-1.jpg", "/project2-2.jpg"],
    },
    {
      id: 3,
      title: "تطبيق إدارة المهام",
      titleEn: "Task Management App",
      shortDescription: "تطبيق لإدارة المهام والمشاريع مع ميزات تعاونية",
      shortDescriptionEn: "Task and project management app with collaborative features",
      fullDescription: "تطبيق شامل لإدارة المهام يتيح للفرق التعاون بفعالية مع تتبع التقدم والإشعارات.",
      fullDescriptionEn: "Comprehensive task management app enabling teams to collaborate effectively with progress tracking and notifications.",
      category: "dashboard",
      technologies: ["Vue.js", "Express.js", "MySQL", "WebSocket"],
      features: [
        "لوحات Kanban",
        "تعاون في الوقت الفعلي",
        "تتبع الوقت",
        "إشعارات ذكية",
        "تكامل مع التقويم",
      ],
      featuresEn: [
        "Kanban boards",
        "Real-time collaboration",
        "Time tracking",
        "Smart notifications",
        "Calendar integration",
      ],
      goal: "تحسين إنتاجية الفرق الصغيرة والمتوسطة",
      goalEn: "Improve productivity for small and medium teams",
      challenges: "تزامن البيانات في الوقت الفعلي بين المستخدمين",
      challengesEn: "Real-time data synchronization between users",
      result: "تحسين إنتاجية الفرق بنسبة 35%",
      resultEn: "35% improvement in team productivity",
      liveUrl: "https://example-tasks.com",
      githubUrl: "https://github.com/example/tasks",
      images: ["/project3-1.jpg", "/project3-2.jpg"],
    },
    {
      id: 4,
      title: "صفحة هبوط لشركة ناشئة",
      titleEn: "Startup Landing Page",
      shortDescription: "صفحة هبوط احترافية مع تحسين SEO ورسوم متحركة",
      shortDescriptionEn: "Professional landing page with SEO optimization and animations",
      fullDescription: "صفحة هبوط حديثة ومُحسّنة لمحركات البحث مع رسوم متحركة سلسة ومعدل تحويل عالي.",
      fullDescriptionEn: "Modern, SEO-optimized landing page with smooth animations and high conversion rate.",
      category: "landing",
      technologies: ["React", "Framer Motion", "Tailwind CSS", "Next.js"],
      features: [
        "رسوم متحركة سلسة",
        "تحسين SEO كامل",
        "تصميم متجاوب",
        "أداء عالي",
        "نماذج تفاعلية",
      ],
      featuresEn: [
        "Smooth animations",
        "Full SEO optimization",
        "Responsive design",
        "High performance",
        "Interactive forms",
      ],
      goal: "إنشاء انطباع أول قوي وزيادة التحويلات",
      goalEn: "Create a strong first impression and increase conversions",
      challenges: "تحقيق التوازن بين الجماليات والأداء",
      challengesEn: "Balancing aesthetics with performance",
      result: "معدل تحويل 12% وسرعة تحميل أقل من 2 ثانية",
      resultEn: "12% conversion rate and loading speed under 2 seconds",
      liveUrl: "https://example-startup.com",
      githubUrl: "https://github.com/example/startup",
      images: ["/project4-1.jpg", "/project4-2.jpg"],
    },
    {
      id: 5,
      title: "واجهة API للمطاعم",
      titleEn: "Restaurant API",
      shortDescription: "API متكاملة لإدارة الطلبات والقوائم والحجوزات",
      shortDescriptionEn: "Complete API for managing orders, menus, and reservations",
      fullDescription: "واجهة برمجية RESTful شاملة لإدارة عمليات المطاعم مع توثيق كامل.",
      fullDescriptionEn: "Comprehensive RESTful API for restaurant operations with full documentation.",
      category: "api",
      technologies: ["Node.js", "Express", "PostgreSQL", "Redis"],
      features: [
        "توثيق Swagger كامل",
        "تحقق JWT",
        "تخزين مؤقت Redis",
        "Rate Limiting",
        "Webhooks",
      ],
      featuresEn: [
        "Complete Swagger docs",
        "JWT authentication",
        "Redis caching",
        "Rate Limiting",
        "Webhooks",
      ],
      goal: "توفير بنية تحتية قوية للتطبيقات المحمولة",
      goalEn: "Provide robust infrastructure for mobile applications",
      challenges: "التعامل مع آلاف الطلبات المتزامنة",
      challengesEn: "Handling thousands of concurrent requests",
      result: "دعم أكثر من 10,000 طلب في الدقيقة",
      resultEn: "Support for over 10,000 requests per minute",
      liveUrl: "https://api.example-restaurant.com/docs",
      githubUrl: "https://github.com/example/restaurant-api",
      images: ["/project5-1.jpg", "/project5-2.jpg"],
    },
    {
      id: 6,
      title: "تصميم واجهة تطبيق بنكي",
      titleEn: "Banking App UI Design",
      shortDescription: "تصميم واجهة مستخدم حديثة لتطبيق بنكي مع Dark Mode",
      shortDescriptionEn: "Modern UI design for banking app with Dark Mode",
      fullDescription: "تصميم واجهة مستخدم شاملة لتطبيق بنكي يركز على الأمان وسهولة الاستخدام.",
      fullDescriptionEn: "Comprehensive UI design for banking app focusing on security and ease of use.",
      category: "ui",
      technologies: ["Figma", "React", "Tailwind CSS", "Framer Motion"],
      features: [
        "تصميم نظيف وحديث",
        "Dark Mode كامل",
        "رسوم متحركة دقيقة",
        "تجربة مستخدم بديهية",
        "أيقونات مخصصة",
      ],
      featuresEn: [
        "Clean modern design",
        "Complete Dark Mode",
        "Precise animations",
        "Intuitive UX",
        "Custom icons",
      ],
      goal: "تصميم تجربة بنكية سهلة وموثوقة",
      goalEn: "Design an easy and trustworthy banking experience",
      challenges: "الموازنة بين الأمان وسهولة الاستخدام",
      challengesEn: "Balancing security with ease of use",
      result: "رضا المستخدمين بنسبة 95%",
      resultEn: "95% user satisfaction rate",
      liveUrl: "https://example-bank-ui.com",
      githubUrl: "https://github.com/example/bank-ui",
      images: ["/project6-1.jpg", "/project6-2.jpg"],
    },
  ],
  experience: [
    {
      year: "2023 - الحاضر",
      yearEn: "2023 - Present",
      title: "مطور ويب أول",
      titleEn: "Senior Web Developer",
      company: "شركة التقنية الحديثة",
      companyEn: "Modern Tech Company",
      description: "قيادة فريق تطوير وبناء تطبيقات ويب متقدمة",
      descriptionEn: "Leading development team and building advanced web applications",
    },
    {
      year: "2021 - 2023",
      yearEn: "2021 - 2023",
      title: "مطور Full Stack",
      titleEn: "Full Stack Developer",
      company: "وكالة ديجيتال",
      companyEn: "Digital Agency",
      description: "تطوير حلول ويب شاملة للعملاء",
      descriptionEn: "Developing comprehensive web solutions for clients",
    },
    {
      year: "2019 - 2021",
      yearEn: "2019 - 2021",
      title: "مطور واجهات أمامية",
      titleEn: "Frontend Developer",
      company: "شركة ناشئة",
      companyEn: "Startup Company",
      description: "بناء واجهات مستخدم تفاعلية باستخدام React",
      descriptionEn: "Building interactive user interfaces using React",
    },
  ],
  testimonials: [
    {
      name: "محمد علي",
      nameEn: "Mohammed Ali",
      role: "CEO, TechStart",
      content: "مهدي مطور استثنائي، أنجز مشروعنا بجودة عالية وفي الوقت المحدد. أنصح بالتعامل معه بشدة.",
      contentEn: "Mahdi Bensalah is an exceptional developer who completed our project with high quality on time. Highly recommended.",
      avatar: "/avatar1.jpg",
    },
    {
      name: "سارة أحمد",
      nameEn: "Sara Ahmed",
      role: "Product Manager, DigitalCo",
      content: "العمل مع مهدي كان تجربة رائعة. يفهم المتطلبات بسرعة ويقدم حلولاً إبداعية.",
      contentEn: "Working with Mahdi was a great experience. He understands requirements quickly and provides creative solutions.",
      avatar: "/avatar2.jpg",
    },
    {
      name: "خالد يوسف",
      nameEn: "Khaled Youssef",
      role: "Founder, E-Shop",
      content: "المتجر الإلكتروني الذي بناه مهدي زاد مبيعاتنا بشكل ملحوظ. شكرًا على الاحترافية!",
      contentEn: "The e-commerce store Mahdi built significantly increased our sales. Thanks for the professionalism!",
      avatar: "/avatar3.jpg",
    },
  ],
  certificates: [],
  navLinks: [
    { href: "#home", label: "الرئيسية", labelEn: "Home" },
    { href: "#services", label: "الخدمات", labelEn: "Services" },
    { href: "#skills", label: "المهارات", labelEn: "Skills" },
    { href: "#portfolio", label: "الأعمال", labelEn: "Portfolio" },
    { href: "#about", label: "عني", labelEn: "About" },
    { href: "#contact", label: "تواصل", labelEn: "Contact" },
  ],
  settings: {
    seo: {
      title: "Portfolio",
      description: "Professional portfolio website",
      keywords: ["portfolio", "developer", "full-stack"],
    },
    theme: {
      primary: "#6E7DFF",
      secondary: "#1E293B",
      accent: "#22C55E",
    },
    locale: "ar",
  },
};
