import { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  Users,
  UserPlus,
  Loader2,
  User,
  Plus,
  Activity,
  UserMinus,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';

export default function AdminPanel({
  adminLoading,
  adminScreenshotInterval,
  setAdminScreenshotInterval,
  handleSaveScreenshotInterval,
  activeEmployees,
  disabledEmployees,
  employeeDailyHours,
  formatSecondsToHM,
  openAddTaskForEmployee,
  openActivityForEmployee,
  handleRequestScreenshotForEmployee,
  handleDeleteEmployee,
  handleRestoreEmployee,
  requestingScreenshotFor,
  setShowAddEmployeeModal,
  setAddEmpError,
  setAddEmpSuccess,
  refetchAdminEmployees,
  employeeSalaryData,
  openSalaryEdit,
}) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [disabledOpen, setDisabledOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* ─── الهيدر ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-600"/>
            </div>
            لوحة الأدمن
          </h2>
          <p className="text-slate-500 text-sm mt-1">إدارة الموظفين، المهام، التتبع والرواتب</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddEmployeeModal(true); setAddEmpError(''); setAddEmpSuccess(false); }}
            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <UserPlus className="w-5 h-5"/> إضافة موظف
          </button>
          <button
            onClick={refetchAdminEmployees}
            disabled={adminLoading}
            className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
          >
            {adminLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : null} تحديث
          </button>
        </div>
      </div>

      {/* ─── الإعدادات (قابلة للطي) ─── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="font-black text-slate-800 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600"/> الإعدادات
          </span>
          {settingsOpen ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
        </button>
        {settingsOpen && (
          <div className="px-6 pb-6 pt-0 grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-indigo-600"/>
                <span className="font-bold text-slate-800">مدة اللقطة التلقائية</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">كل موظف يلتقط لقطة كل هذه المدة أثناء جلسة العمل</p>
              <div className="flex gap-2">
                <select value={adminScreenshotInterval} onChange={e => setAdminScreenshotInterval(Number(e.target.value))} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-sm">
                  {[1, 2, 5, 10, 15, 20, 30, 45, 60].map(m => (
                    <option key={m} value={m}>{m} دقيقة</option>
                  ))}
                </select>
                <button onClick={handleSaveScreenshotInterval} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">حفظ</button>
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600"/>
                <span className="font-bold text-slate-800">حساب الرواتب</span>
              </div>
              <p className="text-xs text-slate-600">٤ ساعات يومياً، الجمعة إجازة. حدّث الراتب الأساسي من زر «الراتب» لكل موظف</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── قائمة الموظفين ─── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600"/> الموظفون النشطون
            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{activeEmployees.length}</span>
          </h3>
        </div>

        {adminLoading && activeEmployees.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin"/></div>
        ) : activeEmployees.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400"/>
            </div>
            <p className="font-bold text-slate-600">لا يوجد موظفون مسجلون</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">سيظهرون بعد إنشاء حساباتهم</p>
            <button onClick={() => { setShowAddEmployeeModal(true); setAddEmpError(''); setAddEmpSuccess(false); }} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">
              إضافة أول موظف
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeEmployees.map((emp) => (
              <div key={emp.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                      <User className="w-7 h-7"/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 text-lg truncate">{emp.full_name || 'بدون اسم'}</p>
                      <p className="text-sm text-slate-500">
                        {emp.role === 'admin' ? 'أدمن' : (emp.job_title || 'موظف')}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {emp.role !== 'admin' && (
                          <>
                            <span className="text-xs font-bold text-indigo-600">
                              ساعات اليوم: {formatSecondsToHM(employeeDailyHours[emp.id])}
                            </span>
                            {employeeSalaryData[emp.id]?.calculated != null && (
                              <span className="text-xs font-bold text-emerald-600">
                                الراتب: {employeeSalaryData[emp.id].calculated.toLocaleString('ar-EG')}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openActivityForEmployee(emp)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4"/> النشاط
                    </button>
                    <button onClick={() => openAddTaskForEmployee(emp)} className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 flex items-center gap-2">
                      <Plus className="w-4 h-4"/> مهمة
                    </button>
                    <button onClick={() => handleRequestScreenshotForEmployee(emp)} disabled={requestingScreenshotFor === emp.id} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                      {requestingScreenshotFor === emp.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4"/>} لقطة
                    </button>
                    {emp.role !== 'admin' && (
                      <>
                        <button onClick={() => openSalaryEdit(emp)} className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 flex items-center gap-2">
                          <DollarSign className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDeleteEmployee(emp)} className="px-4 py-2.5 rounded-xl bg-rose-100 text-rose-600 text-sm font-bold hover:bg-rose-200 flex items-center gap-2">
                          <UserMinus className="w-4 h-4"/>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── موظفون معطّلون (قابل للطي) ─── */}
      {disabledEmployees.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setDisabledOpen(!disabledOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="font-black text-slate-600 flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-slate-500"/> موظفون معطّلون
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{disabledEmployees.length}</span>
            </span>
            {disabledOpen ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
          </button>
          {disabledOpen && (
            <div className="px-6 pb-6 pt-0 space-y-3">
              <p className="text-sm text-slate-500">يمكنك إعادة تفعيل أي حساب ليتمكن من الدخول مرة أخرى</p>
              {disabledEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                      <User className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">{emp.full_name || 'بدون اسم'}</p>
                      <p className="text-xs text-slate-400">معطّل</p>
                    </div>
                  </div>
                  <button onClick={() => handleRestoreEmployee(emp)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
                    <UserPlus className="w-4 h-4"/> إعادة التفعيل
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
