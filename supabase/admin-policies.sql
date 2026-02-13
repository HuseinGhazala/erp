-- سياسات لوحة الأدمن: نفّذ هذا في SQL Editor بعد schema.sql
-- يجعل المستخدم الذي role = 'admin' في profiles يرى كل الموظفين ويضيف لهم مهام ويشاهد نشاطهم

-- دالة: هل المستخدم الحالي أدمن؟
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- الأدمن يرى كل الملفات الشخصية (لائحة الموظفين)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- الأدمن يحدّث أي ملف (لتعطيل/حذف موظف: role = 'محذوف')
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- الأدمن يرى كل جلسات العمل (لمتابعة الموظفين)
DROP POLICY IF EXISTS "work_sessions_own" ON work_sessions;
CREATE POLICY "work_sessions_own" ON work_sessions FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- الأدمن يضيف مهام لأي موظف ويرى كل المهام
DROP POLICY IF EXISTS "tasks_own" ON tasks;
CREATE POLICY "tasks_own" ON tasks FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- لجعل مستخدم أدمن: نفّذ يدوياً (غيّر USER_UUID إلى id المستخدم من auth.users)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_UUID';
