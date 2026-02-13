-- جعل المستخدم أدمن (استبدل USER_UID بمعرّف المستخدم من Authentication → Users)
UPDATE public.profiles
SET role = 'admin'
WHERE id = '13b93e67-dec6-4a4c-8a1f-99756c965374';

-- التحقق: يجب أن يعيد صفاً واحداً
-- SELECT id, full_name, role FROM public.profiles WHERE id = '13b93e67-dec6-4a4c-8a1f-99756c965374';
