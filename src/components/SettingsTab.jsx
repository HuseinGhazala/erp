import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, PanelLeftClose, PanelLeft } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const THEME_OPTIONS = [
  { value: 'light', label: 'فاتح', icon: Sun },
  { value: 'dark', label: 'غامق', icon: Moon },
  { value: 'auto', label: 'تلقائي (حسب النظام)', icon: Monitor },
];

export default function SettingsTab({ uiTheme, setUiTheme, sidebarCollapsed, setSidebarCollapsed, storageKeys }) {
  const handleTheme = (value) => {
    setUiTheme(value);
    try {
      if (typeof storageKeys?.THEME !== 'undefined') localStorage.setItem(storageKeys.THEME, value);
    } catch (_) {}
  };

  const handleSidebarDefault = (collapsed) => {
    setSidebarCollapsed(collapsed);
    try {
      if (typeof storageKeys?.SIDEBAR !== 'undefined') localStorage.setItem(storageKeys.SIDEBAR, String(collapsed));
    } catch (_) {}
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={fadeUp}>
      <motion.div variants={fadeUp} className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
        <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-primary" /> المظهر
        </h3>
        <p className="text-sm text-base-content/60 mb-4">اختر المظهر المناسب للواجهة. التلقائي يتبع إعدادات جهازك.</p>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTheme(opt.value)}
              className={`btn rounded-2xl font-bold gap-2 ${uiTheme === opt.value ? 'btn-primary' : 'btn-outline btn-ghost'}`}
            >
              <opt.icon className="w-5 h-5" />
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
        <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-4">
          <PanelLeft className="w-5 h-5 text-primary" /> الشريط الجانبي
        </h3>
        <p className="text-sm text-base-content/60 mb-4">الوضع الافتراضي عند فتح التطبيق (يمكنك تغييره في أي وقت من زر طي القائمة).</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSidebarDefault(false)}
            className={`btn rounded-2xl font-bold gap-2 ${!sidebarCollapsed ? 'btn-primary' : 'btn-outline btn-ghost'}`}
          >
            <PanelLeft className="w-5 h-5" />
            مفتوح
          </button>
          <button
            type="button"
            onClick={() => handleSidebarDefault(true)}
            className={`btn rounded-2xl font-bold gap-2 ${sidebarCollapsed ? 'btn-primary' : 'btn-outline btn-ghost'}`}
          >
            <PanelLeftClose className="w-5 h-5" />
            مطوي
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
