import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
        <div className="bg-warning/90 text-warning-content p-6 flex justify-between items-center">
          <span className="font-bold flex items-center gap-3 text-lg">
            <Lock className="w-6 h-6" /> {title}
          </span>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-warning-content hover:bg-white/20" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-base-content/70 text-sm">{message}</p>
          <div className="form-control">
            <label className="label"><span className="label-text font-bold">كلمة المرور الحالية</span></label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••"
              autoComplete="current-password"
              className="input input-bordered rounded-2xl w-full bg-base-200/50"
              disabled={loading}
            />
          </div>
          {error && <p className="text-error text-sm font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 rounded-xl font-bold">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="btn btn-warning flex-1 rounded-xl font-bold gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null} تأكيد
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
