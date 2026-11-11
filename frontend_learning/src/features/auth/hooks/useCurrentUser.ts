import { useCallback, useEffect, useState } from 'react';
import { session } from '../../../services/storage/session';
import type { AuthUser } from '../../../types/user';
import { authService } from '../services/authService';
import { ApiError } from '../../../services/api/client';

interface UseCurrentUserResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = session.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await authService.me();
      setUser(me);
    } catch (e) {
      // 401 = stale/expired token; client.ts already cleared storage.
      // Other errors (network, 5xx) should not wipe the session.
      setUser(null);
      if (e instanceof ApiError && e.info.kind !== 'unauthorized') {
        setError(e.info.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}