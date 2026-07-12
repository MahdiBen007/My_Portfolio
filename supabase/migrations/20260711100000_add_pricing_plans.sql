CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_ar TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  price_ar TEXT NOT NULL DEFAULT '0',
  price_en TEXT NOT NULL DEFAULT '0',
  currency_ar TEXT NOT NULL DEFAULT 'دج',
  currency_en TEXT NOT NULL DEFAULT 'DZD',
  desc_ar TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Rocket',
  badge_ar TEXT,
  badge_en TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  features_ar TEXT[] NOT NULL DEFAULT '{}',
  features_en TEXT[] NOT NULL DEFAULT '{}',
  cta_ar TEXT NOT NULL DEFAULT '',
  cta_en TEXT NOT NULL DEFAULT '',
  cta_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active pricing plans"
  ON pricing_plans FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage pricing plans"
  ON pricing_plans FOR ALL
  USING (auth.role() = 'authenticated');

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO pricing_plans (name_ar, name_en, price_ar, price_en, desc_ar, desc_en, icon, badge_ar, badge_en, featured, features_ar, features_en, cta_ar, cta_en, sort_order) VALUES
('ستارتر', 'Starter', '12,000', '12,000', 'مثالي للشركات الصغيرة التي تطلق متجرها الأول على الإنترنت.', 'Perfect for small businesses launching their first online store.', 'Rocket', NULL, NULL, false,
 ARRAY['لوحة تحكم إدارية كاملة','منتجات غير محدودة','قالب متجر احترافي جاهز','تخصيص الشعار والألوان','تصميم متجاوب مع جميع الأجهزة','استضافة قياسية','أداء موقع سريع','دعم فني مجاني لمدة 7 أيام'],
 ARRAY['Complete Admin Dashboard','Unlimited Products','Professional Ready-made Store Template','Logo & Color Customization','Responsive Design','Standard Hosting','Fast Website Performance','Free Technical Support for 7 Days'],
 'ابدأ الآن', 'Start Now', 1),

('بيزنس', 'Business', '20,000', '20,000', 'مثالي للشركات التي تريد حضورًا إلكترونيًا فريدًا.', 'Perfect for businesses that want a unique online presence.', 'Sparkles', 'الأكثر طلباً', 'MOST POPULAR', true,
 ARRAY['كل مميزات ستارتر','تصميم متجر مخصص بالكامل','تخصيص واجهة المستخدم بشكل احترافي','استضافة عالية الأداء','سرعة تحميل أسرع','تكامل مع فيسبوك بيكسل','تحسين أساسي لمحركات البحث','دعم فني مجاني لمدة 14 يوم'],
 ARRAY['Everything in Starter','Fully Customized Store Design','Premium UI Customization','High Performance Hosting','Faster Loading Speed','Facebook Pixel Integration','Basic SEO Optimization','Free Technical Support for 14 Days'],
 'اختر بيزنس', 'Choose Business', 2),

('بريميوم', 'Premium', '30,000', '30,000', 'مصمم للعلامات التجارية التي تريد أعلى مستوى من الجودة والأداء.', 'Designed for brands that want the highest level of quality and performance.', 'Crown', NULL, NULL, false,
 ARRAY['كل مميزات بيزنس','تصميم متجر حصري مبني من الصفر','استضافة بريميوم عالية السرعة','أداء موقع بأقصى مستوى','تكامل مع Google Analytics','إعداد النطاق والشهادة SSL','مساعدة في إطلاق المتجر','دعم فني مجاني لمدة 30 يوم'],
 ARRAY['Everything in Business','Exclusive Store Design Built From Scratch','Premium High-Speed Hosting','Maximum Website Performance','Google Analytics Integration','Domain & SSL Configuration','Launch Assistance','Free Technical Support for 30 Days'],
 'أطلق متجرك', 'Launch My Store', 3);
