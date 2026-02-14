# إشعار الإيميل عند طلب إجازة

عند إضافة أي موظف لطلب إجازة، تُستدعى الدالة `send-leave-request-email` وترسل إيميلاً إلى الأدمن.

## 1. نشر الدالة وإعداد السكريتات

```bash
supabase functions deploy send-leave-request-email --no-verify-jwt
```

**مهم:** في Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets** (أو من تبويب الدالة نفسها) تأكد من إضافة:

- **RESEND_API_KEY** (إجباري): مفتاح API من [Resend](https://resend.com) — نفس المفتاح المستخدم في دالة إيميل المهام. بدون هذا المفتاح الإيميل لا يُرسل.
- `FROM_EMAIL`: عنوان المرسل (اختياري، مثال: `Trackify <onboarding@resend.dev>` للتجربة أو دومينك بعد التحقق)
- `ADMIN_LEAVE_NOTIFY_EMAIL`: الإيميل المستهدف (افتراضي: husseinghazala39@gmail.com)

## 2. تفعيل Database Webhook

1. من لوحة Supabase: **Database** → **Webhooks** → **Create a new webhook**
2. الاسم: مثلاً `Leave request email`
3. **Table**: اختر `leave_requests`
4. **Events**: فعّل **Insert**
5. **Type**: اختر **Supabase Edge Functions** ثم الدالة `send-leave-request-email`  
   أو **HTTP Request** والرابط:
   ```
   https://<PROJECT_REF>.supabase.co/functions/v1/send-leave-request-email
   ```
   مع إضافة هيدر:
   - `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
   - `Content-Type: application/json`

بعد الحفظ، أي إدراج في `leave_requests` سيرسل إيميلاً إلى `ADMIN_LEAVE_NOTIFY_EMAIL`.

---

## لو الإيميل مش واصل

1. **سجلات الدالة:** من Dashboard → **Edge Functions** → **send-leave-request-email** → **Logs**. شوف لو الدالة اشتغلت بعد طلب الإجازة وإذا في خطأ (مثلاً `RESEND_API_KEY not set` أو `Resend failed`).
2. **السكريتات:** تأكد أن **RESEND_API_KEY** مضبوط في نفس المشروع (Edge Functions → إما للدالة أو للمشروع).
3. **Resend:** لو الدومين مش موثّق، استخدم في البداية `FROM_EMAIL` مثل `Trackify <onboarding@resend.dev>` (دومين تجريبي من Resend) أو تحقق من دومينك في لوحة Resend.
4. **الويب هوك:** تأكد أن الـ Webhook مربوط بجدول **leave_requests** وحدث **Insert** فقط.
5. تم نشر الدالة بـ `--no-verify-jwt` حتى يقدر الـ Webhook يستدعيها بدون رفض.
