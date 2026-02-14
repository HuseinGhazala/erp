import { DollarSign, X } from 'lucide-react';

export default function SalaryEditModal({ employee, salaryEditValue, setSalaryEditValue, onSave, onClose }) {
  if (!employee) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><DollarSign className="w-6 h-6"/> الراتب الشهري الأساسي — {employee.full_name}</span>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={onSave} className="p-6">
          <p className="text-slate-600 text-sm mb-4">الراتب الأساسي الكامل عند عمل ٤ ساعات يومياً (ما عدا الجمعة إجازة)</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={salaryEditValue}
            onChange={e => setSalaryEditValue(e.target.value)}
            placeholder="مثال: 5000"
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200 text-lg"
          />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
