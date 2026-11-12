import { getConfig } from '@/config';
import { requestSessionRefresh } from './sessionRefresh';

export const SESSION_EXPIRED = 'SESSION_EXPIRED';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isSessionExpired = (error: unknown): boolean =>
  error instanceof Error && error.message === SESSION_EXPIRED;

// A 401 means the session expired: the platform is asked for a new token and
// the request is replayed once. The server did nothing with the rejected
// request, so replaying it is safe even for writes.
export async function sessionFetch(path: string, init: RequestInit = {}, retryOnExpiry = true): Promise<Response> {
  const { token, apiBaseUrl, miniAppId } = getConfig();

  if (!apiBaseUrl || !token) {
    throw new Error('NO_CONTEXT');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-mini-app-id': miniAppId,
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401 && retryOnExpiry) {
    const fresh = await requestSessionRefresh(token);
    if (fresh) return sessionFetch(path, init, false);
    throw new Error(SESSION_EXPIRED);
  }

  return response;
}

export async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await sessionFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json() as Promise<T>;
}
