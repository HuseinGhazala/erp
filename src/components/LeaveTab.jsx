import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Send, Loader2, CheckCircle, XCircle, Clock, User } from 'lucide-react';

const LEAVE_TYPES = [
  { value: 'سنوية', label: 'إجازة سنوية' },
  { value: 'عارضة', label: 'إجازة عارضة' },
  { value: 'مرضية', label: 'إجازة مرضية' },
  { value: 'أخرى', label: 'أخرى' },
];

const STATUS_LABEL = { pending: 'قيد المراجعة', approved: 'معتمدة', rejected: 'مرفوضة' };
const STATUS_ICON = { pending: Clock, approved: CheckCircle, rejected: XCircle };
const STATUS_COLOR = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error' };

export default function LeaveTab({ supabase, user, isAdmin }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('سنوية');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [profiles, setProfiles] = useState({});

  const loadRequests = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    if (isAdmin) {
      const { data: rows } = await supabase
        .from('leave_requests')
        .select('id, user_id, start_date, end_date, leave_type, notes, status, admin_notes, created_at')
        .order('created_at', { ascending: false });
      const userIds = [...new Set((rows || []).map((r) => r.user_id))];
      const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const map = Object.fromEntries((profs || []).map((p) => [p.id, p.full_name || 'بدون اسم']));
      setProfiles(map);
      setRequests(rows || []);
    } else {
      const { data } = await supabase
        .from('leave_requests')
        .select('id, start_date, end_date, leave_type, notes, status, admin_notes, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setRequests(data || []);
    }
    setLoading(false);
  }, [supabase, user?.id, isAdmin]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!supabase || !user?.id) return;
    const start = startDate.trim();
    const end = endDate.trim();
    if (!start || !end) {
      setError('اختر تاريخ البداية والنهاية');
      return;
    }
    if (new Date(end) < new Date(start)) {
      setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('leave_requests').insert({
      user_id: user.id,
      start_date: start,
      end_date: end,
      leave_type: leaveType,
      notes: notes.trim() || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'فشل إرسال الطلب');
      return;
    }
    setStartDate('');
    setEndDate('');
    setNotes('');
    loadRequests();
  };

  const handleReview = async (id, status) => {
    if (!supabase) return;
    setReviewingId(id);
    await supabase
      .from('leave_requests')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq('id', id);
    setReviewingId(null);
    loadRequests();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card card-soft bg-base-100 p-6 md:p-10 hover-lift"
    >
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-base-content flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary" /> الإجازات وطلبات الغياب
      </h2>
      <p className="text-sm text-base-content/50 mb-8">
        {isAdmin ? 'عرض طلبات الإجازة من الموظفين والموافقة أو الرفض' : 'تقديم طلب إجازة ومتابعة حالة طلباتك'}
      </p>

      {!isAdmin && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-base-content mb-4">طلب إجازة جديد</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">من تاريخ</span></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input-bordered rounded-2xl w-full" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">إلى تاريخ</span></label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input input-bordered rounded-2xl w-full" required />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">نوع الإجازة</span></label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="select select-bordered rounded-2xl w-full">
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">ملاحظة (اختياري)</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="textarea textarea-bordered rounded-2xl w-full" rows={2} placeholder="سبب أو تفاصيل..." />
            </div>
            {error && <p className="text-error text-sm font-medium">{error}</p>}
            <button type="submit" className="btn btn-primary rounded-2xl font-bold gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              إرسال الطلب
            </button>
          </form>
        </div>
      )}

      <h3 className="text-lg font-bold text-base-content mb-4">{isAdmin ? 'جميع الطلبات' : 'طلباتي'}</h3>
      {loading ? (
        <div className="flex items-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-base-content/60">جاري التحميل...</span>
        </div>
      ) : requests.length === 0 ? (
        <p className="text-base-content/50 py-8">لا توجد طلبات</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const StatusIcon = STATUS_ICON[r.status] || Clock;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 rounded-2xl border border-base-300/50"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {isAdmin && (
                    <div className="flex items-center gap-2 text-base-content/80">
                      <User className="w-4 h-4" />
                      <span className="font-bold">{profiles[r.user_id] || r.user_id}</span>
                    </div>
                  )}
                  <span className="font-mono text-sm">{r.start_date} → {r.end_date}</span>
                  <span className="text-base-content/70">{r.leave_type}</span>
                  {r.notes && <span className="text-sm text-base-content/60">({r.notes})</span>}
                  <span className={`badge ${STATUS_COLOR[r.status] || ''}`}>
                    <StatusIcon className="w-3 h-3" /> {STATUS_LABEL[r.status]}
                  </span>
                  {r.admin_notes && <span className="text-xs text-base-content/50">ملاحظة: {r.admin_notes}</span>}
                </div>
                {isAdmin && r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success rounded-xl gap-1"
                      disabled={reviewingId === r.id}
                      onClick={() => handleReview(r.id, 'approved')}
                    >
                      {reviewingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      موافقة
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-error rounded-xl gap-1"
                      disabled={reviewingId === r.id}
                      onClick={() => handleReview(r.id, 'rejected')}
                    >
                      رفض
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
