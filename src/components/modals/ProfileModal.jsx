import { User, Camera, X, Loader2 } from 'lucide-react';

export default function ProfileModal({
  profileEditName,
  setProfileEditName,
  profileEditPhone,
  setProfileEditPhone,
  profileAvatarPreview,
  setProfileAvatarFile,
  setProfileAvatarPreview,
  savingProfile,
  onSave,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><User className="w-6 h-6"/> الملف الشخصي</span>
          <button type="button" onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <label className="block text-sm font-bold text-slate-700">الصورة الشخصية</label>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                {profileAvatarPreview ? (
                  <img src={profileAvatarPreview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:bg-indigo-700">
                <Camera className="w-4 h-4"/>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setProfileAvatarFile(f); setProfileAvatarPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
            <p className="text-xs text-slate-500">اختر صورة (JPG, PNG)</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
            <input type="text" value={profileEditName} onChange={e => setProfileEditName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="الاسم كما تريده في التطبيق" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رقم الجوال</label>
            <input type="tel" value={profileEditPhone} onChange={e => setProfileEditPhone(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="مثال: 05xxxxxxxx" dir="ltr" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
            <button type="submit" disabled={savingProfile} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2">
              {savingProfile ? <Loader2 className="w-5 h-5 animate-spin"/> : null} حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
