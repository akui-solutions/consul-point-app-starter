import { vi } from 'vitest';

type Listener = (event: MessageEvent) => void;

// No DOM in the test environment: a window with just what the services touch.
// The app and the platform are given different origins on purpose, as in the
// real frame, so a rule that leans on them being equal fails here.
export const APP_ORIGIN = 'https://mini-apps.example';
export const PLATFORM_ORIGIN = 'https://platform.example';

export function stubWindow(embedded: boolean) {
  const listeners = new Set<Listener>();
  const parent = { postMessage: vi.fn() };
  const open = vi.fn();
  const win: Record<string, unknown> = {
    open,
    location: { origin: APP_ORIGIN },
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  win.parent = embedded ? parent : win;
  vi.stubGlobal('window', win);

  // Delivers a message as the platform would, unless told otherwise.
  const answer = (data: unknown, init: { source?: unknown; origin?: string } = {}) =>
    listeners.forEach((fn) =>
      fn({
        data,
        source: init.source ?? parent,
        origin: init.origin ?? PLATFORM_ORIGIN,
      } as MessageEvent)
    );

  return { parent, answer, listeners, open };
}
