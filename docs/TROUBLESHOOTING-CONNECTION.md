# استكشاف خطأ "تعذر الاتصال بالسيرفر"

إذا ظهرت رسالة **"تعذر الاتصال بالسيرفر"** أو **"Failed to fetch"** بعد ضبط إعدادات Supabase (URL Configuration)، جرّب الخطوات التالية بالترتيب.

---

## 1. التحقق من حالة مشروع Supabase

المشاريع على الخطة المجانية تتوقف تلقائياً بعد 7 أيام من عدم النشاط.

- ادخل إلى: [Supabase Dashboard](https://supabase.com/dashboard)
- اختر مشروعك (مثلاً `vlyanvwjwahsyoqyabdr`)
- إذا ظهر **"Project is paused"** أو زر **"Restore project"**، اضغط عليه لتفعيل المشروع
- انتظر بضع دقائق حتى يكتمل التفعيل

---

## 2. التأكد من متغيرات البيئة في الإنتاج

Vite يضمّن `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` **عند بناء المشروع فقط**. إذا كان الـ build يعمل على الاستضافة أو CI بدون هذه المتغيرات، ستكون قيمها فارغة.

**الحل:**
- إذا كنت تبني محلياً ثم ترفع الملفات: تأكد أن ملف `.env` موجود في نفس المجلد عند تشغيل `npm run build`
- إذا كنت تبني على Hostinger أو منصة أخرى: عيّن المتغيرات في إعدادات البيئة (Environment Variables) قبل البناء
- أعد تشغيل البناء بعد ضبط المتغيرات ثم ارفع الملفات من جديد

---

## 3. اختبار الاتصال من المتصفح

افتح الموقع على: `https://snow-bee-472058.hostingersite.com`

ثم افتح أدوات المطور (F12) → تبويب **Console** ونفّذ:

```javascript
fetch('https://vlyanvwjwahsyoqyabdr.supabase.co/rest/v1/', {
  headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseWFudndqd2Foc3lvcXlhYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODQ2NjEsImV4cCI6MjA4NjU2MDY2MX0.PCgdwQd1_KNWGzJdBS6jYjiUBcm0fGzx8GRA0yEKE7U' }
}).then(r => console.log('OK:', r.ok)).catch(e => console.error('Error:', e));
```

- إذا ظهر **"OK: true"** فالطلب وصل لـ Supabase، والمشكلة غالباً في الكود أو متغيرات البيئة.
- إذا ظهر **"Error"** أو **CORS** فالطلب لا يصل: جرّب إيقاف الإضافات (Adblocker، CORS…) أو استخدام نافذة خاصة.

---

## 4. إعدادات Supabase المطلوبة

### Authentication → URL Configuration

- **Site URL:** `https://snow-bee-472058.hostingersite.com`
- **Redirect URLs:**  
  `https://snow-bee-472058.hostingersite.com/**`  
  `https://snow-bee-472058.hostingersite.com`  
  (أضف السطرين إن لم يكونا موجودين)
- اضغط **Save**

---

## 5. إيقاف الإضافات المؤثرة على الطلبات

بعض الإضافات (مثل "Allow CORS Access Control" أو Adblocker) قد تمنع الطلبات إلى Supabase.

جرّب:
1. فتح الموقع في نافذة خاصة (Incognito/Private)
2. أو تعطيل الإضافات مؤقتاً

---

## 6. اختبار من جهاز أو شبكة أخرى

جرّب من:
- هاتفك (Wi‑Fi أو بيانات الجوال)
- شبكة أخرى غير الشبكة الحالية

إذا اشتغل على جهاز آخر وليس عندك، فغالباً المشكلة من الشبكة أو جدار الحماية.

---

## 7. التحقق من لوحة Hostinger

بعض الاستضافات تمنع الطلبات الصادرة لخدمات خارجية.

- تأكد من عدم وجود جدار حماية يمنع الاتصال بـ `*.supabase.co`
- إن وُجدت إعدادات "Outbound requests" أو "Firewall"، تأكد أنها لا تحجب Supabase

---

## 8. مراجعة تبويب Network

1. افتح F12 → تبويب **Network**
2. حاول تسجيل الدخول
3. ابحث عن طلب فاشل (أحمر) إلى `supabase.co`
4. انقر عليه وافحص:
   - **Status:** إذا كان `(failed)` أو `CORS error` أو `net::ERR_*`
   - **Response:** أي رسالة خطأ من Supabase

شارك هذه التفاصيل إن أردت مساعدة إضافية.

---

## ملخص سريع

| الخطوة | الإجراء |
|--------|---------|
| 1 | التحقق من أن مشروع Supabase غير متوقف (Restore إن ظهر) |
| 2 | التأكد أن `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` موجودان عند البناء |
| 3 | إعادة بناء المشروع ثم إعادة الرفع |
| 4 | تجربة الموقع من نافذة خاصة بدون إضافات |
| 5 | تجربة من جهاز أو شبكة مختلفة |
