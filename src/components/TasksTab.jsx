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
    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
      <h2 className="text-3xl font-black mb-10 text-slate-800 flex items-center gap-4">
        <ListTodo className="text-indigo-600 w-8 h-8"/> المهام الحالية
      </h2>
      <form onSubmit={onAddTask} className="flex gap-4 mb-10">
        <input value={newTask} onChange={e => setNewTask(e.target.value)} className="flex-1 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-slate-100 transition-all text-lg font-medium" placeholder="أضف مهمة جديدة للعمل..." />
        <button type="submit" className="bg-slate-900 text-white px-10 rounded-2xl hover:bg-black transition shadow-xl shadow-slate-200 active:scale-95"><Plus className="w-8 h-8"/></button>
      </form>
      <div className="space-y-4">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group shadow-sm">
            <div className="flex items-center gap-5">
              <button onClick={() => {
                const updated = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x);
                setTasks(updated);
                const task = updated.find(x => x.id === t.id);
                if (task) syncTaskToSupabase(task);
              }} className={`w-9 h-9 rounded-full border-2 transition-all duration-500 ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100' : 'border-slate-300 bg-white hover:border-indigo-400'}`}>
                {t.completed && <CheckCircle className="w-6 h-6"/>}
              </button>
              <span className={`${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-bold text-xl'}`}>{t.text}</span>
            </div>
            <button onClick={() => { setTasks(tasks.filter(x => x.id !== t.id)); syncTaskToSupabase(t, true); }} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"><Trash2 className="w-6 h-6"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
