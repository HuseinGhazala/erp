-- تفعيل التحديث الفوري (Realtime) لجدول جلسات العمل
-- حتى يظهر للأدمن «جلسات عمل جميع الموظفين — تتحدث تلقائياً مع السيرفر»
-- نفّذ هذا في Supabase → SQL Editor (مرة واحدة)

-- إضافة الجداول إلى منشور Realtime (إن لم تكن مضافة)
ALTER PUBLICATION supabase_realtime ADD TABLE work_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE active_work_sessions;

-- حتى يظهر «نشط حالياً» لأكثر من موظف: يجب تفعيل Realtime على active_work_sessions
-- حتى يتلقى الأدمن تحديثاً عند بدء/إنهاء أي موظف ويُحدَّث عدد النشطين.
-- إذا ظهر خطأ أن الجدول مضاف مسبقاً، تجاهله. للتحقق: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
