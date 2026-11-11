import { client } from '../../../services/api/client';
import type {
  ChangePasswordPayload,
  CurrentUserResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  TeacherRegisterPayload,
  TeacherRegisterResponse,
  TokenResponse,
  AuthUser,
} from '../types';

export const authService = {
  // --- Session ---
  login(payload: LoginPayload): Promise<TokenResponse> {
    return client.post<TokenResponse>('/auth/login', payload, { anonymous: true });
  },

  me(): Promise<CurrentUserResponse> {
    return client.get<CurrentUserResponse>('/auth/me');
  },

  logout(): Promise<void> {
    return client.post<void>('/auth/logout');
  },

  // --- Registration ---
  register(payload: RegisterPayload): Promise<AuthUser> {
    return client.post<AuthUser>('/auth/register', payload, { anonymous: true });
  },

  registerTeacher(payload: TeacherRegisterPayload): Promise<TeacherRegisterResponse> {
    return client.post<TeacherRegisterResponse>(
      '/auth/register/teacher',
      payload,
      { anonymous: true },
    );
  },

  // --- Password ---
  requestPasswordReset(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    return client.post<ForgotPasswordResponse>(
      '/auth/password-reset/request',
      payload,
      { anonymous: true },
    );
  },

  confirmPasswordReset(payload: ResetPasswordPayload): Promise<void> {
    return client.post<void>(
      '/auth/password-reset/confirm',
      payload,
      { anonymous: true },
    );
  },

  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return client.post<void>('/auth/password/change', payload);
  },
};