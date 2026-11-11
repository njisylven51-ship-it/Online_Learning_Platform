export interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorBody {
  detail: string | ValidationIssue[];
}

export type ApiErrorKind =
  | 'network'        // fetch threw / offline
  | 'unauthorized'   // 401
  | 'forbidden'      // 403
  | 'not_found'      // 404
  | 'payment'        // 402 — paid course free enrol attempt
  | 'conflict'       // 409
  | 'validation'     // 422
  | 'server'         // 5xx
  | 'unknown';

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status: number;             // 0 for network failures
  message: string;            // user-safe
  issues?: ValidationIssue[]; // only for 422
}

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
}