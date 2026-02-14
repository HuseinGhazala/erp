import Dashboard from './Dashboard';
import TasksTab from './TasksTab';
import MonitorTab from './MonitorTab';
import HistoryTab from './HistoryTab';
import LeaveTab from './LeaveTab';
import ReportsTab from './ReportsTab';
import AdminPanel from './AdminPanel';
import SettingsTab from './SettingsTab';

export default function MainContent({
  activeTab,
  setActiveTab,
  isAdmin,
  user,
  displayName,
  displayRole,
  avatarDisplayUrl,
  elapsedTime,
  formatTime,
  isWorking,
  handleToggleWork,
  dailyDisplay,
  screenshots,
  tasks,
  setTasks,
  newTask,
  setNewTask,
  monitoringEnabled,
  supabase,
  syncTaskToSupabase,
  onAddTask,
  // monitor
  adminGalleryLoading,
  adminGalleryScreenshots,
  setScreenshots,
  takeScreenshot,
  // history
  history,
  adminHistory,
  activeUserIds,
  adminHistoryLoading,
  adminHistoryError,
  loadAdminHistory,
  // admin
  adminLoading,
  adminScreenshotInterval,
  setAdminScreenshotInterval,
  handleSaveScreenshotInterval,
  activeEmployees,
  disabledEmployees,
  employeeDailyHours,
  employeeSalaryData,
  formatSecondsToHM,
  openAddTaskForEmployee,
  openActivityForEmployee,
  openSalaryEdit,
  handleRequestScreenshotForEmployee,
  handleDeleteEmployee,
  handleRestoreEmployee,
  requestingScreenshotFor,
  setShowAddEmployeeModal,
  setAddEmpError,
  setAddEmpSuccess,
  refetchAdminEmployees,
  aiLoading,
  callGemini,
  callGeminiWeeklySummary,
  adminDailySummary,
  uiTheme,
  setUiTheme,
  sidebarCollapsed,
  setSidebarCollapsed,
  storageKeys,
  setToastMessage,
}) {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24">
      {activeTab === 'dashboard' && (
        <Dashboard
          user={user}
          displayName={displayName}
          displayRole={displayRole}
          avatarDisplayUrl={avatarDisplayUrl}
          elapsedTime={elapsedTime}
          formatTime={formatTime}
          isWorking={isWorking}
          handleToggleWork={handleToggleWork}
          dailyDisplay={dailyDisplay}
          screenshots={screenshots}
          tasks={tasks}
          monitoringEnabled={monitoringEnabled}
          isAdmin={isAdmin}
          adminDailySummary={adminDailySummary}
        />
      )}

      {activeTab === 'monitor' && (
        <MonitorTab
          isAdmin={isAdmin}
          isWorking={isWorking}
          monitoringEnabled={monitoringEnabled}
          adminGalleryLoading={adminGalleryLoading}
          adminGalleryScreenshots={adminGalleryScreenshots}
          screenshots={screenshots}
          setScreenshots={setScreenshots}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksTab
          tasks={tasks}
          setTasks={setTasks}
          newTask={newTask}
          setNewTask={setNewTask}
          user={user}
          supabase={supabase}
          syncTaskToSupabase={syncTaskToSupabase}
          onAddTask={onAddTask}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab
          history={isAdmin ? adminHistory : history}
          isAdminView={!!isAdmin}
          activeUserIds={isAdmin ? activeUserIds : undefined}
          historyLoading={isAdmin ? adminHistoryLoading : undefined}
          historyError={isAdmin ? adminHistoryError : undefined}
          onRefresh={isAdmin ? loadAdminHistory : undefined}
        />
      )}

      {activeTab === 'leave' && <LeaveTab supabase={supabase} user={user} isAdmin={isAdmin} />}

      {activeTab === 'settings' && (
        <SettingsTab
          uiTheme={uiTheme}
          setUiTheme={setUiTheme}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          storageKeys={storageKeys}
        />
      )}

      {activeTab === 'reports' && isAdmin && <ReportsTab supabase={supabase} />}

      {activeTab === 'admin' && isAdmin && (
        <AdminPanel
          adminLoading={adminLoading}
          adminScreenshotInterval={adminScreenshotInterval}
          setAdminScreenshotInterval={setAdminScreenshotInterval}
          handleSaveScreenshotInterval={handleSaveScreenshotInterval}
          activeEmployees={activeEmployees}
          disabledEmployees={disabledEmployees}
          employeeDailyHours={employeeDailyHours}
          employeeSalaryData={employeeSalaryData}
          formatSecondsToHM={formatSecondsToHM}
          openAddTaskForEmployee={openAddTaskForEmployee}
          openActivityForEmployee={openActivityForEmployee}
          openSalaryEdit={openSalaryEdit}
          handleRequestScreenshotForEmployee={handleRequestScreenshotForEmployee}
          handleDeleteEmployee={handleDeleteEmployee}
          handleRestoreEmployee={handleRestoreEmployee}
          requestingScreenshotFor={requestingScreenshotFor}
          setShowAddEmployeeModal={setShowAddEmployeeModal}
          setAddEmpError={setAddEmpError}
          setAddEmpSuccess={setAddEmpSuccess}
          refetchAdminEmployees={refetchAdminEmployees}
          aiLoading={aiLoading}
          callGemini={callGemini}
          callGeminiWeeklySummary={callGeminiWeeklySummary}
          adminGalleryScreenshots={adminGalleryScreenshots}
          setToastMessage={setToastMessage}
          activeUserIds={activeUserIds}
          adminDailySummary={adminDailySummary}
          setActiveTab={setActiveTab}
        />
      )}
    </main>
  );
}
