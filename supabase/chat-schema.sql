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
