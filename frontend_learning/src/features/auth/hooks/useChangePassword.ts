import { useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';
import { validatePassword } from '../validators';

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const change = useCallback(async (currentPassword: string, newPassword: string) => {
    const local: Record<string, string> = {};
    if (!currentPassword) local.current_password = 'Current password is required.';
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
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (e) {
      if (e instanceof ApiError) setError(e.info.message);
      else setError('Password change failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { change, loading, error, success, fieldErrors };
}