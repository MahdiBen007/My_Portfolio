import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  BarChart3,
  Users,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Search,
  Eye,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SCREENS = [
  {
    id: 'overview',
    titleAr: 'نظرة عامة',
    titleEn: 'Overview',
    icon: LayoutDashboard,
    stats: [
      { labelAr: 'إجمالي المبيعات', labelEn: 'Total Sales', value: '847,250', change: '+24%', icon: TrendingUp, color: 'text-green-400' },
      { labelAr: 'الطلبات النشطة', labelEn: 'Active Orders', value: '1,234', change: '+12%', icon: ShoppingCart, color: 'text-primary' },
      { labelAr: 'العملاء النشطون', labelEn: 'Active Customers', value: '5,892', change: '+8%', icon: Users, color: 'text-secondary' },
      { labelAr: 'المنتجات', labelEn: 'Products', value: '3,456', change: '+15%', icon: Package, color: 'text-orange-400' },
    ],
    chart: [
      { month: 'Jan', value: 40 },
      { month: 'Feb', value: 55 },
      { month: 'Mar', value: 45 },
      { month: 'Apr', value: 70 },
      { month: 'May', value: 60 },
      { month: 'Jun', value: 85 },
      { month: 'Jul', value: 75 },
      { month: 'Aug', value: 95 },
    ],
  },
  {
    id: 'analytics',
    titleAr: 'التحليلات',
    titleEn: 'Analytics',
    icon: BarChart3,
    stats: [
      { labelAr: 'الزوار اليوم', labelEn: 'Today Visitors', value: '12,543', change: '+18%', icon: Eye, color: 'text-cyan-400' },
      { labelAr: 'معدل التحويل', labelEn: 'Conversion Rate', value: '4.8%', change: '+2.1%', icon: Activity, color: 'text-green-400' },
      { labelAr: 'متوسط الطلب', labelEn: 'Avg. Order Value', value: '8,500', change: '+12%', icon: TrendingUp, color: 'text-primary' },
      { labelAr: 'الإيرادات الشهر', labelEn: 'Monthly Revenue', value: '2.4M', change: '+32%', icon: BarChart3, color: 'text-secondary' },
    ],
    chart: [
      { month: 'Jan', value: 30 },
      { month: 'Feb', value: 45 },
      { month: 'Mar', value: 35 },
      { month: 'Apr', value: 60 },
      { month: 'May', value: 50 },
      { month: 'Jun', value: 80 },
      { month: 'Jul', value: 70 },
      { month: 'Aug', value: 90 },
    ],
  },
  {
    id: 'orders',
    titleAr: 'الطلبات',
    titleEn: 'Orders',
    icon: ShoppingCart,
    stats: [
      { labelAr: 'طلبات اليوم', labelEn: "Today's Orders", value: '234', change: '+15%', icon: ShoppingCart, color: 'text-primary' },
      { labelAr: 'قيد التنفيذ', labelEn: 'Processing', value: '89', change: '-5%', icon: Activity, color: 'text-orange-400' },
      { labelAr: 'تم الشحن', labelEn: 'Shipped', value: '145', change: '+22%', icon: Package, color: 'text-green-400' },
      { labelAr: 'الإيرادات', labelEn: 'Revenue', value: '156K', change: '+28%', icon: TrendingUp, color: 'text-secondary' },
    ],
    chart: [
      { month: 'Jan', value: 35 },
      { month: 'Feb', value: 50 },
      { month: 'Mar', value: 40 },
      { month: 'Apr', value: 65 },
      { month: 'May', value: 55 },
      { month: 'Jun', value: 78 },
      { month: 'Jul', value: 68 },
      { month: 'Aug', value: 88 },
    ],
  },
];

const FEATURES = [
  { icon: LayoutDashboard, titleAr: 'لوحة تحكم ذكية', titleEn: 'Smart Dashboard', descAr: 'تحكم كامل في متجرك من مكان واحد', descEn: 'Full control of your store from one place' },
  { icon: BarChart3, titleAr: 'تحليلات متقدمة', titleEn: 'Advanced Analytics', descAr: 'تتبع أداء متجرك في الوقت الفعلي', descEn: 'Track your store performance in real-time' },
  { icon: ShoppingCart, titleAr: 'إدارة الطلبات', titleEn: 'Order Management', descAr: 'إدارة سريعة وفعالة لجميع طلباتك', descEn: 'Quick and efficient management of all orders' },
  { icon: Package, titleAr: 'إدارة المنتجات', titleEn: 'Product Management', descAr: 'إضافة وتعديل المنتجات بسهولة', descEn: 'Add and edit products with ease' },
  { icon: Users, titleAr: 'قاعدة عملاء', titleEn: 'Customer Database', descAr: 'بناء وaintenance قاعدة بيانات عملائك', descEn: 'Build and maintain your customer database' },
  { icon: Settings, titleAr: 'تخصيص كامل', titleEn: 'Full Customization', descAr: 'تخصيص كل شيء حسب احتياجك', descEn: 'Customize everything to your needs' },
];

export const DashboardShowcase = () => {
  const { t, isRTL } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const autoPlayRef = useRef(null);
  const isInViewAutoPlay = useInView(autoPlayRef, { margin: '-100px' });
  const [activeScreen, setActiveScreen] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const featureAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const EASE_OUT = [0.22, 1, 0.36, 1] as const;

  const getFeatureCardWidth = () => {
    if (!featuresScrollRef.current) return 200;
    const card = featuresScrollRef.current.children[0] as HTMLElement;
    if (!card) return 200;
    return card.offsetWidth + 12;
  };

  const scrollFeatures = (dir: number) => {
    const container = featuresScrollRef.current;
    if (!container) return;
    const cardW = getFeatureCardWidth();
    const maxScroll = container.scrollWidth - container.clientWidth;
    const newScroll = Math.max(0, Math.min(container.scrollLeft + dir * cardW, maxScroll));
    container.scrollTo({ left: newScroll, behavior: 'smooth' });
    const newIndex = Math.round(newScroll / cardW);
    setActiveFeature(Math.min(newIndex, FEATURES.length - 1));
    resetFeatureAuto();
  };

  const goToFeature = (index: number) => {
    const container = featuresScrollRef.current;
    if (!container) return;
    const cardW = getFeatureCardWidth();
    const maxScroll = container.scrollWidth - container.clientWidth;
    const newScroll = Math.min(index * cardW, maxScroll);
    container.scrollTo({ left: newScroll, behavior: 'smooth' });
    setActiveFeature(index);
    resetFeatureAuto();
  };

  const resetFeatureAuto = () => {
    if (featureAutoRef.current) clearInterval(featureAutoRef.current);
    featureAutoRef.current = setInterval(() => {
      setActiveFeature((prev) => {
        const next = (prev + 1) % FEATURES.length;
        const container = featuresScrollRef.current;
        if (container) {
          const cardW = container.children[0] ? (container.children[0] as HTMLElement).offsetWidth + 12 : 200;
          const maxScroll = container.scrollWidth - container.clientWidth;
          container.scrollTo({ left: Math.min(next * cardW, maxScroll), behavior: 'smooth' });
        }
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    if (isInViewAutoPlay) {
      resetFeatureAuto();
    } else {
      if (featureAutoRef.current) clearInterval(featureAutoRef.current);
    }
    return () => { if (featureAutoRef.current) clearInterval(featureAutoRef.current); };
  }, [isInViewAutoPlay]);

  useEffect(() => {
    if (!isAutoPlaying || !isInViewAutoPlay) return;
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % SCREENS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isInViewAutoPlay]);

  const handleScreenChange = (index: number) => {
    setActiveScreen(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goNext = () => handleScreenChange((activeScreen + 1) % SCREENS.length);
  const goPrev = () => handleScreenChange((activeScreen - 1 + SCREENS.length) % SCREENS.length);

  const screen = SCREENS[activeScreen];

  return (
    <section id="dashboard" className="relative py-[clamp(48px,8vw,112px)] overflow-hidden" ref={(node) => { (ref as React.MutableRefObject<HTMLElement | null>).current = node; (autoPlayRef as React.MutableRefObject<HTMLElement | null>).current = node; }}>
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="section-header text-center mb-10 sm:mb-16"
        >
          <h2 className="section-title">
            {t('لوحة تحكم متقدمة', 'Advanced Dashboard')}
          </h2>
          <p className="section-subtitle mx-auto max-w-2xl">
            {t(
              'إدارة متجرك بكفاءة مع لوحة تحكم ذكية توفر لك كل ما تحتاجه لتتبع المبيعات والطلبات والعملاء',
              'Manage your store efficiently with a smart dashboard that provides everything you need to track sales, orders, and customers'
            )}
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
          className="relative max-w-5xl mx-auto mb-16"
        >
          {/* Screen Selector Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-8 overflow-x-auto pb-1">
            {SCREENS.map((s, index) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => handleScreenChange(index)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeScreen === index
                      ? 'glass-card border-primary/40 text-primary shadow-lg shadow-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t(s.titleAr, s.titleEn)}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:block">
            <motion.button
              onClick={goPrev}
              className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 glass-card w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </motion.button>
            <motion.button
              onClick={goNext}
              className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 glass-card w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Main Dashboard Card */}
          <div className="relative glass-card rounded-3xl border border-white/10 overflow-hidden">
            {/* Browser Header */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-white/5 text-[10px] sm:text-xs text-muted-foreground">
                  <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>dashboard.storecraft.dz</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreen}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {screen.stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5, ease: EASE_OUT }}
                          className="glass-card rounded-xl p-2.5 sm:p-4 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.color}`} />
                            <span className={`text-[10px] sm:text-xs font-medium ${stat.color}`}>{stat.change}</span>
                          </div>
                          <div className="text-base sm:text-xl lg:text-2xl font-bold gradient-text mb-0.5 sm:mb-1">{stat.value}</div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground">{t(stat.labelAr, stat.labelEn)}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Chart Area */}
                  <div className="glass-card rounded-xl p-3 sm:p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm font-medium">{t('مخطط الأداء', 'Performance Chart')}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{t('آخر 8 أشهر', 'Last 8 months')}</span>
                    </div>
                    <div className="relative h-24 sm:h-40">
                      <svg className="w-full h-full" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line
                            key={i}
                            x1="0"
                            y1={i * 30}
                            x2="400"
                            y2={i * 30}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                          />
                        ))}
                        {/* Area fill */}
                        <motion.path
                          d={`M0 ${120 - screen.chart[0].value * 1.2} ${screen.chart
                            .map((point, i) => `L${(i / (screen.chart.length - 1)) * 400} ${120 - point.value * 1.2}`)
                            .join(' ')} L400 120 L0 120 Z`}
                          fill="url(#areaGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                        {/* Line */}
                        <motion.path
                          d={`M0 ${120 - screen.chart[0].value * 1.2} ${screen.chart
                            .map((point, i) => `L${(i / (screen.chart.length - 1)) * 400} ${120 - point.value * 1.2}`)
                            .join(' ')}`}
                          stroke="url(#lineGradient)"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
                        />
                        {/* Data points */}
                        {screen.chart.map((point, i) => (
                          <motion.circle
                            key={i}
                            cx={(i / (screen.chart.length - 1)) * 400}
                            cy={120 - point.value * 1.2}
                            r="3"
                            fill="hsl(187, 85%, 53%)"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                          />
                        ))}
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(187, 85%, 53%)" />
                            <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Month labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 -mb-5">
                        {screen.chart.map((point, i) => (
                          <span key={i} className="text-[9px] sm:text-[10px] text-muted-foreground">
                            {point.month}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pb-4 sm:pb-5">
              {SCREENS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleScreenChange(index)}
                  className={`rounded-full transition-all ${
                    activeScreen === index
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Floating Stats Cards */}
          <motion.div
            className={`absolute -bottom-4 sm:-bottom-6 ${isRTL ? '-right-2 sm:-right-4' : '-left-2 sm:-left-4'} glass-card rounded-xl p-3 sm:p-4 border border-white/10 z-20 hidden sm:block`}
            animate={{ y: [0, 8, 0], rotate: [0, isRTL ? 2 : -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold">+24%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t('نمو المبيعات', 'Sales Growth')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`absolute -top-4 sm:-top-6 ${isRTL ? '-left-2 sm:-left-4' : '-right-2 sm:-right-4'} glass-card rounded-xl p-3 sm:p-4 border border-white/10 z-20 hidden sm:block`}
            animate={{ y: [0, -8, 0], rotate: [0, isRTL ? -2 : 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold">99.9%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t('وقت التشغيل', 'Uptime')}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT }}
          className="relative mb-12 sm:mb-16 max-w-5xl mx-auto"
        >
          {/* Mobile/Tablet Carousel */}
          <div className="lg:hidden relative">
            {/* Arrows */}
            <motion.button
              onClick={() => scrollFeatures(-1)}
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 glass-card w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRTL ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
            <motion.button
              onClick={() => scrollFeatures(1)}
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 glass-card w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRTL ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>

            <div
              ref={featuresScrollRef}
              className="flex overflow-x-auto gap-3 sm:gap-5 pb-4 snap-x snap-mandatory scrollbar-hide px-1"
            >
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: EASE_OUT }}
                    className="glass-card rounded-2xl p-4 sm:p-6 border border-white/5 hover:border-primary/20 transition-all group snap-start shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-10px)]"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">{t(feature.titleAr, feature.titleEn)}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t(feature.descAr, feature.descEn)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToFeature(index)}
                  className={`rounded-full transition-all ${
                    activeFeature === index
                      ? 'w-5 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: EASE_OUT }}
                  className="glass-card rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all group"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t(feature.titleAr, feature.titleEn)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descAr, feature.descEn)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.6, ease: EASE_OUT }}
          className="text-center"
        >
          <motion.a
            href="#demo"
            className="btn-primary btn-shine inline-flex items-center gap-2 text-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)] px-8 py-3.5"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('ابدأ مع لوحة التحكم', 'Get Started with Dashboard')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
