import { useState } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';

export default function AddTaskModal({ employee, adminTaskText, setAdminTaskText, onSubmit, onClose, onSuggestTasks }) {
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);

  if (!employee) return null;

  const handleSuggestTasks = async () => {
    if (typeof onSuggestTasks !== 'function') return;
    setSuggestLoading(true);
    setSuggestedTasks([]);
    try {
      const list = await onSuggestTasks(employee);
      setSuggestedTasks(Array.isArray(list) ? list : []);
    } finally {
      setSuggestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-amber-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><Plus className="w-6 h-6"/> إضافة مهمة لـ {employee.full_name}</span>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <input value={adminTaskText} onChange={e => setAdminTaskText(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-amber-200 text-lg" placeholder="نص المهمة..." required />
          {typeof onSuggestTasks === 'function' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSuggestTasks}
                disabled={suggestLoading}
                className="btn btn-outline btn-sm rounded-xl gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                {suggestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {suggestLoading ? 'جاري الاقتراح...' : 'اقتراح مهام بالذكاء الاصطناعي'}
              </button>
              {suggestedTasks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedTasks.map((task, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAdminTaskText(task)}
                      className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-100 text-right"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700">إضافة</button>
          </div>
        </form>
      </div>
    </div>
  );
}
