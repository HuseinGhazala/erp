import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, Loader2, Calendar } from 'lucide-react';

const parseDurationToSeconds = (dur) => {
  if (!dur) return 0;
  const asTime = /^(\d+):(\d+):(\d+)$/.exec(dur);
  if (asTime) return parseInt(asTime[1], 10) * 3600 + parseInt(asTime[2], 10) * 60 + parseInt(asTime[3], 10);
  const asHM = /(\d+)\s*h[^\d]*(\d*)\s*m?/i.exec(dur);
  if (asHM) return (parseInt(asHM[1], 10) * 3600) + (parseInt(asHM[2] || '0', 10) * 60);
  return 0;
};

const formatSecondsToHM = (sec) =>
  sec == null || sec === 0 ? '0:00' : `${Math.floor(sec / 3600)}:${Math.floor((sec % 3600) / 60).toString().padStart(2, '0')}`;

const getWorkingDaysInMonth = (year, month) => {
  const d = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= lastDay; day++) {
    d.setDate(day);
    if (d.getDay() !== 5) count++;
  }
  return count;
};

function countLeaveDaysInMonth(startDate, endDate, monthStart, monthEnd) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const mStart = new Date(monthStart);
  const mEnd = new Date(monthEnd);
  const from = start > mStart ? start : mStart;
  const to = end < mEnd ? end : mEnd;
  if (from > to) return 0;
  let days = 0;
  const d = new Date(from);
  while (d <= to) {
    if (d.getDay() !== 5) days++;
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function buildCSV(rows, year, month) {
  const headers = ['الاسم', 'المسمى الوظيفي', 'ساعات العمل', 'عدد الجلسات', 'مهام منجزة', 'أيام إجازة معتمدة', 'الراتب الشهري (ج.م)', 'الراتب المحسوب (ج.م)'];
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    const row = [
      `"${(r.full_name || '').replace(/"/g, '""')}"`,
      `"${(r.job_title || '').replace(/"/g, '""')}"`,
      r.hoursFormatted,
      r.sessionsCount,
      r.tasksCompleted,
      r.leaveDays ?? 0,
      r.monthlySalary != null ? r.monthlySalary : '',
      r.calculated != null ? r.calculated : '',
    ];
    lines.push(row.join(','));
  });
  const BOM = '\uFEFF';
  return BOM + lines.join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ReportsTab({ supabase }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
    try {
      const [profilesRes, sessionsRes, leaveRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, role, job_title, monthly_salary').order('full_name'),
        supabase.from('work_sessions').select('user_id, duration, tasks_completed').gte('date', monthStart).lte('date', monthEnd),
        supabase.from('leave_requests').select('user_id, start_date, end_date').eq('status', 'approved'),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      const employees = (profilesRes.data || []).filter((p) => p.role !== 'محذوف');
      const sessions = sessionsRes.data || [];
      const leaveRequests = leaveRes.data || [];
      const workingDays = getWorkingDaysInMonth(year, month);
      const expectedHours = workingDays * 4;
      const byUser = {};
      sessions.forEach((s) => {
        const uid = s.user_id;
        if (!byUser[uid]) byUser[uid] = { seconds: 0, count: 0, tasks: 0 };
        byUser[uid].seconds += parseDurationToSeconds(s.duration);
        byUser[uid].count += 1;
        byUser[uid].tasks += s.tasks_completed || 0;
      });
      const leaveDaysByUser = {};
      leaveRequests.forEach((lr) => {
        const days = countLeaveDaysInMonth(lr.start_date, lr.end_date, monthStart, monthEnd);
        if (days > 0) leaveDaysByUser[lr.user_id] = (leaveDaysByUser[lr.user_id] || 0) + days;
      });
      const list = employees.map((emp) => {
        const data = byUser[emp.id] || { seconds: 0, count: 0, tasks: 0 };
        const actualHours = data.seconds / 3600;
        const monthlySalary = emp.monthly_salary != null ? parseFloat(emp.monthly_salary) : null;
        let calculated = null;
        if (monthlySalary != null && expectedHours > 0) {
          const ratio = Math.min(actualHours / expectedHours, 1);
          calculated = Math.round(monthlySalary * ratio * 100) / 100;
        }
        return {
          full_name: emp.full_name || 'بدون اسم',
          job_title: emp.job_title || 'موظف',
          hoursFormatted: formatSecondsToHM(data.seconds),
          hoursSeconds: data.seconds,
          sessionsCount: data.count,
          tasksCompleted: data.tasks,
          leaveDays: leaveDaysByUser[emp.id] || 0,
          monthlySalary,
          calculated,
          expectedHours,
          workingDays,
        };
      });
      setRows(list);
    } catch (err) {
      setError(err?.message || 'فشل تحميل التقرير');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, year, month]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCSV = () => {
    const filename = `تقرير-${year}-${String(month).padStart(2, '0')}.csv`;
    downloadCSV(buildCSV(rows, year, month), filename);
  };

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = monthNames.map((name, i) => ({ value: i + 1, label: name }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card card-soft bg-base-100 p-6 md:p-10 hover-lift"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-base-content flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> التقارير والتصدير
          </h2>
          <p className="text-sm text-base-content/50">تقارير شهرية للموظفين — ساعات العمل، الجلسات، المهام، الرواتب المحسوبة</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-base-content/50" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="select select-bordered select-sm rounded-xl bg-base-200/50 border-base-300"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="select select-bordered select-sm rounded-xl bg-base-200/50 border-base-300"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl font-bold gap-2"
            disabled={loading || rows.length === 0}
            onClick={handleExportCSV}
            title="تصدير Excel (CSV)"
          >
            <FileSpreadsheet className="w-5 h-5" />
            تصدير Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error rounded-2xl mb-6">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={loadReport}>إعادة المحاولة</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-base-content/60 font-medium">جاري تحميل التقرير...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-base-content/50">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-bold">لا يوجد موظفون أو لا توجد بيانات لهذا الشهر</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-200">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/80">
                <th className="text-right rounded-t-right-xl font-black">الاسم</th>
                <th className="text-right font-black">المسمى</th>
                <th className="text-right font-black">ساعات العمل</th>
                <th className="text-right font-black">عدد الجلسات</th>
                <th className="text-right font-black">مهام منجزة</th>
                <th className="text-right font-black">أيام إجازة</th>
                <th className="text-right font-black">الراتب الشهري</th>
                <th className="text-right font-black rounded-t-left-xl">الراتب المحسوب</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-base-200">
                  <td className="font-bold">{r.full_name}</td>
                  <td className="text-base-content/80">{r.job_title}</td>
                  <td className="font-mono font-medium">{r.hoursFormatted}</td>
                  <td>{r.sessionsCount}</td>
                  <td>{r.tasksCompleted}</td>
                  <td>{r.leaveDays ?? 0}</td>
                  <td>{r.monthlySalary != null ? r.monthlySalary.toLocaleString('ar-EG') : '—'}</td>
                  <td className="text-primary font-bold">{r.calculated != null ? r.calculated.toLocaleString('ar-EG') + ' ج.م' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <p className="text-xs text-base-content/50 mt-4 text-left">
          الراتب المحسوب = (ساعات العمل ÷ {rows[0]?.expectedHours ?? 0} ساعة متوقعة) × الراتب الشهري. أيام العمل: {rows[0]?.workingDays ?? 0} (الجمعة إجازة).
        </p>
      )}
    </motion.div>
  );
}
