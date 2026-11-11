import { useCallback, useState } from 'react';
import { session } from '../../../services/storage/session';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';

interface UseLogoutOptions {
  onSuccess?: () => void | Promise<void>;
}

interface UseLogoutResult {
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useLogout({ onSuccess }: UseLogoutOptions = {}): UseLogoutResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint is stateless; even on failure, clear locally so the UI is consistent.
      try {
        await authService.logout();
      } catch (e) {
        if (!(e instanceof ApiError) || e.info.kind !== 'unauthorized') {
          // Non-401 failure: surface but do not block logout.
          setError(e instanceof ApiError ? e.info.message : 'Logout failed.');
        }
      }
      session.clear();
      await onSuccess?.();
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { logout, loading, error };
}