INSERT INTO pricing_plans (name_ar, name_en, price_ar, price_en, currency_ar, currency_en, desc_ar, desc_en, icon, badge_ar, badge_en, featured, features_ar, features_en, cta_ar, cta_en, cta_link, sort_order, visible) VALUES

('ستارتر', 'Starter', '12,000', '12,000', 'دج', 'DZD',
 'مثالي للشركات الصغيرة التي تطلق متجرها الأول على الإنترنت.',
 'Perfect for small businesses launching their first online store.',
 'Rocket', NULL, NULL, false,
 ARRAY['لوحة تحكم إدارية كاملة','منتجات غير محدودة','قالب متجر احترافي جاهز','تخصيص الشعار والألوان','تصميم متجاوب مع جميع الأجهزة','استضافة قياسية','سرعة تحميل سريعة','دعم فني مجاني لمدة 7 أيام'],
 ARRAY['Complete Admin Dashboard','Unlimited Products','Professional Ready-made Store Template','Logo & Color Customization','Responsive Design','Standard Hosting','Fast Loading Speed','Free Technical Support for 7 Days'],
 'ابدأ الآن', 'Start Now', NULL, 1, true),

('بيزنس', 'Business', '20,000', '20,000', 'دج', 'DZD',
 'مثالي للشركات التي تريد حضورًا إلكترونيًا فريدًا.',
 'Perfect for businesses that want a unique online presence.',
 'Sparkles', 'الأكثر طلباً', 'MOST POPULAR', true,
 ARRAY['كل مميزات ستارتر','تصميم متجر مخصص بالكامل','تخصيص واجهة المستخدم بشكل احترافي','استضافة عالية الأداء','سرعة تحميل أسرع','تكامل مع فيسبوك بيكسل','تحسين أساسي لمحركات البحث','دعم فني مجاني لمدة 14 يوم'],
 ARRAY['Everything in Starter','Fully Customized Store Design','Premium UI Customization','High Performance Hosting','Faster Loading Speed','Facebook Pixel Integration','Basic SEO Optimization','Free Technical Support for 14 Days'],
 'اختر بيزنس', 'Choose Business', NULL, 2, true),

('بريميوم', 'Premium', '30,000', '30,000', 'دج', 'DZD',
 'مصمم للعلامات التجارية التي تريد أعلى مستوى من الجودة والأداء.',
 'Designed for brands that want the highest level of quality and performance.',
 'Crown', NULL, NULL, false,
 ARRAY['كل مميزات بيزنس','تصميم متجر حصري مبني من الصفر','استضافة بريميوم عالية السرعة','أداء موقع بأقصى مستوى','تكامل مع Google Analytics','إعداد النطاق والشهادة SSL','مساعدة في إطلاق المتجر','دعم فني مجاني لمدة 30 يوم'],
 ARRAY['Everything in Business','Exclusive Store Design Built From Scratch','Premium High-Speed Hosting','Maximum Website Performance','Google Analytics Integration','Domain & SSL Configuration','Launch Assistance','Free Technical Support for 30 Days'],
 'أطلق متجرك', 'Launch My Store', NULL, 3, true);
