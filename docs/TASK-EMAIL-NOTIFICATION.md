# إرسال إيميل للموظف عند إضافة مهمة له

عندما يضيف الأدمن مهمة لأي موظف، يُرسل إيميل تلقائياً إلى بريد الموظف المسجّل في Supabase.

## المكوّنات

1. **Edge Function** `send-task-email`: تستقبل حدث إدراج مهمة جديدة، تجلب إيميل الموظف من Auth، وترسل الإيميل عبر Resend.
2. **Database Webhook**: يربط جدول `tasks` (حدث INSERT) بعنوان الـ Edge Function.

## الخطوات

### 1. الحصول على مفتاح Resend

1. سجّل في [Resend](https://resend.com) وادخل إلى Dashboard.
2. من **API Keys** أنشئ مفتاحاً جديداً وانسخه.
3. (اختياري) من **Domains** أضف دومينك `pixelcodes.net` واتبع إعداد الـ DNS حتى تتمكن من الإرسال من `employees@pixelcodes.net`. إن لم تضف الدومين، يمكنك الإرسال من `onboarding@resend.dev` للتجربة فقط.

### 2. نشر الـ Edge Function

من مجلد المشروع (حيث يوجد `supabase/`):

```bash
# تثبيت Supabase CLI إن لم يكن مثبتاً: npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-task-email
```

ثم من **Supabase Dashboard** → **Edge Functions** → **send-task-email** → **Secrets** أضف:

| الاسم | القيمة |
|--------|--------|
| `RESEND_API_KEY` | المفتاح من خطوة 1 |
| `FROM_EMAIL` | (اختياري) مثلاً: `Trackify <employees@pixelcodes.net>` |

ملاحظة: `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` تُضاف تلقائياً من Supabase ولا تحتاج لتعريفها.

### 3. ربط الإدراج في الجدول بالـ Function (Database Webhook)

1. من **Supabase Dashboard** → **Database** → **Webhooks** (أو **Project Settings** → **Database** → **Webhooks**).
2. **Create a new hook**.
3. اختر:
   - **Name:** مثلاً `on-task-insert-send-email`
   - **Table:** `tasks`
   - **Events:** ✅ Insert
   - **Type:** HTTP Request
   - **URL:**  
     `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-task-email`
   - **HTTP Headers:** (اختياري) إن كنت تريد تحقق:  
     `Authorization: Bearer YOUR_ANON_OR_SERVICE_ROLE_KEY`
4. احفظ الـ Webhook.

بعد ذلك، أي إدراج صف جديد في `tasks` سيستدعي الـ Function ويرسل الإيميل للموظف المرتبط بالـ `user_id`.

### 4. التأكد من الإيميل

- تأكد أن الموظف مسجّل في **Authentication** ببريد إلكتروني صحيح.
- جرّب إضافة مهمة من لوحة الأدمن ثم تحقق من صندوق الوارد (ومجلد السبام) لذلك الموظف.

---

**بديل بدون Resend:** إن أردت استخدام SMTP مباشرة (مثل Hostinger) بدل Resend، يمكن تعديل الـ Edge Function لاستخدام خدمة إرسال عبر SMTP أو استدعاء API آخر يدعم SMTP؛ ذلك يتطلب تغيير الكود وإضافة أسرار مثل `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.
