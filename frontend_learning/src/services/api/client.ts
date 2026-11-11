import { env } from '../../config/env';
import { session } from '../storage/session';
import { normalizeError, normalizeNetworkError } from './errorHandler';
import type { NormalizedApiError } from '../../types/api';

export class ApiError extends Error {
  constructor(public readonly info: NormalizedApiError) {
    super(info.message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  multipart?: boolean;   // body is FormData → skip JSON
  anonymous?: boolean;   // skip Authorization header (public endpoints)
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    multipart = false,
    anonymous = false,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const url = `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (!anonymous) {
    const token = session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (multipart) {
      payload = body as FormData;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: payload, signal: controller.signal });
  } catch (err) {
    clearTimeout(timeout);
    throw new ApiError(normalizeNetworkError(err));
  }
  clearTimeout(timeout);

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const parsed = text ? safeParse(text) : undefined;

  if (!response.ok) {
    const info = normalizeError(response.status, parsed);
    if (info.kind === 'unauthorized') {
      session.clear();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    throw new ApiError(info);
  }

  return parsed as T;
}

function safeParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export const client = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};