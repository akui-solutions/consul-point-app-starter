import { setSessionToken } from '@/config';

const REFRESH_TIMEOUT_MS = 8000;

interface ParentSessionMessage {
  source?: unknown;
  type?: unknown;
  token?: unknown;
}

let pending: Promise<string | null> | null = null;

// Asks the platform for a replacement session token. Resolves null when the
// app runs outside the platform, the platform cannot issue one, or it does not
// answer in time. Concurrent 401s share a single round trip.
export function requestSessionRefresh(expiredToken: string): Promise<string | null> {
  if (window === window.parent) return Promise.resolve(null);
  if (pending) return pending;

  pending = new Promise<string | null>((resolve) => {
    const finish = (token: string | null) => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      pending = null;
      if (token) setSessionToken(token);
      resolve(token);
    };
    const onMessage = (event: MessageEvent) => {
      // The platform lives on another origin than this app, so it is
      // recognised by its window: only the page embedding this frame can be
      // the parent.
      if (event.source !== window.parent) return;
      const msg = event.data as ParentSessionMessage | null;
      if (msg?.source !== 'aku-parent') return;
      if (msg.type === 'SESSION_REFRESHED' && typeof msg.token === 'string') finish(msg.token);
      else if (msg.type === 'SESSION_REFRESH_FAILED') finish(null);
    };
    const timer = setTimeout(() => finish(null), REFRESH_TIMEOUT_MS);
    window.addEventListener('message', onMessage);
    // Posted to the parent window only. The token is the expired one: platforms
    // that predate per-frame renewal use it to find who is asking.
    window.parent.postMessage(
      { source: 'aku-iframe', type: 'REFRESH_SESSION', token: expiredToken },
      '*'
    );
  });
  return pending;
}
