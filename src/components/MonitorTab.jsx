import { Eye, Camera, Monitor, Loader2, Trash2 } from 'lucide-react';

export default function MonitorTab({
  isAdmin,
  isWorking,
  monitoringEnabled,
  adminGalleryLoading,
  adminGalleryScreenshots,
  screenshots,
  setScreenshots,
  takeScreenshot,
}) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black flex items-center gap-4 text-slate-800">
            <Eye className="text-indigo-600 w-8 h-8"/>
            معرض التتبع الرقمي
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {isAdmin ? 'لقطات شاشة لجميع الموظفين' : 'سجل بصري لنشاط العمل المسجل في الجلسة الحالية'}
          </p>
        </div>
        {!isAdmin && isWorking && monitoringEnabled && (
          <button onClick={takeScreenshot} className="text-sm bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-bold">
            <Camera className="w-5 h-5"/> التقاط صورة يدوية
          </button>
        )}
      </div>

      {isAdmin ? (
        adminGalleryLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin"/></div>
        ) : adminGalleryScreenshots.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
            <Monitor className="w-20 h-20 mx-auto mb-6 opacity-5"/>
            <p className="text-xl font-bold">لا توجد لقطات مسجلة من الموظفين</p>
            <p className="text-sm mt-2 font-medium">ستظهر اللقطات هنا عندما يلتقط الموظفون صوراً من أجهزتهم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminGalleryScreenshots.map(img => (
              <div key={img.id} className="group relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {img.url ? (
                  <a href={img.url} target="_blank" rel="noopener noreferrer" className="block w-full h-56 overflow-hidden cursor-pointer">
                    <img src={img.url} alt="لقطة" className="w-full h-56 object-cover" />
                  </a>
                ) : <div className="w-full h-56 bg-slate-200 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400"/></div>}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <span className="bg-slate-800/90 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-md">{img.full_name}</span>
                  {img.is_virtual && <span className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest">Simulated</span>}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex flex-col text-white">
                    <span className="font-black text-lg">{img.time_display || '—'}</span>
                    <span className="text-xs opacity-80">{img.full_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : screenshots.length === 0 ? (
        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
          <Monitor className="w-20 h-20 mx-auto mb-6 opacity-5"/>
          <p className="text-xl font-bold">لا توجد سجلات بصرية حالياً</p>
          <p className="text-sm mt-2 font-medium">سيقوم النظام بالتقاط الصور آلياً كل 10 دقائق فور تفعيل المراقبة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {screenshots.map(img => (
            <div key={img.id} className="group relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img src={img.data} alt="Screen" className="w-full h-56 object-cover" />
              <div className="absolute top-4 right-4 z-20">
                {img.isVirtual && <span className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest">Simulated</span>}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex justify-between items-center text-white">
                  <div className="flex flex-col">
                    <span className="font-black text-lg">{img.time}</span>
                    <span className="text-[10px] opacity-70 font-mono">ID: {img.id.toString().slice(-8)}</span>
                  </div>
                  <button onClick={() => setScreenshots(prev => prev.filter(s => s.id !== img.id))} className="bg-white/20 hover:bg-rose-500 p-2.5 rounded-xl transition-all backdrop-blur-md">
                    <Trash2 className="w-5 h-5 text-white"/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
