-- إعدادات اللقطات + طلبات لقطة يدوية من الأدمن
-- نفّذ من SQL Editor بعد schema.sql و admin-policies.sql

-- إعداد واحد: مدة التقاط اللقطة التلقائية (بالدقائق)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value) VALUES ('screenshot_interval_minutes', '10')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- الجميع يقرأ، الأدمن يحدّث
DROP POLICY IF EXISTS "app_settings_read" ON app_settings;
CREATE POLICY "app_settings_read" ON app_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "app_settings_update_admin" ON app_settings;
CREATE POLICY "app_settings_update_admin" ON app_settings FOR UPDATE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "app_settings_insert_admin" ON app_settings;
CREATE POLICY "app_settings_insert_admin" ON app_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- طلبات لقطة يدوية: الأدمن يضيف، الموظف يقرأ طلباته فقط
CREATE TABLE IF NOT EXISTS screenshot_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshot_requests_user_id ON screenshot_requests(user_id);

ALTER TABLE screenshot_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "screenshot_requests_insert_admin" ON screenshot_requests;
CREATE POLICY "screenshot_requests_insert_admin" ON screenshot_requests FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "screenshot_requests_select_own" ON screenshot_requests;
CREATE POLICY "screenshot_requests_select_own" ON screenshot_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- تفعيل Realtime: من Dashboard → Database → Replication → جدول screenshot_requests فعّله
-- أو نفّذ: ALTER PUBLICATION supabase_realtime ADD TABLE screenshot_requests;
