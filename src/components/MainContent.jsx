import Dashboard from './Dashboard';
import TasksTab from './TasksTab';
import MonitorTab from './MonitorTab';
import HistoryTab from './HistoryTab';
import AdminPanel from './AdminPanel';

export default function MainContent({
  activeTab,
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
          takeScreenshot={takeScreenshot}
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
          adminGalleryScreenshots={adminGalleryScreenshots}
        />
      )}
    </main>
  );
}
