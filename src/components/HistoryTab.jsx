import { History } from 'lucide-react';

export default function HistoryTab({ history }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
      <h2 className="text-3xl font-black mb-10 text-slate-800">الأرشيف الزمني</h2>
      <div className="space-y-5">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <History className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-xl">{h.dateDisplay || h.date}</p>
                <p className="text-sm text-slate-400 font-mono tracking-wider">{h.start} — {h.end}</p>
              </div>
            </div>
            <div className="text-left bg-indigo-50 px-8 py-4 rounded-[1.5rem] border border-indigo-100 shadow-sm">
              <p className="text-3xl font-black text-indigo-600 tracking-tighter">{h.duration}</p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{h.tasks} Tasks Accomplished</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
