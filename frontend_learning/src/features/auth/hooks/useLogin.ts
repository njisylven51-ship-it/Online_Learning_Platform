import { useCallback, useState } from 'react';
import { session } from '../../../services/storage/session';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';

interface UseLoginOptions {
  onSuccess?: () => void | Promise<void>;
}

interface UseLoginResult {
  login: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useLogin({ onSuccess }: UseLoginOptions = {}): UseLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await authService.login({ email, password });
        session.setToken(resp.access_token);
        await onSuccess?.();
      } catch (e) {
        const message =
          e instanceof ApiError ? e.info.message : 'Login failed.';
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  return { login, loading, error };
}