import { useState } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';

export default function ReauthModal({
  userEmail,
  onConfirm,
  onClose,
  title = 'تأكيد هويتك',
  message = 'أدخل كلمة المرور الحالية للمتابعة',
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('أدخل كلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      setError(err?.message || 'كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-amber-500/90 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg">
            <Lock className="w-6 h-6" /> {title}
          </span>
          <button type="button" onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-slate-600 text-sm">{message}</p>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور الحالية</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-amber-200"
              disabled={loading}
            />
          </div>
          {error && <p className="text-rose-600 text-sm font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null} تأكيد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
