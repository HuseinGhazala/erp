import { ListTodo, X, Clock, AlertCircle } from 'lucide-react';
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
  sessionEndReminder,
  onDismissSessionReminder,
  onEndSessionClick,
  taskReminderDismissed,
  onDismissTaskReminder,
  incompleteTaskCount,
  supabase,
  toastMessage,
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

        {sessionEndReminder && (
          <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 animate-in" style={{ marginRight: sidebarCollapsed ? 88 : 276 }}>
            <div className="bg-primary text-primary-content rounded-2xl shadow-xl p-4 flex items-start gap-3 border border-primary/80">
              <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm">تذكير بإنهاء الجلسة</p>
                <p className="text-sm opacity-95 mt-1">قارب على ٤ ساعات. هل تريد إنهاء الجلسة وتدوين الأعمال؟</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" className="btn btn-sm bg-white/20 border-0 hover:bg-white/30 text-primary-content rounded-xl" onClick={onEndSessionClick}>إنهاء الآن</button>
                  <button type="button" className="btn btn-ghost btn-sm text-primary-content/90 rounded-xl" onClick={onDismissSessionReminder}>لاحقاً</button>
                </div>
              </div>
              <button type="button" onClick={onDismissSessionReminder} className="p-1 rounded-lg hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {incompleteTaskCount > 0 && !taskReminderDismissed && activeTab !== 'tasks' && (
          <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 animate-in" style={{ marginRight: sidebarCollapsed ? 88 : 276 }}>
            <div className="bg-info text-info-content rounded-2xl shadow-xl p-4 flex items-start gap-3 border border-info/80">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm">تذكير بالمهام</p>
                <p className="text-sm opacity-95 mt-1">لديك {incompleteTaskCount} مهمة غير منجزة</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" className="btn btn-sm bg-white/20 border-0 hover:bg-white/30 rounded-xl" onClick={() => { setActiveTab('tasks'); onDismissTaskReminder?.(); }}>انتقل للمهام</button>
                  <button type="button" className="btn btn-ghost btn-sm rounded-xl" onClick={onDismissTaskReminder}>إخفاء</button>
                </div>
              </div>
              <button type="button" onClick={onDismissTaskReminder} className="p-1 rounded-lg hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-50 animate-in" style={{ marginRight: sidebarCollapsed ? 88 : 276 }}>
            <div className="bg-success text-success-content rounded-2xl shadow-xl px-4 py-3 text-center font-bold text-sm">
              {toastMessage}
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
