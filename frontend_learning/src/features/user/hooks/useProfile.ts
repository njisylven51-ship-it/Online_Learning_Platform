import { useCallback, useState } from 'react';
import { userService, type UpdateProfilePayload } from '../services/userService';
import { ApiError } from '../../../services/api/client';
import { useAuth } from '../../../contexts/AuthContext';

export function useProfile() {
  const { refetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = useCallback(async (payload: UpdateProfilePayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await userService.updateMe(payload);
      
      // Critical: Re-fetch the user so the navbar and all other components
      // instantly reflect the new name without a page refresh.
      await refetch();
      
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to update profile.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return { update, loading, error, success };
}