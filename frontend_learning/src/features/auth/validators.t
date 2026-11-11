export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  return null;
}

export function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  if (value.length > 160) return 'Full name must be at most 160 characters.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 10) return 'Password must be at least 10 characters.';
  if (value.length > 128) return 'Password must be at most 128 characters.';
  return null;
}

export function validateNotBlank(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} is required.` : null;
}