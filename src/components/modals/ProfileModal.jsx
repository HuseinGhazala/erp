import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="card bg-base-100 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-base-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-primary text-primary-content p-6 flex justify-between items-center">
          <span className="font-bold flex items-center gap-3 text-lg">
            <User className="w-6 h-6" /> الملف الشخصي
          </span>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-primary-content hover:bg-white/20" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-bold text-base-content">الصورة الشخصية</label>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-base-200 border-2 border-base-300 overflow-hidden flex items-center justify-center">
                {profileAvatarPreview ? (
                  <img src={profileAvatarPreview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-base-content/30" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 btn btn-primary btn-sm rounded-xl cursor-pointer shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setProfileAvatarFile(f);
                      setProfileAvatarPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-base-content/50">اختر صورة (JPG, PNG)</p>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-bold">الاسم الكامل</span></label>
            <input
              type="text"
              value={profileEditName}
              onChange={e => setProfileEditName(e.target.value)}
              className="input input-bordered rounded-2xl w-full bg-base-200/50"
              placeholder="الاسم كما تريده في التطبيق"
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-bold">رقم الجوال</span></label>
            <input
              type="tel"
              value={profileEditPhone}
              onChange={e => setProfileEditPhone(e.target.value)}
              className="input input-bordered rounded-2xl w-full bg-base-200/50"
              placeholder="مثال: 05xxxxxxxx"
              dir="ltr"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 rounded-xl font-bold">
              إلغاء
            </button>
            <button type="submit" disabled={savingProfile} className="btn btn-primary flex-1 rounded-xl font-bold gap-2">
              {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : null} حفظ
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
