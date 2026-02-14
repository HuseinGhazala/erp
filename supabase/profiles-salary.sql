-- إضافة الراتب الشهري الأساسي للموظفين (للأدمن فقط)
-- نفّذ هذا في Supabase → SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC DEFAULT NULL;

COMMENT ON COLUMN profiles.monthly_salary IS 'الراتب الشهري الأساسي بالكامل (يُحسب منه الراتب الفعلي حسب ساعات العمل)';
