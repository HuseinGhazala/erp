import { motion } from 'framer-motion';
import { History, User } from 'lucide-react';

export default function HistoryTab({ history, isAdminView, activeUserIds }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card card-soft bg-base-100 p-6 md:p-10 hover-lift"
    >
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-base-content flex items-center gap-3">
        <History className="w-8 h-8 text-primary" /> الأرشيف الزمني
      </h2>
      {isAdminView && (
        <p className="text-sm text-base-content/50 mb-8">جلسات عمل جميع الموظفين — تتحدث تلقائياً مع السيرفر</p>
      )}
      <div className="space-y-4">
        {!history?.length ? (
          <p className="text-base-content/50 font-medium py-8 text-center">لا توجد جلسات مسجلة</p>
        ) : (
          history.map((h, i) => (
            <motion.div
              key={h.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6 bg-base-200/60 rounded-2xl border border-base-300/50 hover:border-primary/20 hover:bg-base-200 transition-all group"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <History className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div>
                  {isAdminView && h.full_name && (
                    <p className="flex items-center gap-2 text-sm font-bold text-primary mb-1 flex-wrap">
                      <User className="w-4 h-4" /> {h.full_name}
                      {activeUserIds?.includes(h.user_id) && (
                        <span className="badge badge-success badge-sm">نشط حالياً</span>
                      )}
                    </p>
                  )}
                  <p className="font-bold text-base-content text-lg md:text-xl">{h.dateDisplay || h.date}</p>
                  <p className="text-sm text-base-content/50 font-mono tracking-wider">{h.start} — {h.end}</p>
                </div>
              </div>
              <div className="text-left bg-primary/10 px-5 py-3 rounded-xl border border-primary/20">
                <p className="text-2xl md:text-3xl font-bold text-primary tracking-tighter">{h.duration}</p>
                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">{h.tasks ?? 0} مهام منجزة</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
