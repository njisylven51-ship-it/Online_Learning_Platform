import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

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
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your email and we&apos;ll send a reset token if an account exists.
      </p>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} disabled={loading} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset token'}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
        {' · '}
        <Link to="/reset-password" className="text-blue-600 hover:underline">Have a token?</Link>
      </p>
    </div>
  );
}