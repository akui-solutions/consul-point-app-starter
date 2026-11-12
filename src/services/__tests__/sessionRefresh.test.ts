import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestSessionRefresh } from '../sessionRefresh';
import { stubWindow } from './windowStub';

const { setSessionToken } = vi.hoisted(() => ({ setSessionToken: vi.fn() }));

vi.mock('@/config', () => ({ setSessionToken }));

const refreshed = { source: 'aku-parent', type: 'SESSION_REFRESHED', token: 'new-token' };

describe('requestSessionRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setSessionToken.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('resolves null outside the platform without asking anyone', async () => {
    const { parent } = stubWindow(false);

    await expect(requestSessionRefresh('old-token')).resolves.toBeNull();
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('asks the parent window, whatever its origin', () => {
    const { parent, answer } = stubWindow(true);

    void requestSessionRefresh('old-token');

    expect(parent.postMessage).toHaveBeenCalledWith(
      { source: 'aku-iframe', type: 'REFRESH_SESSION', token: 'old-token' },
      '*'
    );
    answer(refreshed);
  });

  it('keeps the new token and stops listening once the platform answers', async () => {
    const { answer, listeners } = stubWindow(true);
    const result = requestSessionRefresh('old-token');

    answer(refreshed);

    await expect(result).resolves.toBe('new-token');
    expect(setSessionToken).toHaveBeenCalledWith('new-token');
    expect(listeners.size).toBe(0);
  });

  it('resolves null when the platform cannot renew the session', async () => {
    const { answer } = stubWindow(true);
    const result = requestSessionRefresh('old-token');

    answer({ source: 'aku-parent', type: 'SESSION_REFRESH_FAILED' });

    await expect(result).resolves.toBeNull();
    expect(setSessionToken).not.toHaveBeenCalled();
  });

  it('ignores answers that are not from the parent window or not from the platform', async () => {
    const { answer } = stubWindow(true);
    const result = requestSessionRefresh('old-token');

    answer(refreshed, { source: { other: true } });
    answer({ ...refreshed, source: 'someone-else' });
    answer({ source: 'aku-parent', type: 'SESSION_REFRESHED', token: 42 });
    vi.advanceTimersByTime(8000);

    await expect(result).resolves.toBeNull();
    expect(setSessionToken).not.toHaveBeenCalled();
  });

  it('shares one request between concurrent calls', async () => {
    const { parent, answer } = stubWindow(true);

    const first = requestSessionRefresh('old-token');
    const second = requestSessionRefresh('old-token');
    answer(refreshed);

    await expect(Promise.all([first, second])).resolves.toEqual(['new-token', 'new-token']);
    expect(parent.postMessage).toHaveBeenCalledTimes(1);
  });

  it('gives up on a platform that does not answer, and can ask again later', async () => {
    const { parent, answer, listeners } = stubWindow(true);
    const result = requestSessionRefresh('old-token');

    vi.advanceTimersByTime(8000);
    await expect(result).resolves.toBeNull();
    expect(listeners.size).toBe(0);

    const retry = requestSessionRefresh('old-token');
    answer(refreshed);
    await expect(retry).resolves.toBe('new-token');
    expect(parent.postMessage).toHaveBeenCalledTimes(2);
  });
});
