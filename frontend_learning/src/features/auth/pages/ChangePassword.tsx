import { useState, type FormEvent } from 'react';
import { useChangePassword } from '../hooks/useChangePassword';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

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
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-semibold">Change password</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input id="current" label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={fieldErrors.current_password} disabled={loading} required />
        <Input id="next" label="New password (10+ characters)" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={fieldErrors.new_password} disabled={loading} required />
        <Input id="confirm" label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} required />
        {(localError || error) && <p className="text-sm text-red-600">{localError ?? error}</p>}
        {success && <p className="text-sm text-green-700">Password changed.</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}