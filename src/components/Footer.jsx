import { User, LogOut } from 'lucide-react';

export default function Footer({ displayName, user, profile, avatarDisplayUrl, onOpenProfile, onLogout, supabase }) {
  return (
    <footer className="w-full max-w-4xl mt-auto mb-10 p-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-[1.5rem] overflow-hidden bg-slate-900 flex items-center justify-center text-white shadow-2xl shrink-0">
          {avatarDisplayUrl ? <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover"/> : <User className="w-8 h-8"/>}
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-800 leading-none">{displayName}</p>
          <p className="text-xs text-slate-400 mt-1">{user?.email || '—'}</p>
          {profile?.phone ? <p className="text-sm text-slate-500 mt-1" dir="ltr">{profile.phone}</p> : null}
        </div>
        {user && supabase && (
          <div className="flex items-center gap-2 mr-2">
            <button type="button" onClick={onOpenProfile} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2 font-bold text-sm" title="الملف الشخصي">
              <User className="w-5 h-5"/> الملف الشخصي
            </button>
            <button onClick={onLogout} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition flex items-center gap-2 font-bold text-sm" title="تسجيل الخروج">
              <LogOut className="w-5 h-5"/> خروج
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex gap-3">
          <span className="text-[10px] bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full font-black tracking-widest">BUILD 2.0.1</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black tracking-widest">SECURE SESSION</span>
        </div>
        <p className="text-[10px] text-slate-300 font-medium italic">تم تفعيل وضع الأمان التلقائي لضمان استقرار التطبيق</p>
      </div>
    </footer>
  );
}
