import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';

export default function Footer({ displayName, user, profile, avatarDisplayUrl, onOpenProfile, onLogout, supabase }) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl mt-auto mb-8 p-6 md:p-8 border-t border-base-300/50 flex flex-col md:flex-row justify-between items-center gap-6 bg-base-100/50 rounded-3xl"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="avatar placeholder">
          <div className="w-14 h-14 rounded-2xl bg-neutral text-neutral-content shadow-lg overflow-hidden">
            {avatarDisplayUrl ? (
              <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl"><User className="w-8 h-8" /></span>
            )}
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-xl font-black text-base-content leading-tight">{displayName}</p>
          <p className="text-xs text-base-content/50 mt-1">{user?.email || '—'}</p>
          {profile?.phone && (
            <p className="text-sm text-base-content/60 mt-1" dir="ltr">{profile.phone}</p>
          )}
        </div>
        {user && supabase && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenProfile}
              className="btn btn-ghost btn-sm gap-2 rounded-xl text-base-content/70 hover:text-primary hover:bg-primary/10"
              title="الملف الشخصي"
            >
              <User className="w-5 h-5" /> الملف الشخصي
            </button>
            <button
              onClick={onLogout}
              className="btn btn-ghost btn-sm gap-2 rounded-xl text-base-content/70 hover:text-error hover:bg-error/10"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" /> خروج
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center md:items-end gap-2">
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="badge badge-ghost badge-sm font-bold tracking-wider">BUILD 2.0.1</span>
          <span className="badge badge-primary badge-sm badge-outline font-bold tracking-wider">SECURE SESSION</span>
        </div>
        <p className="text-[10px] text-base-content/40 font-medium italic">وضع الأمان التلقائي مفعّل</p>
      </div>
    </motion.footer>
  );
}
