import { useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';
import { validateEmail } from '../validators';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requestReset = useCallback(async (email: string) => {
    const e = validateEmail(email);
    if (e) {
      setFieldErrors({ email: e });
      throw new Error('Validation failed');
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      const resp = await authService.requestPasswordReset({ email });
      setSuccess(
        resp.message ||
          'If an account exists for that email, a reset token has been sent.',
      );
    } catch (e) {
      if (e instanceof ApiError && e.info.kind === 'network') {
        setError(e.info.message);
      } else {
        // Do not distinguish "not found" — enumeration protection.
        setSuccess(
          'If an account exists for that email, a reset token has been sent.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { requestReset, loading, error, success, fieldErrors };
}