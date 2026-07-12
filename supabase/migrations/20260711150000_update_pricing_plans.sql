-- Update pricing plans with new content
-- Deletes old plans and inserts new ones

DELETE FROM pricing_plans;

INSERT INTO pricing_plans (name_ar, name_en, price_ar, price_en, currency_ar, currency_en, desc_ar, desc_en, icon, badge_ar, badge_en, featured, features_ar, features_en, cta_ar, cta_en, sort_order) VALUES

-- Starter Plan
('ستارتر', 'Starter', '18,500', '18,500', 'دج', 'DA',
 'ابدأ تجارتك الإلكترونية بثقة.', 'Start your e-commerce business with confidence.',
 'Rocket', NULL, NULL, false,
 ARRAY[
   'لوحة تحكم احترافية كاملة',
   'منتجات غير محدودة',
   'طلبات غير محدودة',
   'إدارة العملاء والفئات',
   'كوبونات الخصم',
   'تصميم متجر احترافي جاهز',
   'تخصيص الشعار والألوان',
   'متوافق مع جميع الأجهزة',
   'ربط الدومين',
   'تكامل مع Meta Pixel',
   'تكامل مع TikTok Pixel',
   'تكامل مع Google Analytics',
   'حماية أساسية ضد الرسائل والطلبات الوهمية',
   'تدريب على استخدام لوحة التحكم عند التسليم'
 ],
 ARRAY[
   'Complete Professional Dashboard',
   'Unlimited Products',
   'Unlimited Orders',
   'Customer & Category Management',
   'Discount Coupons',
   'Professional Ready-made Store Design',
   'Logo & Color Customization',
   'Responsive on All Devices',
   'Domain Connection',
   'Meta Pixel Integration',
   'TikTok Pixel Integration',
   'Google Analytics Integration',
   'Basic Protection Against Fake Messages & Orders',
   'Dashboard Training on Delivery'
 ],
 'ابدأ الآن', 'Start Now', 1),

-- Business Plan
('بيزنس', 'Business', '24,500', '24,500', 'دج', 'DA',
 'طوّر نشاطك إلى متجر إلكتروني احترافي يعكس هوية مشروعك.', 'Grow your business with a professional store that reflects your brand identity.',
 'Sparkles', 'الأكثر اختيارًا', 'MOST POPULAR', true,
 ARRAY[
   'كل مميزات ستارتر',
   'تخصيص لوحة التحكم بما يتناسب مع نشاطك التجاري',
   'تصميم واجهات مخصصة لهوية مشروعك',
   'صفحات احترافية لزيادة الثقة وتحسين معدل التحويل',
   'استضافة أسرع وأداء أعلى',
   'تحسين سرعة الموقع',
   'تحسين SEO الأساسي',
   'حماية متقدمة ضد الطلبات الوهمية والهجمات الآلية',
   'أولوية في تنفيذ التعديلات',
   'دعم فني مجاني لمدة 14 يومًا'
 ],
 ARRAY[
   'Everything in Starter',
   'Dashboard Customization for Your Business',
   'Custom Interface Design for Your Brand',
   'Professional Pages to Increase Trust & Conversion',
   'Faster Hosting & Higher Performance',
   'Website Speed Optimization',
   'Basic SEO Optimization',
   'Advanced Protection Against Fake Orders & Bot Attacks',
   'Priority in Implementing Modifications',
   'Free Technical Support for 14 Days'
 ],
 'اختر بيزنس', 'Choose Business', 2),

-- Premium Plan
('بريميوم', 'Premium', '30,000', '30,000', 'دج', 'DA',
 'صُمم خصيصًا للعلامات التجارية التي تريد متجرًا يعكس هوية البراند بالكامل.', 'Designed for brands that want a store fully reflecting their brand identity.',
 'Crown', NULL, NULL, false,
 ARRAY[
   'كل مميزات بيزنس',
   'بناء متجر إلكتروني مخصص بالكامل من الصفر',
   'تصميم لوحة تحكم مخصصة بالكامل حسب احتياجات البراند',
   'تصميم UI/UX حصري يعكس هوية العلامة التجارية',
   'بناء هوية بصرية متكاملة داخل جميع صفحات المتجر',
   'صفحات مخصصة حسب احتياجات المشروع',
   'أعلى مستوى من السرعة والأداء',
   'تحسين SEO متقدم',
   'تعزيز أمني متقدم وحماية إضافية',
   'أولوية قصوى في تنفيذ المشروع',
   'دعم فني مجاني لمدة 30 يومًا'
 ],
 ARRAY[
   'Everything in Business',
   'Fully Custom E-commerce Store Built From Scratch',
   'Custom Dashboard Design Based on Brand Needs',
   'Exclusive UI/UX Design Reflecting Brand Identity',
   'Integrated Visual Identity Across All Store Pages',
   'Custom Pages Based on Project Requirements',
   'Highest Level of Speed & Performance',
   'Advanced SEO Optimization',
   'Advanced Security Enhancement & Additional Protection',
   'Top Priority in Project Implementation',
   'Free Technical Support for 30 Days'
 ],
 'أطلق متجرك', 'Launch My Store', 3);
