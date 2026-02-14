-- جدول الجلسات النشطة حالياً (من بدء العمل حتى إنهاء الجلسة)
-- نفّذ بعد schema.sql و admin-policies.sql (للاستفادة من is_admin())

CREATE TABLE IF NOT EXISTS public.active_work_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.active_work_sessions IS 'موظفون في وضع "بدء العمل" حالياً — يُدرج عند البدء ويُحذف عند إنهاء الجلسة';

-- الموظف يضيف نفسه عند البدء ويحذف نفسه عند الإنهاء؛ الأدمن يرى الكل
ALTER TABLE public.active_work_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "active_work_sessions_own_insert" ON public.active_work_sessions;
CREATE POLICY "active_work_sessions_own_insert" ON public.active_work_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "active_work_sessions_own_delete" ON public.active_work_sessions;
CREATE POLICY "active_work_sessions_own_delete" ON public.active_work_sessions
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "active_work_sessions_own_update" ON public.active_work_sessions;
CREATE POLICY "active_work_sessions_own_update" ON public.active_work_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- الأدمن يرى كل الجلسات النشطة (لعرض "نشط حالياً" في الأرشيف)
DROP POLICY IF EXISTS "active_work_sessions_admin_select" ON public.active_work_sessions;
CREATE POLICY "active_work_sessions_admin_select" ON public.active_work_sessions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
