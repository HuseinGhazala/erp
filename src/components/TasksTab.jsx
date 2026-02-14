import { motion } from 'framer-motion';
import { ListTodo, Plus, CheckCircle, Trash2 } from 'lucide-react';

export default function TasksTab({
  tasks,
  setTasks,
  newTask,
  setNewTask,
  user,
  supabase,
  syncTaskToSupabase,
  onAddTask,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card card-soft bg-base-100 p-6 md:p-10 hover-lift"
    >
      <h2 className="text-2xl md:text-3xl font-black mb-8 text-base-content flex items-center gap-4">
        <ListTodo className="text-primary w-8 h-8" /> المهام الحالية
      </h2>
      <form onSubmit={onAddTask} className="flex gap-3 mb-8">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className="input input-bordered flex-1 rounded-2xl bg-base-200/50 border-base-300 text-lg font-medium"
          placeholder="أضف مهمة جديدة للعمل..."
        />
        <button type="submit" className="btn btn-primary rounded-2xl px-8 shadow-lg shadow-primary/20">
          <Plus className="w-6 h-6" />
        </button>
      </form>
      <div className="space-y-3">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between p-4 md:p-5 bg-base-200/60 rounded-2xl border border-base-300/50 hover:border-primary/20 hover:bg-base-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const updated = tasks.map(x => (x.id === t.id ? { ...x, completed: !x.completed } : x));
                  setTasks(updated);
                  const task = updated.find(x => x.id === t.id);
                  if (task) syncTaskToSupabase(task);
                }}
                className={`btn btn-circle btn-sm ${t.completed ? 'btn-success' : 'btn-ghost border-2 border-base-300'}`}
              >
                {t.completed && <CheckCircle className="w-5 h-5" />}
              </button>
              <span className={`font-bold text-lg ${t.completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>
                {t.text}
              </span>
            </div>
            <button
              onClick={() => {
                setTasks(tasks.filter(x => x.id !== t.id));
                syncTaskToSupabase(t, true);
              }}
              className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
              aria-label="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
