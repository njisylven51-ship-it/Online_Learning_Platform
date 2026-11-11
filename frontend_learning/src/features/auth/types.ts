import type { AuthUser } from '../../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

// --- Registration ---
export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface TeacherRegisterPayload {
  email: string;
  full_name: string;
  password: string;
  bio: string;
  qualifications: string;
}

export interface TeacherRegisterResponse {
  instructor_id: string;
  user: CurrentUserResponse;
  instructor_status: 'pending';
  message: string;
}

// --- Password ---
export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export type AuthResponse = TokenResponse;

export type CurrentUserResponse = AuthUser;