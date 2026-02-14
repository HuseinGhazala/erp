-- الشات الداخلي بين الموظفين
-- نفّذ بعد schema.sql و admin-policies.sql (أو تأكد أن is_admin() موجودة)

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON public.chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(sender_id, recipient_id, created_at DESC);

COMMENT ON TABLE public.chat_messages IS 'رسائل الشات الداخلي بين الموظفين';

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى فقط الرسائل التي هو مرسلها أو مستقبلها
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- المستخدم يضيف رسالة فقط كمرسل
DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- (اختياري) السماح بحذف رسالتي فقط
DROP POLICY IF EXISTS "chat_messages_delete_own" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- لتحميل قائمة الموظفين للشات: الموظفون يحتاجون رؤية أسماء بعض (id, full_name) دون كسر RLS
-- إذا كان لديك سياسة تسمح للأدمن فقط بقراءة كل profiles، أضف سياسة للقراءة المحدودة:
-- سياسة: أي مستخدم مصادق يقرأ id و full_name من profiles للعرض في قائمة الشات (ما عدا المحذوفين)
DROP POLICY IF EXISTS "profiles_select_for_chat" ON public.profiles;
CREATE POLICY "profiles_select_for_chat" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (role IS NULL OR role != 'محذوف')
  );

-- تفعيل Realtime للشات (اختياري): من Dashboard → Database → Replication → فعّل جدول chat_messages
-- أو: ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ─── مجموعات الشات ───
CREATE TABLE IF NOT EXISTS public.chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_groups_created_by ON public.chat_groups(created_by);

CREATE TABLE IF NOT EXISTS public.chat_group_members (
  group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_group_members_user ON public.chat_group_members(user_id);

CREATE TABLE IF NOT EXISTS public.chat_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_group_messages_group ON public.chat_group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_messages_created ON public.chat_group_messages(created_at DESC);

ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_messages ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى المجموعات التي هو عضو فيها
DROP POLICY IF EXISTS "chat_groups_select_member" ON public.chat_groups;
CREATE POLICY "chat_groups_select_member" ON public.chat_groups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_group_members m WHERE m.group_id = id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chat_groups_insert" ON public.chat_groups;
CREATE POLICY "chat_groups_insert" ON public.chat_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "chat_groups_update_creator" ON public.chat_groups;
CREATE POLICY "chat_groups_update_creator" ON public.chat_groups
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "chat_groups_delete_creator" ON public.chat_groups;
CREATE POLICY "chat_groups_delete_creator" ON public.chat_groups
  FOR DELETE USING (auth.uid() = created_by);

-- الأعضاء: يرى أعضاء المجموعات التي ينتمي لها؛ يضيف/يحذف المنشئ أو (للمغادرة) المستخدم نفسه
DROP POLICY IF EXISTS "chat_group_members_select" ON public.chat_group_members;
CREATE POLICY "chat_group_members_select" ON public.chat_group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_group_members m WHERE m.group_id = group_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chat_group_members_insert" ON public.chat_group_members;
CREATE POLICY "chat_group_members_insert" ON public.chat_group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.created_by = auth.uid())
  );

DROP POLICY IF EXISTS "chat_group_members_delete" ON public.chat_group_members;
CREATE POLICY "chat_group_members_delete" ON public.chat_group_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.created_by = auth.uid())
  );

-- رسائل المجموعة: يراها الأعضاء فقط؛ الإرسال للأعضاء فقط
DROP POLICY IF EXISTS "chat_group_messages_select" ON public.chat_group_messages;
CREATE POLICY "chat_group_messages_select" ON public.chat_group_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_group_members m WHERE m.group_id = group_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chat_group_messages_insert" ON public.chat_group_messages;
CREATE POLICY "chat_group_messages_insert" ON public.chat_group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (SELECT 1 FROM public.chat_group_members m WHERE m.group_id = group_id AND m.user_id = auth.uid())
  );
