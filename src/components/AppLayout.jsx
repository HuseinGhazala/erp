import { ListTodo, X } from 'lucide-react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import Footer from './Footer';

export default function AppLayout({
  activeTab,
  setActiveTab,
  isAdmin,
  sidebarCollapsed,
  onToggleCollapse,
  displayName,
  avatarDisplayUrl,
  user,
  profile,
  onOpenProfile,
  onLogout,
  newTaskNotification,
  onDismissNotification,
  supabase,
  children,
}) {
  return (
    <>
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        collapsed={sidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      <div
        className="flex flex-col min-h-screen transition-[margin] duration-300 ease-out"
        style={{ marginRight: sidebarCollapsed ? 72 : 260 }}
      >
        <AppHeader
          activeTab={activeTab}
          displayName={displayName}
          avatarDisplayUrl={avatarDisplayUrl}
          user={user}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        {newTaskNotification && (
          <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 animate-in" style={{ marginRight: sidebarCollapsed ? 88 : 276 }}>
            <div className="bg-amber-500 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3 border border-amber-400">
              <ListTodo className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm">مهمة جديدة من الإدارة</p>
                <p className="text-sm opacity-95 mt-1 truncate">{newTaskNotification}</p>
                <button type="button" onClick={() => onDismissNotification()} className="text-xs underline mt-2 opacity-90">إغلاق</button>
              </div>
              <button type="button" onClick={() => onDismissNotification()} className="p-1 rounded-lg hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {children}

        <Footer
          displayName={displayName}
          user={user}
          profile={profile}
          avatarDisplayUrl={avatarDisplayUrl}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          supabase={supabase}
        />
      </div>
    </>
  );
}
