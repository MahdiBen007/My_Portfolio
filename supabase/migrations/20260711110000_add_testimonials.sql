CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_name_ar TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  company_ar TEXT NOT NULL DEFAULT '',
  review TEXT NOT NULL DEFAULT '',
  review_ar TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  stars INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible testimonials"
  ON testimonials FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated');

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
