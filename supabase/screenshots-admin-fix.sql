-- إصلاح: الأدمن يقرأ لقطات الشاشة لجميع الموظفين
-- نفّذ من Supabase → SQL Editor إذا لم تظهر اللقطات في «متابعة النشاط»
-- تأكد أنك نفذت admin-policies.sql و screenshots-schema.sql مسبقاً

-- سياسة مخصصة: الأدمن يقرأ أي ملف في bucket screenshots
DROP POLICY IF EXISTS "screenshots_admin_read_any" ON storage.objects;
CREATE POLICY "screenshots_admin_read_any" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'screenshots' AND public.is_admin() = true);
