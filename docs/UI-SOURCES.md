# مصادر واجهة المستخدم (UI Sources)

تم دمج أنماط وتصاميم مستوحاة من المصادر التالية في المشروع (بدون إضافة مكتبات إضافية لتجنب التعارض مع Tailwind v3 و DaisyUI).

## 0. [Nuxt UI Dashboard](https://github.com/nuxt-ui-templates/dashboard)
- **تخطيط لوحة التحكم**: شريط جانبي ثابت (Sidebar) على اليمين + منطقة محتوى رئيسية مع هيدر علوي — مثل [Nuxt Dashboard Template](https://dashboard-template.nuxt.dev/).
- **AppSidebar**: قائمة تنقل عمودية (لوحة التحكم، المهام، التتبع، السجل، الإدارة) مع أيقونات، وزر «طي القائمة» لتقليص العرض.
- **AppHeader**: شريط علوي يعرض عنوان الصفحة الحالية وقائمة المستخدم (صورة، الملف الشخصي، تسجيل الخروج).
- **تبويب المحتوى**: كل قسم يظهر في نفس المنطقة مع تغيير العنوان في الـ Header.

## 1. [uiverse.io](https://uiverse.io/)
- **Gradient border card**: بطاقة بحدود متدرجة متحركة (`card-gradient-border`) — مستخدمة في بطاقة «وقت العمل المسجل اليوم» في الـ Dashboard.
- **Glow button**: زر بظل توهج خفيف (`btn-glow`) — مستخدم في أزرار تسجيل الدخول واستعادة كلمة المرور وبدء/إنهاء الجلسة.
- **Hover lift**: رفع خفيف للعنصر عند التمرير (`hover-lift`) — مطبّق على الـ Nav، بطاقة تسجيل الدخول، المهام، السجل، والبطاقة الرئيسية في الـ Dashboard.

## 2. [HeroUI](https://www.heroui.com/) (Previously NextUI)
- **Focus ring**: حلقة تركيز واضحة عند التنقل بالكيبورد (`focus-ring`) — مطبّقة على حقول الإدخال لتحسين إمكانية الوصول.
- **Input style**: حقول إدخال نظيفة مع حدود وتركيز واضح (`input-modern`) — مستخدمة في شاشة تسجيل الدخول وإنشاء الحساب واستعادة كلمة المرور.
- HeroUI كامل يعتمد على Tailwind v4؛ تم أخذ الإلهام البصري فقط وتنفيذه بـ Tailwind v3.

## 3. [Untitled UI React](https://www.untitledui.com/react)
- **Layout & spacing**: تباعد وتنسيق مستوحى من مكوّناتهم (بطاقات، تسميات، أزرار).
- **Semantic structure**: استخدام `form-control` و `label` وتبويب واضح بين العنوان والمحتوى.
- مكوّناتهم مبنية على Tailwind و React Aria؛ تم تطبيق نفس الروح التصميمية مع DaisyUI و Framer Motion الحاليين.

---

الملفات المعدّلة:
- `src/index.css`: تعريفات `card-gradient-border`, `btn-glow`, `hover-lift`, `focus-ring`, `input-modern`, و `@keyframes gradient-shift`.
- `tailwind.config.js`: ظلال `glow` و `glow-lg`.
- المكوّنات: `AuthScreen`, `Nav`, `Dashboard`, `TasksTab`, `HistoryTab`.
