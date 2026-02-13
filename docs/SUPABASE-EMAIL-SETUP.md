# ربط Supabase بإيميل الشركة (employees@pixelcodes.net)

لكي تُرسل رسائل Supabase (تأكيد التسجيل، استعادة كلمة المرور، إلخ) من إيميلك **employees@pixelcodes.net** بدلاً من الإيميل الافتراضي:

## الخطوات

### 1. الدخول إلى إعدادات البريد في Supabase

1. افتح [Supabase Dashboard](https://supabase.com/dashboard) واختر مشروعك.
2. من القائمة الجانبية: **Project Settings** (أيقونة الترس).
3. من التبويبات: **Authentication** ثم من القائمة الفرعية **SMTP Settings** (أو **Email**).

### 2. تفعيل Custom SMTP

- فعّل **Enable Custom SMTP**.

### 3. تعبئة بيانات الإيميل (Hostinger – pixelcodes.net)

استخدم إعدادات **Hostinger** الرسمية للبريد الصادر (SMTP):

| الحقل | القيمة |
|--------|--------|
| **Sender email** | `employees@pixelcodes.net` |
| **Sender name** | `Trackify` أو اسم تطبيقك |
| **Host** | `smtp.hostinger.com` |
| **Port** | `465` (SSL) — إن لم يعمل جرّب `587` (TLS/STARTTLS) |
| **Username** | `employees@pixelcodes.net` |
| **Password** | كلمة مرور صندوق البريد employees@pixelcodes.net |

**إعدادات Hostinger كاملة (للمرجع):**
- **SMTP (صادر):** smtp.hostinger.com — SSL — Port **465** (أو TLS — Port **587**)
- IMAP (وارد): imap.hostinger.com — SSL — 993  
- POP3 (وارد): pop.hostinger.com — SSL — 995

### 4. الحفظ والاختبار

- اضغط **Save**.
- من **Authentication → Users** يمكنك تجربة **Send password recovery** لأحد المستخدمين للتأكد أن الرسائل تصل من **employees@pixelcodes.net**.

---

**ملاحظة:** إذا لم يعمل الإرسال مع Port 465، جرّب في Supabase Port **587** واختر TLS/STARTTLS إن وُجد خيار للأمان.
