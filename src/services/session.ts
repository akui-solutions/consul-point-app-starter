import { getConfig, IS_MOCK } from '@/config';
import { apiCall } from './api';

export interface SessionUser {
  id: string | null;
  name: string | null;
}

let cached: { token: string; promise: Promise<SessionUser> } | null = null;

// Who is using the app, as verified by the platform. Never read it from the
// token or from the params: neither can be trusted in the browser.
export function getSessionUser(): Promise<SessionUser> {
  if (IS_MOCK) {
    return Promise.resolve({
      id: 'demo-user',
      name: import.meta.env.VITE_DEV_USER_NAME || 'Usuario Demo',
    });
  }

  const { token, miniAppId } = getConfig();
  if (!token) return Promise.resolve({ id: null, name: null });
  if (cached?.token === token) return cached.promise;

  const promise = apiCall<{ userId?: unknown; userName?: unknown }>(
    `/mini-apps/v2/${encodeURIComponent(miniAppId)}/session`
  )
    .then((res) => ({
      id: typeof res.userId === 'string' ? res.userId : null,
      name: typeof res.userName === 'string' && res.userName.trim() ? res.userName.trim() : null,
    }))
    .catch(() => {
      cached = null;
      return { id: null, name: null };
    });
  cached = { token, promise };
  return promise;
}
