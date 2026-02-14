import { motion } from 'framer-motion';
import { User, Monitor, Zap, Clock } from 'lucide-react';

const stagger = {
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard({
  user,
  displayName,
  displayRole,
  avatarDisplayUrl,
  elapsedTime,
  formatTime,
  isWorking,
  handleToggleWork,
  dailyDisplay,
  screenshots,
  tasks,
  monitoringEnabled,
}) {
  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {user && (
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-l from-primary to-primary/90 p-6 rounded-[2.5rem] shadow-card text-primary-content flex flex-wrap items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur overflow-hidden">
                {avatarDisplayUrl ? (
                  <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl"><User className="w-9 h-9" /></span>
                )}
              </div>
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold">مرحباً،</p>
              <h2 className="text-2xl font-black">{displayName}</h2>
              <p className="text-white/70 text-xs font-medium mt-0.5">{displayRole} • {user.email || '—'}</p>
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">لوحتك الخاصة</p>
            <p className="text-3xl font-black">Trackify</p>
          </div>
        </motion.div>
      )}

      {/* uiverse-style gradient border card + HeroUI/Untitled clean layout */}
      <motion.div
        variants={fadeUp}
        className="card-gradient-border hover-lift"
      >
        <div className="card-inner text-center relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity" />
          <h2 className="text-base-content/50 mb-2 font-bold tracking-widest text-sm uppercase">وقت العمل المسجل اليوم</h2>
          <div className="text-7xl md:text-8xl font-black text-base-content mb-8 tracking-tighter tabular-nums">{formatTime(elapsedTime)}</div>
          <div className="flex flex-col items-center gap-6">
            <motion.button
              onClick={handleToggleWork}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn w-full max-w-sm rounded-2xl h-16 text-xl font-black btn-glow ${
                isWorking ? 'btn-error' : 'btn-primary'
              }`}
            >
            {isWorking ? 'إنهاء جلسة العمل' : 'بدء جلسة العمل'}
            </motion.button>
            {isWorking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-base-200/80 p-5 rounded-2xl w-full max-w-md border border-base-300 text-right"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Monitor className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-black text-base-content">تتبع النشاط الآلي</span>
                {monitoringEnabled && (
                  <span className="badge badge-success badge-sm gap-1 animate-pulse">
                    <Zap className="w-3 h-3" /> نشط
                  </span>
                )}
              </div>
            </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <motion.div
          variants={fadeUp}
          className="card bg-neutral text-neutral-content rounded-[2.5rem] shadow-card overflow-hidden"
        >
          <div className="card-body p-6 md:p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="flex justify-between items-start z-10">
              <p className="opacity-70 text-xs font-bold uppercase tracking-widest">إجمالي ساعاتك اليومية</p>
              <Clock className="w-6 h-6 text-primary opacity-80" />
            </div>
            <h3 className="text-4xl md:text-5xl font-black mt-4 z-10">
              {dailyDisplay} <span className="text-lg font-medium opacity-60">ساعة</span>
            </h3>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="card bg-base-100 rounded-[2.5rem] shadow-card border border-base-200 overflow-hidden"
        >
          <div className="card-body p-6 md:p-8">
            <p className="text-base-content/50 mb-1 text-xs font-bold uppercase tracking-widest">لقطات التتبع المسجلة</p>
            <h3 className="text-4xl md:text-5xl font-black text-base-content">{screenshots.length}</h3>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
