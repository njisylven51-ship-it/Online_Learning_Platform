import { client } from '../../../services/api/client';
import type { AuthUser } from '../../../types/user';

export interface UpdateProfilePayload {
  full_name: string;
}

export const userService = {
  updateMe(payload: UpdateProfilePayload): Promise<AuthUser> {
    return client.patch<AuthUser>('/auth/me', payload);
  },
};