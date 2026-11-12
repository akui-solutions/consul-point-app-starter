import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isEmbedded, openExternalUrl, parentSync } from '../parentSync';
import { stubWindow } from './windowStub';

const url = 'https://files.example/doc.pdf';
const taken = { source: 'aku-parent', type: 'OPEN_URL_RESULT', ok: true };

afterEach(() => vi.unstubAllGlobals());

describe('messages to the platform', () => {
  it('says nothing outside the platform', () => {
    const { parent } = stubWindow(false);

    parentSync.navigate('/contacts/c-1');
    parentSync.knowledgeHub.invalidateList();

    expect(isEmbedded()).toBe(false);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('marks every message and posts it to the parent window, whatever its origin', () => {
    const { parent } = stubWindow(true);

    parentSync.navigate('/contacts/c-1');
    parentSync.knowledgeHub.invalidateFolder('f-1');

    expect(parent.postMessage).toHaveBeenCalledWith(
      { source: 'aku-iframe', type: 'NAVIGATE', path: '/contacts/c-1' },
      '*'
    );
    expect(parent.postMessage).toHaveBeenCalledWith(
      {
        source: 'aku-iframe',
        type: 'INVALIDATE_TAGS',
        api: 'knowledgeHub',
        tags: [
          { type: 'KnowledgeHub', id: 'LIST' },
          { type: 'KnowledgeHub', id: 'f-1' },
        ],
      },
      '*'
    );
  });
});

describe('openExternalUrl', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('opens the link itself outside the platform', () => {
    const { parent, open } = stubWindow(false);

    openExternalUrl(url);

    expect(open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('asks the platform to open it and leaves it there once the platform answers', () => {
    const { parent, answer, open, listeners } = stubWindow(true);

    openExternalUrl(url);
    answer(taken);
    vi.advanceTimersByTime(1000);

    expect(parent.postMessage).toHaveBeenCalledWith({ source: 'aku-iframe', type: 'OPEN_URL', url }, '*');
    expect(open).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });

  it('does not take an answer from another window as the platform', () => {
    const { answer, open } = stubWindow(true);

    openExternalUrl(url);
    answer(taken, { source: { other: true } });
    vi.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
  });

  it('opens it itself when the platform never answers', () => {
    const { open, listeners } = stubWindow(true);

    openExternalUrl(url);
    vi.advanceTimersByTime(999);
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    expect(listeners.size).toBe(0);
  });
});
