import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function BlockedScreen({ onLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card card-soft w-full max-w-md mt-16 p-8 md:p-10 text-center"
    >
      <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center text-error mx-auto mb-6">
        <ShieldAlert className="w-9 h-9" />
      </div>
      <h2 className="text-xl font-black text-base-content mb-2">حسابك معطّل</h2>
      <p className="text-base-content/60 text-sm mb-8">تم تعطيل حسابك من لوحة الإدارة. تواصل مع المسؤول لإعادة التفعيل.</p>
      <button onClick={onLogout} className="btn btn-neutral w-full rounded-2xl font-bold">
        تسجيل الخروج
      </button>
    </motion.div>
  );
}
