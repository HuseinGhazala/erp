import { motion } from 'framer-motion';
import { Clock, LayoutDashboard, ListTodo, Monitor, History, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { id: 'tasks', icon: ListTodo, label: 'المهام' },
  { id: 'monitor', icon: Monitor, label: 'التتبع' },
  { id: 'history', icon: History, label: 'السجل' },
];

export default function Nav({ activeTab, setActiveTab, displayName, isAdmin }) {
  const tabs = isAdmin ? [...TABS, { id: 'admin', icon: ShieldCheck, label: 'الإدارة' }] : TABS;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl bg-base-100/90 backdrop-blur-xl shadow-soft rounded-3xl mb-6 p-3 md:p-4 flex flex-wrap justify-between items-center gap-4 border border-base-200/60 sticky top-4 z-40 hover-lift"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-content p-2.5 rounded-2xl shadow-lg shadow-primary/20">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-black text-base-content tracking-tight">Trackify AI</h1>
          <p className="text-xs text-base-content/50 font-bold mt-0.5">لوحة {displayName}</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm md:btn-md gap-2 rounded-2xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'btn-primary shadow-md shadow-primary/20'
                : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200'
            }`}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="hidden sm:inline text-sm font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
