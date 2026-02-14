import { Sparkles, X } from 'lucide-react';

export default function AiModal({ aiResponse, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 animate-in">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <span className="font-bold flex items-center gap-3 text-lg"><Sparkles className="w-6 h-6"/> تقرير المساعد الذكي</span>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-8">
          <div className="bg-slate-50 rounded-3xl p-6 text-slate-700 leading-relaxed whitespace-pre-wrap text-md border border-slate-100 shadow-inner max-h-[50vh] overflow-y-auto">
            {aiResponse}
          </div>
          <button onClick={onClose} className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">فهمت، شكراً لك</button>
        </div>
      </div>
    </div>
  );
}
