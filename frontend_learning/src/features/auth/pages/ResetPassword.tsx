import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResetPassword } from '../hooks/useResetPassword';
import { AuthInput } from '../../../components/auth/AuthInput';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { reset, loading, error, success, fieldErrors } = useResetPassword();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get('token');
    if (t) setToken(t);
  }, [params]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => navigate('/login', { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    try {
      await reset(token, password);
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
        <h1 className="text-2xl font-extrabold text-forest">Reset Password</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Enter your reset token and choose a new password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex-1 space-y-4" noValidate>
        <AuthInput 
          id="token" 
          label="Reset Token" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          error={fieldErrors.token} 
          disabled={loading} 
          placeholder="Paste your token here"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
        />
        <AuthInput 
          id="password" 
          label="New Password" 
          type="password" 
          autoComplete="new-password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          error={fieldErrors.new_password} 
          disabled={loading} 
          placeholder="Min. 10 characters"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <AuthInput 
          id="confirm_password" 
          label="Confirm New Password" 
          type="password" 
          autoComplete="new-password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          disabled={loading} 
          placeholder="Repeat password"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        {(localError || error) && <p className="text-center text-sm font-bold text-red-500">{localError ?? error}</p>}
        {success && <p className="text-center text-sm font-bold text-accent-deep">Password updated. Redirecting…</p>}

        <motion.button 
          whileTap={{ scale: 0.96 }}
          type="submit" 
          disabled={loading || success} 
          className="mt-6 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm font-semibold text-gray-500">
        <Link to="/login" className="font-extrabold text-forest hover:text-accent transition">
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}