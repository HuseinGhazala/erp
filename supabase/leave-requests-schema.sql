-- جدول طلبات الإجازة (نفّذ بعد schema.sql و admin-policies.sql)

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'سنوية',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.leave_requests IS 'طلبات إجازة الموظفين — الموظف يضيف طلب، الأدمن يوافق أو يرفض';

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- الموظف: يضيف طلباً ويرى طلباته فقط
DROP POLICY IF EXISTS "leave_requests_insert_own" ON public.leave_requests;
CREATE POLICY "leave_requests_insert_own" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "leave_requests_select_own" ON public.leave_requests;
CREATE POLICY "leave_requests_select_own" ON public.leave_requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- الأدمن فقط: تحديث (موافقة/رفض)
DROP POLICY IF EXISTS "leave_requests_update_admin" ON public.leave_requests;
CREATE POLICY "leave_requests_update_admin" ON public.leave_requests
  FOR UPDATE USING (public.is_admin());
