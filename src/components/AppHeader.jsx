import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';

const TAB_TITLES = {
  dashboard: 'لوحة التحكم',
  tasks: 'المهام',
  monitor: 'التتبع',
  history: 'السجل',
  admin: 'الإدارة',
};

export default function AppHeader({
  activeTab,
  displayName,
  avatarDisplayUrl,
  user,
  onOpenProfile,
  onLogout,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const pageTitle = TAB_TITLES[activeTab] || 'Trackify AI';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 px-4 md:px-6 bg-base-100/80 backdrop-blur-xl border-b border-base-200/60 shrink-0">
      <h2 className="text-xl font-black text-base-content truncate">{pageTitle}</h2>

      {/* User menu - Nuxt UI dashboard style: avatar + dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-base-200 transition-colors"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          <div className="w-9 h-9 rounded-xl bg-base-200 overflow-hidden flex items-center justify-center text-base-content/60">
            {avatarDisplayUrl ? (
              <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-base-content leading-tight truncate max-w-[120px]">{displayName}</p>
            <p className="text-xs text-base-content/50 truncate max-w-[120px]">{user?.email}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-base-content/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-56 py-2 rounded-2xl bg-base-100 shadow-xl border border-base-200 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-base-200">
                <p className="font-bold text-base-content truncate">{displayName}</p>
                <p className="text-xs text-base-content/50 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => { onOpenProfile(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-right text-base-content/80 hover:bg-base-200 hover:text-base-content transition-colors"
              >
                <User className="w-5 h-5 shrink-0" /> الملف الشخصي
              </button>
              <button
                type="button"
                onClick={() => { onLogout(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-right text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" /> تسجيل الخروج
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
