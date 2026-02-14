import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Settings2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

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
  aiLoading,
  callGemini,
  adminGalleryScreenshots = [],
}) {
  const [adminTab, setAdminTab] = useState('employees');
  const [savingInterval, setSavingInterval] = useState(false);
  const [aiSelectedEmployeeId, setAiSelectedEmployeeId] = useState('all');

  const handleSaveInterval = async () => {
    setSavingInterval(true);
    await handleSaveScreenshotInterval();
    setSavingInterval(false);
  };

  const openAddEmployee = () => {
    setShowAddEmployeeModal(true);
    setAddEmpError('');
    setAddEmpSuccess(false);
  };

  const tabs = [
    { id: 'employees', label: 'الموظفون', icon: Users, count: activeEmployees.length },
    { id: 'settings', label: 'الإعدادات', icon: Settings2 },
    { id: 'ai', label: 'الذكاء الاصطناعي', icon: Sparkles },
  ];
  if (disabledEmployees.length > 0) tabs.push({ id: 'disabled', label: 'المعطّلون', icon: UserMinus, count: disabledEmployees.length });

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={fadeUp}>
      {/* هيدر بنفس أسلوب الداشبورد */}
      <motion.div
        variants={fadeUp}
        className="bg-gradient-to-l from-primary to-primary/90 p-6 rounded-[2.5rem] shadow-card text-primary-content flex flex-wrap items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-bold">لوحة الإدارة</p>
            <h2 className="text-2xl font-black">إدارة الموظفين والإعدادات</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary bg-white/20 border-0 hover:bg-white/30 text-primary-content rounded-2xl font-bold gap-2" onClick={openAddEmployee}>
            <UserPlus className="w-5 h-5" /> إضافة موظف
          </button>
          <button
            type="button"
            className="btn btn-ghost bg-white/10 hover:bg-white/20 text-primary-content rounded-2xl font-bold gap-2"
            disabled={adminLoading}
            onClick={refetchAdminEmployees}
          >
            {adminLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            تحديث
          </button>
        </div>
      </motion.div>

      {/* تبويبات بأزرار مثل باقي المشروع */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAdminTab(t.id)}
            className={`btn gap-2 rounded-2xl font-bold ${
              adminTab === t.id ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count != null && t.count > 0 && <span className="badge badge-sm">{t.count}</span>}
          </button>
        ))}
      </motion.div>

      {/* محتوى التبويب: الموظفون */}
      {adminTab === 'employees' && (
        <motion.div variants={fadeUp} className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
          {adminLoading && activeEmployees.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-base-content/60 font-medium">جاري التحميل...</p>
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-base-content/40" />
              </div>
              <p className="font-black text-base-content text-lg">لا يوجد موظفون</p>
              <p className="text-sm text-base-content/50 mt-1 mb-6">أضف أول موظف من الزر أعلاه</p>
              <button type="button" className="btn btn-primary rounded-2xl font-bold gap-2" onClick={openAddEmployee}>
                <UserPlus className="w-5 h-5" /> إضافة أول موظف
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeEmployees.map((emp, i) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 rounded-2xl border border-base-300/50 hover:border-primary/20 hover:bg-base-200 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="avatar placeholder">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base-content truncate">{emp.full_name || 'بدون اسم'}</p>
                      <p className="text-sm text-base-content/50">{emp.role === 'admin' ? 'أدمن' : (emp.job_title || 'موظف')}</p>
                      {emp.role !== 'admin' && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                          <span className="text-base-content/60">اليوم: <span className="font-medium text-base-content">{formatSecondsToHM(employeeDailyHours[emp.id])}</span></span>
                          {employeeSalaryData[emp.id]?.calculated != null && (
                            <span className="text-primary font-medium">الراتب: {employeeSalaryData[emp.id].calculated.toLocaleString('ar-EG')} ج.م</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" className="btn btn-ghost btn-sm btn-square rounded-xl" onClick={() => openActivityForEmployee(emp)} title="النشاط" aria-label="النشاط">
                      <Activity className="w-5 h-5" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm btn-square rounded-xl" onClick={() => openAddTaskForEmployee(emp)} title="إضافة مهمة" aria-label="إضافة مهمة">
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square rounded-xl"
                      disabled={requestingScreenshotFor === emp.id}
                      onClick={() => handleRequestScreenshotForEmployee(emp)}
                      title="طلب لقطة"
                      aria-label="طلب لقطة"
                    >
                      {requestingScreenshotFor === emp.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    </button>
                    {emp.role !== 'admin' && (
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-sm btn-square rounded-xl" aria-label="المزيد">
                          <ChevronDown className="w-5 h-5" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 rounded-2xl bg-base-100 shadow-xl border border-base-200 w-52 mt-2">
                          <li><button type="button" onClick={() => openSalaryEdit(emp)}><DollarSign className="w-4 h-4" /> تعديل الراتب</button></li>
                          <li><button type="button" className="text-error" onClick={() => handleDeleteEmployee(emp)}><UserMinus className="w-4 h-4" /> تعطيل الحساب</button></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* محتوى التبويب: الإعدادات */}
      {adminTab === 'settings' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
            <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" /> مدة اللقطة التلقائية
            </h3>
            <p className="text-sm text-base-content/60 mb-4">كل موظف يلتقط لقطة شاشة تلقائياً كل هذه المدة أثناء جلسة العمل.</p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={adminScreenshotInterval}
                onChange={(e) => setAdminScreenshotInterval(Number(e.target.value))}
                className="select select-bordered rounded-2xl bg-base-200/50 border-base-300 max-w-[200px]"
              >
                {[1, 2, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>{m} دقيقة</option>
                ))}
              </select>
              <button type="button" className="btn btn-primary rounded-2xl font-bold" disabled={savingInterval} onClick={handleSaveInterval}>
                {savingInterval ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
          <div className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
            <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" /> حساب الرواتب
            </h3>
            <p className="text-sm text-base-content/60">٤ ساعات يومياً، والجمعة إجازة. حدّث الراتب الأساسي من قائمة «المزيد» بجانب كل موظف → تعديل الراتب.</p>
          </div>
        </motion.div>
      )}

      {/* محتوى التبويب: الذكاء الاصطناعي */}
      {adminTab === 'ai' && (
        <motion.div variants={fadeUp} className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
          <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" /> تحليل بالنص الاصطناعي
          </h3>
          <p className="text-sm text-base-content/60 mb-4">اختر موظفاً لتحليله لوحده، أو «جميع الفريق» للملخص العام. النتيجة تظهر في نافذة منبثقة.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-base-content/80 block mb-2">تحليل لـ</label>
              <select
                value={aiSelectedEmployeeId}
                onChange={(e) => setAiSelectedEmployeeId(e.target.value)}
                className="select select-bordered rounded-2xl bg-base-200/50 border-base-300 w-full max-w-xs"
              >
                <option value="all">جميع الفريق</option>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || 'بدون اسم'}
                    {emp.role === 'admin' ? ' (أدمن)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary rounded-2xl font-bold gap-2 w-full sm:w-auto"
              disabled={aiLoading}
              onClick={() => {
                if (aiSelectedEmployeeId === 'all') {
                  callGemini('لخص نشاط الفريق والإنتاجية اليوم بناءً على البيانات المتاحة. قدّم نصائح لتحسين الأداء.');
                  return;
                }
                const emp = activeEmployees.find((e) => e.id === aiSelectedEmployeeId);
                if (!emp) return;
                const hours = formatSecondsToHM(employeeDailyHours[emp.id]);
                const salaryData = employeeSalaryData[emp.id];
                const salary = salaryData?.calculated != null ? salaryData.calculated.toLocaleString('ar-EG') : '—';
                const screenshotCount = adminGalleryScreenshots.filter((s) => s.user_id === emp.id).length;
                const prompt = `تحليل أداء الموظف التالي فقط:\nالاسم: ${emp.full_name || 'بدون اسم'}\nالمسمى: ${emp.job_title || 'موظف'}\nساعات العمل المسجلة اليوم: ${hours}\nالراتب المحسوب: ${salary}\nعدد لقطات الشاشة المسجلة: ${screenshotCount}\n\nقدّم تحليلاً مختصراً لأداء هذا الموظف اليوم مع نصائح عملية لتحسين الإنتاجية.`;
                callGemini(prompt);
              }}
            >
              {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {aiLoading ? 'جاري التحليل...' : aiSelectedEmployeeId === 'all' ? 'تحليل نشاط الفريق' : 'تحليل الموظف المحدد'}
            </button>
          </div>
        </motion.div>
      )}

      {/* محتوى التبويب: المعطّلون */}
      {adminTab === 'disabled' && (
        <motion.div variants={fadeUp} className="card card-soft bg-base-100 p-6 md:p-8 hover-lift">
          <p className="text-sm text-base-content/60 mb-6">يمكنك إعادة تفعيل أي حساب ليتمكن من الدخول مرة أخرى.</p>
          <div className="space-y-3">
            {disabledEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-base-200/60 border border-base-300/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center text-base-content/60">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base-content">{emp.full_name || 'بدون اسم'}</p>
                    <p className="text-xs text-base-content/50">حساب معطّل</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-2xl font-bold gap-2"
                  onClick={() => handleRestoreEmployee(emp)}
                >
                  <UserPlus className="w-4 h-4" /> إعادة التفعيل
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
