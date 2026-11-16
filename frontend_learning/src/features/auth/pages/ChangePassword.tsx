import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useChangePassword } from '../hooks/useChangePassword';
import { AuthInput } from '../../../components/auth/AuthInput';

export default function ChangePassword() {
  const { change, loading, error, success, fieldErrors } = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (next !== confirm) {
      setLocalError('New passwords do not match.');
      return;
    }
    try {
      await change(current, next);
      setCurrent(''); setNext(''); setConfirm('');
    } catch {
      /* errors from hook */
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col h-full"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-forest">Change Password</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Ensure your account stays secure by using a strong password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex-1 space-y-4" noValidate>
        <AuthInput 
          id="current" 
          label="Current Password" 
          type="password" 
          autoComplete="current-password" 
          value={current} 
          onChange={(e) => setCurrent(e.target.value)} 
          error={fieldErrors.current_password} 
          disabled={loading} 
          placeholder="Enter current password"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <AuthInput 
          id="next" 
          label="New Password" 
          type="password" 
          autoComplete="new-password" 
          value={next} 
          onChange={(e) => setNext(e.target.value)} 
          error={fieldErrors.new_password} 
          disabled={loading} 
          placeholder="Min. 10 characters"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
        />
        <AuthInput 
          id="confirm" 
          label="Confirm New Password" 
          type="password" 
          autoComplete="new-password" 
          value={confirm} 
          onChange={(e) => setConfirm(e.target.value)} 
          disabled={loading} 
          placeholder="Repeat new password"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        {(localError || error) && <p className="text-center text-sm font-bold text-red-500">{localError ?? error}</p>}
        {success && <p className="text-center text-sm font-bold text-accent-deep">Password changed successfully.</p>}

        <motion.button 
          whileTap={{ scale: 0.96 }}
          type="submit" 
          disabled={loading} 
          className="mt-6 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </motion.button>
      </form>
    </motion.div>
  );
}