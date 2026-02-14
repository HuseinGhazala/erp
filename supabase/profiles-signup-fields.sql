-- إضافة job_title وتحديث دالة إنشاء الملف الشخصي عند التسجيل
-- نفّذ من Supabase → SQL Editor
-- تأكد من تنفيذ profiles-extended.sql أولاً (يضيف عمود phone)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- تحديث الدالة لتحفظ الاسم والجوال والوظيفة من بيانات التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'job_title'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
