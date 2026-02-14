# Trackify AI

تطبيق ويب لتتبع وقت العمل مع المهام، مراقبة الشاشة (اختياري)، والذكاء الاصطناعي (Gemini). يدعم **عدة موظفين** عبر ربط Supabase.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح المتصفح على العنوان الذي يظهر (عادةً `http://localhost:5173`).

## ربط Supabase (عدة موظفين)

1. أنشئ مشروعاً في [Supabase](https://supabase.com/dashboard) وانسخ **Project URL** و **anon public** key.
2. أنشئ ملف `.env` في جذر المشروع (انظر `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. في لوحة Supabase: **SQL Editor** → New query → الصق محتوى الملف `supabase/schema.sql` → Run.
4. من **Authentication → Providers** تأكد أن Email مفعّل (واختيارياً فعّل "Confirm email" إن أردت).
5. **مهم لتفادي "Failed to fetch"**: من **Authentication → URL Configuration** أضف:
   - **Site URL**: عنوان موقعك (مثلاً `https://snow-bee-472058.hostingersite.com` أو للتطوير `http://localhost:5173`).
   - **Redirect URLs**: نفس القيمة أو أضف كل العناوين التي ستفتح منها التطبيق (مثلاً `http://localhost:5173/**` و `https://snow-bee-472058.hostingersite.com/**`).
6. إذا كان المشروع على الخطة المجانية وكان متوقفاً، ادخل إلى المشروع من الداشبورد واضغط **Restore project** لتفعيله من جديد.
7. **إذا استمرت مشكلة "تعذر الاتصال بالسيرفر":** راجع **`docs/TROUBLESHOOTING-CONNECTION.md`** لخطوات استكشاف الأخطاء (المشروع المتوقف، متغيرات البيئة في الإنتاج، إلخ).
8. **إرسال الإيميلات من إيميلك (مثلاً employees@pixelcodes.net):** من **Project Settings → Authentication → SMTP Settings** فعّل Custom SMTP وضبط Host و Port و Username وPassword. انظر **`docs/SUPABASE-EMAIL-SETUP.md`** للتفاصيل.
9. أعد تشغيل `npm run dev`. ستظهر شاشة تسجيل الدخول؛ كل موظف يسجّل بحسابه وستُحفظ المهام وجلسات العمل له وحده.

### لوحة الأدمن

- بعد تنفيذ `schema.sql`، نفّذ أيضاً محتوى الملف **`supabase/admin-policies.sql`** من SQL Editor (ليتمكن الأدمن من رؤية الموظفين وإضافة المهام ومتابعة النشاط).
- لجعل مستخدم ما **أدمن**: من **SQL Editor** نفّذ (غيّر `USER_UUID` إلى معرّف المستخدم من جدول `auth.users` أو من **Authentication → Users** انسخ User UID):
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_UUID';
  ```
- بعدها يظهر له تبويب **لوحة الأدمن** (أيقونة الدرع): قائمة الموظفين، إضافة مهمة لأي موظف، ومتابعة نشاطه (المهام وجلسات العمل + **لقطات الشاشة** لكل موظف). عند إضافة مهمة لموظف يصل له **إشعار** داخل التطبيق (وإشعار المتصفح إن سمح بالإشعارات).
- لتفعيل إشعار المهام: من **Database → Replication** فعّل Realtime لجدول **tasks**.
- **إيميل عند إضافة مهمة:** عند إضافة مهمة لأي موظف يُرسل له إيميل تلقائياً بنص المهمة. لتفعيلها: انظر **`docs/TASK-EMAIL-NOTIFICATION.md`** (Resend + Edge Function + Database Webhook).

### مدة اللقطة التلقائية وطلب لقطة يدوية (أدمن)
- نفّذ **`supabase/screenshot-settings.sql`** من SQL Editor (بعد admin-policies.sql).
- من **Database → Replication** فعّل Realtime لجدول **screenshot_requests**.
- من لوحة الأدمن يمكنك: ضبط **مدة اللقطة التلقائية** (1–60 دقيقة) وحفظها، والضغط على **«لقطة الآن»** لأي موظف لالتقاط لقطة من جهازه فوراً (يجب أن يكون التطبيق مفتوحاً عند الموظف).

### لقطات الشاشة (للموظفين والأدمن)

- من **Storage** في Supabase: **New bucket** → الاسم: `screenshots` → **Public** → Create (يجب أن يكون عاماً لعرض اللقطات للأدمن).
- من **SQL Editor** نفّذ محتوى الملف **`supabase/screenshots-schema.sql`**.
- إذا كان الـ bucket **Private** ولم تظهر اللقطات، غيّره إلى **Public**: Storage → screenshots → ⋮ → Edit → Public.

### الملف الشخصي (الاسم، الجوال، الصورة)

- من **Storage** في Supabase: **New bucket** → الاسم: `avatars` → **Private** → Create.
- من **SQL Editor** نفّذ محتوى الملف **`supabase/profiles-extended.sql`** (بعد `admin-policies.sql`).
- بعدها يستطيع كل موظف من زر **«الملف الشخصي»** في الأسفل تعديل اسمه، إضافة رقم جواله، ورفع صورته الشخصية.

## البناء للإنتاج

```bash
npm run build
npm run preview
```

## مفتاح Gemini API (اختياري)

لتشغيل المساعد الذكي، ضع مفتاح API في الملف `src/App.jsx`:

```js
const apiKey = "YOUR_GEMINI_API_KEY";
```

يمكنك الحصول على المفتاح من: [Google AI Studio](https://aistudio.google.com/apikey)

## المميزات

- **لوحة التحكم**: بدء/إنهاء جلسة العمل، عداد الوقت، تفعيل تتبع النشاط
- **المهام**: إضافة وتحديد إنجاز المهام
- **معرض التتبع**: لقطات شاشة تلقائية (كل 10 دقائق) أو يدوية، مع وضع محاكاة عند منع الصلاحيات
- **الأرشيف**: سجل الجلسات مع المدة والمهام المنجزة
- **لوحة الأدمن**: (لمستخدم بدور admin) إضافة مهام لأي موظف ومتابعة نشاطه وجلسات عمله
- **المساعد الذكي**: تحليل اليوم عبر Gemini (يتطلب مفتاح API)

## التقنيات

- React 18 + Vite
- Tailwind CSS
- Lucide React (أيقونات)
- Gemini API (اختياري)
