import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTeacherRegister } from '../hooks/useTeacherRegister';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

export default function TeacherRegister() {
  const { login, loading: loginLoading } = useAuth();
  const { register, loading: registerLoading, error, fieldErrors } = useTeacherRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = registerLoading || loginLoading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    try {
      await register({
        email,
        full_name: fullName,
        password,
        bio,
        qualifications,
      });
      await login(email, password);
    } catch {
      /* errors surfaced via hook / AuthContext */
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-2 text-2xl font-semibold">Apply as an instructor</h1>
      <p className="mb-6 text-sm text-gray-600">
        Your account is created immediately. Course-authoring access unlocks once an administrator approves your application.
      </p>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input id="full_name" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={fieldErrors.full_name} disabled={loading} required />
        <Input id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} disabled={loading} required />
        <Input id="password" label="Password (10+ characters)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} disabled={loading} required />
        <Input id="confirm_password" label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
        <Textarea id="bio" label="Short biography" value={bio} onChange={(e) => setBio(e.target.value)} error={fieldErrors.bio} disabled={loading} rows={4} required />
        <Textarea id="qualifications" label="Qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} error={fieldErrors.qualifications} disabled={loading} rows={3} required />
        {(localError || error) && (
          <p className="text-sm text-red-600">{localError ?? error}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting application…' : 'Submit application'}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}