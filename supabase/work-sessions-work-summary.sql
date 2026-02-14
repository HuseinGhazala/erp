-- إضافة عمود لتخزين الأعمال المنجزة لكل جلسة (يراه الأدمن في متابعة النشاط)
-- نفّذ هذا في SQL Editor

ALTER TABLE work_sessions
ADD COLUMN IF NOT EXISTS work_summary JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN work_sessions.work_summary IS 'قائمة الأعمال التي سجّلها الموظف عند إنهاء الجلسة';
