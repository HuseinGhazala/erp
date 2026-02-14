import { User, Monitor, Zap, Clock, Sparkles, Loader2 } from 'lucide-react';

export default function Dashboard({
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
  aiLoading,
  callGemini,
  monitoringEnabled,
}) {
  return (
    <div className="space-y-6">
      {user && (
        <div className="bg-gradient-to-l from-indigo-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-xl text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur overflow-hidden">
              {avatarDisplayUrl ? <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover"/> : <User className="w-9 h-9"/>}
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold">مرحباً،</p>
              <h2 className="text-2xl font-black">{displayName}</h2>
              <p className="text-white/70 text-xs font-medium mt-0.5">{displayRole} • {user.email || '—'}</p>
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">لوحتك الخاصة</p>
            <p className="text-3xl font-black">Trackify</p>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white text-center relative overflow-hidden group">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <h2 className="text-slate-400 mb-2 font-bold tracking-widest text-sm uppercase">وقت العمل المسجل اليوم</h2>
        <div className="text-8xl font-black text-slate-800 mb-10 tracking-tighter tabular-nums">{formatTime(elapsedTime)}</div>
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleToggleWork}
            className={`px-16 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl transform active:scale-95 hover:-translate-y-1 ${isWorking ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
          >
            {isWorking ? "إنهاء جلسة العمل" : "بدء جلسة العمل"}
          </button>
          {isWorking && (
            <div className="bg-slate-50 p-6 rounded-[2.5rem] w-full max-w-md border border-slate-100 mt-4 text-right shadow-sm">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-500"/>
                <span className="text-sm font-black text-slate-700">تتبع النشاط الآلي</span>
                {monitoringEnabled && (
                  <span className="flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold animate-pulse">
                    <Zap className="w-3 h-3"/> نشط
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
          <div className="flex justify-between items-start z-10">
            <p className="opacity-60 text-xs font-bold uppercase tracking-widest">إجمالي ساعاتك اليومية</p>
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-5xl font-black mt-6 z-10">{dailyDisplay} <span className="text-lg font-medium opacity-40">ساعة</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between group">
          <div>
            <p className="text-slate-400 mb-1 text-xs font-bold uppercase tracking-widest">لقطات التتبع المسجلة</p>
            <h3 className="text-5xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{screenshots.length}</h3>
          </div>
          <button
            disabled={aiLoading}
            onClick={() => callGemini(`حلل لي هذا اليوم: ${formatTime(elapsedTime)} عمل، ${screenshots.length} لقطة، و ${tasks.filter(t=>t.completed).length} مهام مكتملة.`)}
            className="bg-indigo-50 text-indigo-600 p-6 rounded-[2rem] hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-lg shadow-indigo-100 active:scale-90"
          >
            {aiLoading ? <Loader2 className="animate-spin w-8 h-8"/> : <Sparkles className="w-8 h-8"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
