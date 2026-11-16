import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthInput } from '../../../components/auth/AuthInput';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      /* errors handled by context */
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      <form onSubmit={onSubmit} className="flex-1 space-y-5">
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

        <div className="pt-2 text-right">
          <Link to="/forgot-password" className="text-sm font-bold text-gray-500 hover:text-forest transition">
            Forgot password?
          </Link>
        </div>

        {/* UPDATED BUTTON COLOR */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-pastel-lilac py-4 text-base font-extrabold text-forest shadow-lg transition-colors hover:bg-[#c99cff] disabled:opacity-70"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm font-semibold text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-extrabold text-forest hover:text-accent transition">
          Sign Up
        </Link>
      </div>
    </motion.div>
  );
}