import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { AuthInput } from '../../../components/auth/AuthInput';

export default function ForgotPassword() {
  const { requestReset, loading, error, success, fieldErrors } = useForgotPassword();
  const [email, setEmail] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await requestReset(email);
    } catch {
      /* local validation error */
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col h-full"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-forest">Forgot Password</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Enter your email and we&apos;ll send a reset token if an account exists.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex-1 space-y-5" noValidate>
        <AuthInput 
          id="email" 
          label="Email Address" 
          type="email" 
          autoComplete="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          error={fieldErrors.email} 
          disabled={loading} 
          placeholder="you@example.com"
          required 
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}
        {success && <p className="text-center text-sm font-bold text-accent-deep">{success}</p>}

        <motion.button 
          whileTap={{ scale: 0.96 }}
          type="submit" 
          disabled={loading} 
          className="mt-6 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
        >
          {loading ? 'Sending…' : 'Send Reset Token'}
        </motion.button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-2 text-sm font-semibold text-gray-500">
        <Link to="/login" className="font-extrabold text-forest hover:text-accent transition">
          Back to sign in
        </Link>
        <span className="text-gray-300">•</span>
        <Link to="/reset-password" className="font-extrabold text-forest hover:text-accent transition">
          I already have a token
        </Link>
      </div>
    </motion.div>
  );
}