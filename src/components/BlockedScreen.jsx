import { ShieldAlert } from 'lucide-react';

export default function BlockedScreen({ onLogout }) {
  return (
    <div className="w-full max-w-md mt-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 text-center">
      <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6"><ShieldAlert className="w-9 h-9"/></div>
      <h2 className="text-xl font-black text-slate-800 mb-2">حسابك معطّل</h2>
      <p className="text-slate-500 text-sm mb-6">تم تعطيل حسابك من لوحة الإدارة. تواصل مع المسؤول لإعادة التفعيل.</p>
      <button onClick={onLogout} className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold">تسجيل الخروج</button>
    </div>
  );
}
