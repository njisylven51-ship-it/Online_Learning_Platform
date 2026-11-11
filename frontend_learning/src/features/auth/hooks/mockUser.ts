import type { AuthUser } from '../../../types/user';

const VALID_ROLES = ['student', 'teacher', 'administrator'] as const;

/**
 * Mock-only: derive a fake AuthUser from an email.
 * - "admin"   → administrator
 * - "pending" → teacher pending approval
 * - "rejected"→ teacher rejected
 * - "teacher" → teacher approved
 * - default   → student
 */
export function mockUserFor(email: string): AuthUser {
  const lc = email.toLowerCase();
  const base: AuthUser = {
    id: `mock-${btoa(email).replace(/=/g, '')}`,
    email,
    full_name: email.split('@')[0],
    role: 'student',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  if (lc.includes('admin')) return { ...base, role: 'administrator' };
  if (lc.includes('pending'))
    return { ...base, role: 'teacher', instructor_status: 'pending' };
  if (lc.includes('rejected'))
    return {
      ...base,
      role: 'teacher',
      instructor_status: 'rejected',
      instructor_review_reason: 'Mock rejection reason.',
    };
  if (lc.includes('teacher'))
    return { ...base, role: 'teacher', instructor_status: 'approved' };

  return base;
}

/** Mock-only: build a fake JWT whose middle segment encodes the email. */
export function mockTokenFor(email: string): string {
  return `mock.${btoa(email)}.sig`;
}

/** Mock-only: decode email from a mock token. Returns null for real JWTs. */
export function emailFromMockToken(token: string): string | null {
  if (!token.startsWith('mock.')) return null;
  try {
    return atob(token.split('.')[1]);
  } catch {
    return null;
  }
}

export const _mockRoles = VALID_ROLES; // unused export to avoid tree-shake warnings