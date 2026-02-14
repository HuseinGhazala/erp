-- سياسات التخزين للقطات الشاشة: تأكد أن الأدمن يقرأ لقطات الموظفين
-- نفّذ من Supabase → SQL Editor (بعد admin-policies.sql و screenshots-schema.sql)
-- إذا لم تظهر اللقطات في «متابعة النشاط» أو «معرض التتبع»، نفّذ هذا الملف

-- 1) تأكد أن bucket "screenshots" موجود: Storage → New bucket → اسم: screenshots → Private

-- 2) السياسات على storage.objects
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

-- سياسة صريحة: الأدمن يقرأ أي ملف في screenshots
DROP POLICY IF EXISTS "screenshots_admin_read_any" ON storage.objects;
CREATE POLICY "screenshots_admin_read_any" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'screenshots' AND public.is_admin() = true);
