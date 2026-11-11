// Generic, reusable validators. Not tied to any single feature.
// Feature-specific rules (e.g. auth password length) live in
// features/<feature>/validators.ts — not here.

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  // Practical, not RFC-5322 complete. Good enough for form UX.
  // Backend (Pydantic EmailStr) is the authoritative check.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhoneNumber(value: string): boolean {
  // Mobile-money format used by the mock payment simulator:
  // exactly 9 digits, no spaces, no symbols.
  return /^\d{9}$/.test(value);
}

export function isValidUrl(value: string): boolean {
  try {
    // Reject empty / non-string before URL parsing.
    if (!value || typeof value !== 'string') return false;
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function isWithinLengthRange(
  value: string,
  min: number,
  max: number,
): boolean {
  return value.length >= min && value.length <= max;
}