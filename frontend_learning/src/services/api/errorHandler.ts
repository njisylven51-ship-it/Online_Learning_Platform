import type {
  ApiErrorBody,
  ApiErrorKind,
  NormalizedApiError,
  ValidationIssue,
} from '../../types/api';

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  401: 'unauthorized',
  402: 'payment',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
};

function defaultMessage(kind: ApiErrorKind): string {
  switch (kind) {
    case 'unauthorized': return 'Please sign in to continue.';
    case 'forbidden':    return 'You do not have permission to do that.';
    case 'not_found':    return 'The requested item could not be found.';
    case 'payment':      return 'Payment is required for this course.';
    case 'conflict':     return 'That action conflicts with the current state.';
    case 'validation':   return 'Some of the information is not valid.';
    case 'server':       return 'The server encountered an error. Please try again.';
    case 'network':      return 'Cannot reach the server. Check your connection.';
    default:             return 'Something went wrong.';
  }
}

export function normalizeError(
  status: number,
  body: unknown,
): NormalizedApiError {
  const kind: ApiErrorKind =
    status >= 500 ? 'server' : KIND_BY_STATUS[status] ?? 'unknown';

  let message = defaultMessage(kind);
  let issues: ValidationIssue[] | undefined;

  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as ApiErrorBody).detail;
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      issues = detail;
      message = issues[0]?.msg ?? message;
    }
  }

  return { kind, status, message, issues };
}

export function normalizeNetworkError(error: unknown): NormalizedApiError {
  const message = error instanceof Error ? error.message : 'Network error';
  return { kind: 'network', status: 0, message };
}