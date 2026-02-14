-- لقطات الشاشة: جدول + سياسات التخزين
-- 1) من لوحة Supabase: Storage → New bucket → الاسم: screenshots → Private → Create
-- 2) ثم نفّذ هذا الملف من SQL Editor

-- جدول سجل اللقطات
CREATE TABLE IF NOT EXISTS screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  is_virtual BOOLEAN DEFAULT FALSE,
  time_display TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_created_at ON screenshots(created_at DESC);

ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "screenshots_own" ON screenshots;
CREATE POLICY "screenshots_own" ON screenshots FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- سياسات التخزين: الموظف يرفع إلى مجلده فقط، والأدمن يقرأ كل المجلدات
-- (أنشئ الـ bucket من Dashboard: Storage → New bucket → اسم: screenshots → Private)
DROP POLICY IF EXISTS "screenshots_upload_own" ON storage.objects;
CREATE POLICY "screenshots_upload_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "screenshots_read_own_or_admin" ON storage.objects;
CREATE POLICY "screenshots_read_own_or_admin" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'screenshots' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin() = true
    )
  );

-- سياسة إضافية: الأدمن يقرأ أي لقطة في bucket screenshots (لتجنب مشاكل التقييم)
DROP POLICY IF EXISTS "screenshots_admin_read_any" ON storage.objects;
CREATE POLICY "screenshots_admin_read_any" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'screenshots' AND public.is_admin() = true);
