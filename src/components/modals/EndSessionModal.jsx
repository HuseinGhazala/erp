import { useState } from 'react';
import { X, Plus, Trash2, ListTodo } from 'lucide-react';

export default function EndSessionModal({
  onConfirm,
  onCancel,
}) {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addItem = () => {
    const text = input.trim();
    if (!text) return;
    setItems([...items, text]);
    setInput('');
    setError('');
  };

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('يجب إضافة عمل واحد على الأقل قبل إنهاء الجلسة');
      return;
    }
    onConfirm(items);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-rose-500 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><ListTodo className="w-6 h-6"/> تسجيل الأعمال المنجزة</span>
          <button type="button" onClick={onCancel} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-slate-600 text-sm mb-4 font-medium">
            يجب إضافة الأعمال التي أنجزتها اليوم قبل إنهاء الجلسة <span className="text-rose-500 font-bold">(مطلوب)</span>
          </p>
          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
              placeholder="مثال: إنهاء التقرير الشهري"
              className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button type="button" onClick={addItem} className="p-4 rounded-2xl bg-slate-800 text-white hover:bg-black transition">
              <Plus className="w-6 h-6"/>
            </button>
          </div>
          {items.length > 0 && (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="flex-1 text-slate-800 font-medium">{item}</span>
                  <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-slate-400 hover:text-rose-500 transition">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
            <button type="submit" disabled={items.length === 0} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed">
              إنهاء الجلسة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
