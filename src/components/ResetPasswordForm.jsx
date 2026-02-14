export default function ResetPasswordForm({
  resetPasswordNew,
  setResetPasswordNew,
  resetPasswordConfirm,
  setResetPasswordConfirm,
  resetPasswordError,
  resetPasswordSuccess,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base-200/95 backdrop-blur-sm z-50 p-4">
      <div className="card card-soft w-full max-w-md p-8 md:p-10">
        <h2 className="text-xl font-black text-base-content mb-2">تعيين كلمة مرور جديدة</h2>
        <p className="text-base-content/60 text-sm mb-6">أدخل كلمة المرور الجديدة لحسابك</p>
        {resetPasswordSuccess ? (
          <div className="alert alert-success rounded-2xl space-y-2">
            <p className="font-medium">تم تحديث كلمة المرور بنجاح. جاري تحميل التطبيق...</p>
            <p className="text-sm opacity-90">Your password has been changed.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">كلمة المرور الجديدة</span></label>
              <input type="password" value={resetPasswordNew} onChange={e => setResetPasswordNew(e.target.value)} required minLength={6} className="input input-bordered rounded-2xl w-full" placeholder="••••••" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">تأكيد كلمة المرور</span></label>
              <input type="password" value={resetPasswordConfirm} onChange={e => setResetPasswordConfirm(e.target.value)} required minLength={6} className="input input-bordered rounded-2xl w-full" placeholder="••••••" />
            </div>
            {resetPasswordError && <p className="text-error text-sm font-medium">{resetPasswordError}</p>}
            <button type="submit" className="btn btn-primary w-full rounded-2xl h-14 font-bold text-lg">حفظ كلمة المرور</button>
          </form>
        )}
      </div>
    </div>
  );
}
