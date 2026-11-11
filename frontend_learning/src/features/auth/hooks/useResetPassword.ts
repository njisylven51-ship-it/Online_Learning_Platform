import { useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';
import { validatePassword } from '../validators';

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const reset = useCallback(async (token: string, newPassword: string) => {
    const local: Record<string, string> = {};
    if (!token.trim()) local.token = 'Reset token is required.';
    const p = validatePassword(newPassword); if (p) local.new_password = p;
    if (Object.keys(local).length > 0) {
      setFieldErrors(local);
      throw new Error('Validation failed');
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});
    try {
      await authService.confirmPasswordReset({ token, new_password: newPassword });
      setSuccess(true);
    } catch (e) {
      if (e instanceof ApiError) setError(e.info.message);
      else setError('Password reset failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reset, loading, error, success, fieldErrors };
}