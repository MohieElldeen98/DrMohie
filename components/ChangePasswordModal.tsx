import React, { useState } from 'react';
import { User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { KeyRound, Loader2, X, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
  onClose: () => void;
}

const MIN_LENGTH = 8;

const errorMessage = (code: string): string => {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'كلمة المرور الحالية غير صحيحة';
    case 'auth/weak-password':
      return 'كلمة المرور الجديدة ضعيفة، اختر كلمة أطول';
    case 'auth/too-many-requests':
      return 'محاولات كثيرة، استنى شوية وجرب تاني';
    case 'auth/network-request-failed':
      return 'مشكلة في الاتصال بالإنترنت';
    default:
      return 'حصل خطأ، جرب تاني';
  }
};

const ChangePasswordModal: React.FC<Props> = ({ user, onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < MIN_LENGTH) return setError(`كلمة المرور الجديدة لازم تكون ${MIN_LENGTH} حروف على الأقل`);
    if (next !== confirm) return setError('كلمتين المرور الجديدتين مش زي بعض');
    if (next === current) return setError('كلمة المرور الجديدة نفس القديمة');
    if (!user.email) return setError('الحساب ده مالوش إيميل');

    setSaving(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
      await updatePassword(user, next);
      setDone(true);
    } catch (err: any) {
      console.error('Change password failed', err);
      setError(errorMessage(err?.code || ''));
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-slate-200';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <KeyRound size={20} /> تغيير كلمة المرور
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700" aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-green-600" />
            <p className="font-bold text-slate-800">تم تغيير كلمة المرور</p>
            <p className="text-sm text-slate-500">استخدم كلمة المرور الجديدة المرة الجاية وانت بتسجل دخول.</p>
            <button type="button" onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">تمام</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-500">{user.email}</p>
            {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            <input type="password" required autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} className={input} placeholder="كلمة المرور الحالية" />
            <input type="password" required autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} className={input} placeholder="كلمة المرور الجديدة" />
            <input type="password" required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={input} placeholder="تأكيد كلمة المرور الجديدة" />
            <button type="submit" disabled={saving} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={18} className="animate-spin" />} حفظ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
