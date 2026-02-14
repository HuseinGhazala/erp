import { Clock, LayoutDashboard, ListTodo, Monitor, History, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'tasks', icon: ListTodo },
  { id: 'monitor', icon: Monitor },
  { id: 'history', icon: History },
];

export default function Nav({ activeTab, setActiveTab, displayName, isAdmin }) {
  const tabs = isAdmin ? [...TABS, { id: 'admin', icon: ShieldCheck }] : TABS;
  return (
    <nav className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-sm rounded-3xl mb-8 p-4 flex justify-between items-center border border-white sticky top-4 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 text-white"><Clock className="w-6 h-6"/></div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Trackify AI</h1>
          <p className="text-xs text-slate-500 font-bold mt-0.5">لوحة {displayName}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <item.icon className="w-6 h-6"/>
          </button>
        ))}
      </div>
    </nav>
  );
}
