-- توسيع جدول الملف الشخصي: صورة ورقم جوال
-- نفّذ من Supabase → SQL Editor
-- أنشئ الـ bucket من Dashboard: Storage → New bucket → اسم: avatars → Private → Create

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- تحديث updated_at عند التعديل
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- سياسات التخزين لصور الملف الشخصي
-- الموظف يرفع صورته فقط داخل مجلده: avatars/{user_id}/...
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
CREATE POLICY "avatars_upload_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- الموظف يقرأ صورته، والأدمن يقرأ كل الصور (لعرض قائمة الموظفين)
DROP POLICY IF EXISTS "avatars_read_own_or_admin" ON storage.objects;
CREATE POLICY "avatars_read_own_or_admin" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- تحديث الصورة: حذف القديمة ورفع جديدة (نفس المستخدم فقط)
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
