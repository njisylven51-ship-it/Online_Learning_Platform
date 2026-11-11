import { useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';
import type { RegisterPayload } from '../types';
import type { AuthUser } from '../../../types/user';
import { validateEmail, validateFullName, validatePassword } from '../validators';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthUser> => {
      const local: Record<string, string> = {};
      const e1 = validateEmail(payload.email); if (e1) local.email = e1;
      const e2 = validateFullName(payload.full_name); if (e2) local.full_name = e2;
      const e3 = validatePassword(payload.password); if (e3) local.password = e3;
      if (Object.keys(local).length > 0) {
        setFieldErrors(local);
        throw new Error('Validation failed');
      }

      setLoading(true);
      setError(null);
      setFieldErrors({});
      try {
        return await authService.register(payload);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.info.kind === 'validation' && e.info.issues) {
            const fe: Record<string, string> = {};
            for (const iss of e.info.issues) {
              const field = String(iss.loc[iss.loc.length - 1]);
              fe[field] = iss.msg;
            }
            setFieldErrors(fe);
          }
          setError(e.info.message);
        } else {
          setError('Registration failed.');
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { register, loading, error, fieldErrors };
}