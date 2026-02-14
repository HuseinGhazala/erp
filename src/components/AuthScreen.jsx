import { Clock, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';

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
  // وضع "نسيت كلمة المرور": إدخال البريد فقط وإرسال الرابط
  if (authMode === 'forgot') {
    return (
      <div className="w-full max-w-md mt-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Clock className="w-8 h-8"/></div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Trackify AI</h1>
            <p className="text-slate-500 text-sm">استعادة كلمة المرور</p>
          </div>
        </div>
        {forgotPasswordSuccess ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm font-medium">
              تم إرسال رابط استعادة كلمة المرور إلى بريدك. راجع صندوق الوارد (والرسائل غير المرغوبة) ثم اضغط الرابط لتعيين كلمة مرور جديدة.
            </div>
            <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setForgotPasswordSuccess?.(false); }} className="w-full mt-4 text-indigo-600 font-bold hover:underline">
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={onForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Mail className="w-4 h-4"/> البريد الإلكتروني <span className="text-rose-500">*</span></label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="name@company.com" />
              </div>
              {authError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-right">
                  <p className="text-rose-700 text-sm font-bold">{authError}</p>
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition">
                إرسال رابط استعادة كلمة المرور
              </button>
            </form>
            <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} className="w-full mt-4 text-slate-500 text-sm font-medium hover:text-indigo-600">
              العودة لتسجيل الدخول
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mt-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Clock className="w-8 h-8"/></div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Trackify AI</h1>
          <p className="text-slate-500 text-sm">{authMode === 'login' ? 'تسجيل الدخول للموظفين' : 'إنشاء حساب جديد'}</p>
        </div>
      </div>
      <form onSubmit={authMode === 'login' ? onLogin : onSignUp} className="space-y-5">
        {authMode === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><User className="w-4 h-4"/> الاسم الكامل <span className="text-rose-500">*</span></label>
              <input type="text" value={authFullName} onChange={e => setAuthFullName(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="الاسم كما يظهر في التطبيق" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Phone className="w-4 h-4"/> رقم الهاتف <span className="text-rose-500">*</span></label>
              <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="05xxxxxxxx" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4"/> المسمى الوظيفي <span className="text-rose-500">*</span></label>
              <input type="text" value={authJobTitle} onChange={e => setAuthJobTitle(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="مثال: مطوّر، محاسب، مدير مشاريع" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Mail className="w-4 h-4"/> البريد الإلكتروني <span className="text-rose-500">*</span></label>
          <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="name@company.com" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Lock className="w-4 h-4"/> كلمة المرور <span className="text-rose-500">*</span></label>
          <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required minLength={6} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="••••••" />
        </div>
        {authMode === 'login' && (
          <button type="button" onClick={() => { setAuthMode('forgot'); setAuthError(''); }} className="text-sm text-indigo-600 font-medium hover:underline w-full text-right">
            نسيت كلمة المرور؟
          </button>
        )}
        {authMode === 'signup' && (
          <p className="text-xs text-slate-500">الصورة الشخصية اختيارية — يمكنك إضافتها لاحقاً من الملف الشخصي</p>
        )}
        {authError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-right">
            <p className="text-rose-700 text-sm font-bold mb-3">{authError}</p>
            {authError.includes('السيرفر') && (
              <div className="text-rose-600/90 text-xs space-y-2 mt-2">
                <p className="font-bold">افعل التالي:</p>
                <ol className="list-decimal list-inside space-y-1 font-medium">
                  <li>افتح <a href="https://supabase.com/dashboard/project/_/auth/url-configuration" target="_blank" rel="noopener noreferrer" className="underline">Supabase → Authentication → URL Configuration</a></li>
                  <li>في <strong>Site URL</strong> ضع: <code className="bg-white/80 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}</code></li>
                  <li>في <strong>Redirect URLs</strong> أضف سطراً: <code className="bg-white/80 px-1 rounded block mt-1">{typeof window !== 'undefined' ? window.location.origin + '/**' : ''}</code></li>
                  <li>احفظ (Save) ثم جرّب تسجيل الدخول مرة أخرى</li>
                </ol>
              </div>
            )}
          </div>
        )}
        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition">
          {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </button>
      </form>
      <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} className="w-full mt-4 text-slate-500 text-sm font-medium hover:text-indigo-600">
        {authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب؟ تسجيل الدخول'}
      </button>
    </div>
  );
}
