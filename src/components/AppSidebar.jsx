import { motion } from 'framer-motion';
import { Clock, LayoutDashboard, ListTodo, Monitor, History, ShieldCheck, PanelLeftClose, PanelLeft } from 'lucide-react';

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { id: 'tasks', icon: ListTodo, label: 'المهام' },
  { id: 'monitor', icon: Monitor, label: 'التتبع' },
  { id: 'history', icon: History, label: 'السجل' },
];

export default function AppSidebar({ activeTab, setActiveTab, isAdmin, collapsed, onToggleCollapse }) {
  const tabs = isAdmin ? [...TABS, { id: 'admin', icon: ShieldCheck, label: 'الإدارة' }] : TABS;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed top-0 bottom-0 z-30 flex flex-col bg-base-100 border-l border-base-200/80 shadow-soft overflow-hidden"
      style={{ right: 0 }}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center border-b border-base-200/60 shrink-0 min-h-[4rem] ${collapsed ? 'justify-center p-2' : 'gap-3 p-4'}`}>
        <div className="bg-primary text-primary-content p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-lg font-black text-base-content truncate">Trackify AI</h1>
            <p className="text-xs text-base-content/50 font-bold">لوحة الموظفين</p>
          </div>
        )}
      </div>

      {/* Nav links - Nuxt UI dashboard style: vertical list */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
            } ${collapsed ? 'justify-center' : ''}`}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-bold text-sm truncate">{tab.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-base-200/60 shrink-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="btn btn-ghost btn-sm w-full gap-2 rounded-xl text-base-content/60 hover:text-base-content"
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-bold">طي القائمة</span>}
        </button>
      </div>
    </motion.aside>
  );
}
