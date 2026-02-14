import { UserPlus, X } from 'lucide-react';

export default function AddEmployeeModal({
  addEmpSuccess,
  newEmpEmail,
  setNewEmpEmail,
  newEmpName,
  setNewEmpName,
  newEmpPassword,
  setNewEmpPassword,
  addEmpError,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><UserPlus className="w-6 h-6"/> إضافة موظف جديد</span>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        {addEmpSuccess ? (
          <div className="p-6 text-center">
            <p className="text-emerald-600 font-bold mb-4">تم إنشاء الحساب بنجاح.</p>
            <p className="text-slate-500 text-sm mb-4">أعطِ الموظف البريد الإلكتروني وكلمة المرور المؤقتة لتسجيل الدخول.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold">إغلاق</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input type="email" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="employee@company.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">اسم الموظف</label>
              <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="اختياري" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">كلمة مرور مؤقتة (6+ أحرف)</label>
              <input type="password" value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} required minLength={6} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="••••••••" />
            </div>
            {addEmpError && <p className="text-rose-600 text-sm font-medium">{addEmpError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">إنشاء الحساب</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
