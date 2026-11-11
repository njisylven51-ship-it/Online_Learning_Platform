import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../hooks/useResetPassword';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

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
      const t = setTimeout(() => navigate('/login', { replace: true }), 1200);
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
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input id="token" label="Reset token" value={token} onChange={(e) => setToken(e.target.value)} error={fieldErrors.token} disabled={loading} required />
        <Input id="password" label="New password (10+ characters)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.new_password} disabled={loading} required />
        <Input id="confirm_password" label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
        {(localError || error) && <p className="text-sm text-red-600">{localError ?? error}</p>}
        {success && <p className="text-sm text-green-700">Password updated. Redirecting…</p>}
        <Button type="submit" disabled={loading || success} className="w-full">
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}