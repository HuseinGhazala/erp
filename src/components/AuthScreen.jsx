import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function AuthScreen({
  authMode,
  authEmail,
  authPassword,
  authFullName,
  authPhone,
  authJobTitle,
  authError,
  forgotPasswordSuccess,
  setAuthEmail,
  setAuthPassword,
  setAuthFullName,
  setAuthPhone,
  setAuthJobTitle,
  setAuthMode,
  setAuthError,
  setForgotPasswordSuccess,
  onLogin,
  onSignUp,
  onForgotPassword,
}) {
  if (authMode === 'forgot') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md mt-16 card-soft hover-lift p-8 md:p-10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary text-primary-content p-3.5 rounded-2xl shadow-lg shadow-primary/25">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-base-content">Trackify AI</h1>
            <p className="text-base-content/60 text-sm mt-0.5">استعادة كلمة المرور</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {forgotPasswordSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="alert alert-success rounded-2xl text-sm">
                تم إرسال رابط استعادة كلمة المرور إلى بريدك. راجع صندوق الوارد (والرسائل غير المرغوبة) ثم اضغط الرابط لتعيين كلمة مرور جديدة.
              </div>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setForgotPasswordSuccess?.(false); }}
                className="btn btn-ghost w-full text-primary font-bold"
              >
                العودة لتسجيل الدخول
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" variants={container} initial="hidden" animate="show" className="space-y-5">
              <form onSubmit={onForgotPassword} className="space-y-5">
                <motion.div variants={item} className="form-control">
                  <label className="label">
                    <span className="label-text font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4" /> البريد الإلكتروني <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="input-modern input-lg focus-ring py-4"
                    placeholder="name@company.com"
                  />
                </motion.div>
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="alert alert-error rounded-2xl text-sm"
                    >
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button type="submit" variants={item} className="btn btn-primary w-full rounded-2xl h-14 text-lg font-bold btn-glow">
                  إرسال رابط استعادة كلمة المرور
                </motion.button>
              </form>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className="btn btn-ghost w-full text-base-content/60 hover:text-primary"
              >
                العودة لتسجيل الدخول
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md mt-16 card-soft hover-lift p-8 md:p-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary text-primary-content p-3.5 rounded-2xl shadow-lg shadow-primary/25">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-base-content">Trackify AI</h1>
          <p className="text-base-content/60 text-sm mt-0.5">
            {authMode === 'login' ? 'تسجيل الدخول للموظفين' : 'إنشاء حساب جديد'}
          </p>
        </div>
      </div>

      <motion.form
        onSubmit={authMode === 'login' ? onLogin : onSignUp}
        className="space-y-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {authMode === 'signup' && (
          <>
            <motion.div variants={item} className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <User className="w-4 h-4" /> الاسم الكامل <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                value={authFullName}
                onChange={e => setAuthFullName(e.target.value)}
                required
                className="input-modern input-lg focus-ring py-4"
                placeholder="الاسم كما يظهر في التطبيق"
              />
            </motion.div>
            <motion.div variants={item} className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4" /> رقم الهاتف <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="tel"
                value={authPhone}
                onChange={e => setAuthPhone(e.target.value)}
                required
                className="input-modern input-lg focus-ring py-4"
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </motion.div>
            <motion.div variants={item} className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> المسمى الوظيفي <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                value={authJobTitle}
                onChange={e => setAuthJobTitle(e.target.value)}
                required
                className="input-modern input-lg focus-ring py-4"
                placeholder="مثال: مطوّر، محاسب، مدير مشاريع"
              />
            </motion.div>
          </>
        )}
        <motion.div variants={item} className="form-control">
          <label className="label">
            <span className="label-text font-bold flex items-center gap-2">
              <Mail className="w-4 h-4" /> البريد الإلكتروني <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="email"
            value={authEmail}
            onChange={e => setAuthEmail(e.target.value)}
            required
            className="input-modern input-lg focus-ring py-4"
            placeholder="name@company.com"
          />
        </motion.div>
        <motion.div variants={item} className="form-control">
          <label className="label">
            <span className="label-text font-bold flex items-center gap-2">
              <Lock className="w-4 h-4" /> كلمة المرور <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="password"
            value={authPassword}
            onChange={e => setAuthPassword(e.target.value)}
            required
            minLength={6}
            className="input-modern input-lg focus-ring py-4"
            placeholder="••••••"
          />
        </motion.div>
        {authMode === 'login' && (
          <motion.button
            type="button"
            variants={item}
            onClick={() => { setAuthMode('forgot'); setAuthError(''); }}
            className="btn btn-ghost btn-sm text-primary w-full justify-end"
          >
            نسيت كلمة المرور؟
          </motion.button>
        )}
        {authMode === 'signup' && (
          <p className="text-xs text-base-content/50">الصورة الشخصية اختيارية — يمكنك إضافتها لاحقاً من الملف الشخصي</p>
        )}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="alert alert-error rounded-2xl text-right"
            >
              <span className="text-sm font-bold">{authError}</span>
              {authError.includes('السيرفر') && (
                <div className="text-xs mt-2 space-y-2 opacity-95">
                  <p className="font-bold">افعل التالي:</p>
                  <ol className="list-decimal list-inside space-y-1 font-medium">
                    <li>
                      افتح{' '}
                      <a href="https://supabase.com/dashboard/project/_/auth/url-configuration" target="_blank" rel="noopener noreferrer" className="underline">
                        Supabase → Authentication → URL Configuration
                      </a>
                    </li>
                    <li>في <strong>Site URL</strong> ضع: <kbd className="kbd kbd-sm">{typeof window !== 'undefined' ? window.location.origin : ''}</kbd></li>
                    <li>في <strong>Redirect URLs</strong> أضف: <kbd className="kbd kbd-sm block mt-1">{typeof window !== 'undefined' ? window.location.origin + '/**' : ''}</kbd></li>
                    <li>احفظ (Save) ثم جرّب تسجيل الدخول مرة أخرى</li>
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button type="submit" variants={item} className="btn btn-primary w-full rounded-2xl h-14 text-lg font-bold btn-glow">
          {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </motion.button>
      </motion.form>

      <motion.button
        type="button"
        onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
        className="btn btn-ghost w-full mt-5 text-base-content/60 hover:text-primary"
      >
        {authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب؟ تسجيل الدخول'}
      </motion.button>
    </motion.div>
  );
}
