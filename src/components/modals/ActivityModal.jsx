import { Activity, X, ListTodo, History, Eye, CheckCircle } from 'lucide-react';

export default function ActivityModal({
  employee,
  employeeDailyHours,
  formatSecondsToHM,
  adminActivityData,
  onClose,
}) {
  if (!employee) return null;
  const { sessions, tasks, screenshots } = adminActivityData;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 animate-in my-8 max-h-[90vh] flex flex-col">
        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
          <div>
            <span className="font-bold flex items-center gap-3 text-lg"><Activity className="w-6 h-6"/> متابعة نشاط: {employee.full_name}</span>
            <p className="text-indigo-300 text-sm mt-1 font-bold">ساعات اليوم: {formatSecondsToHM(employeeDailyHours[employee.id])}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2"><ListTodo className="w-5 h-5 text-indigo-600"/> المهام ({tasks.length})</h3>
          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {tasks.length === 0 ? <p className="text-slate-400 text-sm">لا توجد مهام</p> : tasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${t.completed ? 'text-emerald-500' : 'text-slate-300'}`}/>
                <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-800 font-medium'}>{t.text}</span>
              </div>
            ))}
          </div>
          <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600"/> جلسات العمل ({sessions.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.length === 0 ? <p className="text-slate-400 text-sm">لا توجد جلسات مسجلة</p> : sessions.map((h, i) => {
              const workItems = Array.isArray(h.work_summary) ? h.work_summary : [];
              return (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{h.dateDisplay || h.date}</p>
                      <p className="text-xs text-slate-500 font-mono">{h.start_time} — {h.end_time}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-indigo-600">{h.duration}</p>
                      <p className="text-[10px] text-slate-400">{h.tasks_completed} مهام منجزة</p>
                    </div>
                  </div>
                  {workItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">الأعمال المنجزة:</p>
                      <ul className="space-y-1">
                        {workItems.map((item, j) => (
                          <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"/>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <h3 className="font-black text-slate-800 mb-3 mt-6 flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-600"/> لقطات الشاشة ({screenshots.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
            {screenshots.length === 0 ? <p className="text-slate-400 text-sm col-span-full">لا توجد لقطات محفوظة</p> : screenshots.map((s) => (
              <div key={s.id} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group/card">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="block w-full h-28 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={s.url} alt="لقطة" className="w-full h-28 object-cover" />
                  </a>
                ) : <div className="w-full h-28 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">جاري التحميل</div>}
                <div className="p-2 text-center">
                  <p className="text-xs font-bold text-slate-600">{s.time_display || '—'}</p>
                  {s.is_virtual && <span className="text-[10px] text-amber-600 font-bold">افتراضي</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
