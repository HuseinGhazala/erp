import { Plus, X } from 'lucide-react';

export default function AddTaskModal({ employee, adminTaskText, setAdminTaskText, onSubmit, onClose }) {
  if (!employee) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-amber-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><Plus className="w-6 h-6"/> إضافة مهمة لـ {employee.full_name}</span>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <input value={adminTaskText} onChange={e => setAdminTaskText(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-amber-200 text-lg" placeholder="نص المهمة..." required />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700">إضافة</button>
          </div>
        </form>
      </div>
    </div>
  );
}
