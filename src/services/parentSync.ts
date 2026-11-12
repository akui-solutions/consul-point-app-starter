type Tag = string | { type: string; id?: string | number };

// Inside the platform the app runs in an iframe; outside it there is no one to talk to.
export const isEmbedded = (): boolean => window !== window.parent;

function post(message: Record<string, unknown>): void {
  if (!isEmbedded()) return;
  window.parent.postMessage({ source: 'aku-iframe', ...message }, '*');
}

const notifyParent = (api: string, tags: Tag[]): void => post({ type: 'INVALIDATE_TAGS', api, tags });

// A platform that predates OPEN_URL never answers; past this the app opens the
// link itself, which such a platform still allows.
const OPEN_URL_ACK_TIMEOUT_MS = 1000;

// Opens a link in a new tab. Inside the platform the app cannot open windows
// itself, so it asks the platform to do it. Call it straight from the click.
export function openExternalUrl(url: string): void {
  const openHere = () => window.open(url, '_blank', 'noopener,noreferrer');
  if (!isEmbedded()) {
    openHere();
    return;
  }
  const finish = () => {
    window.removeEventListener('message', onMessage);
    clearTimeout(timer);
  };
  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    const msg = event.data as { source?: unknown; type?: unknown } | null;
    if (msg?.source !== 'aku-parent' || msg.type !== 'OPEN_URL_RESULT') return;
    finish();
  };
  const timer = setTimeout(() => {
    finish();
    openHere();
  }, OPEN_URL_ACK_TIMEOUT_MS);
  window.addEventListener('message', onMessage);
  post({ type: 'OPEN_URL', url });
}

export const parentSync = {
  // Opens a page of the platform. Only the paths it allows are followed.
  navigate: (path: string): void => post({ type: 'NAVIGATE', path }),
  // Puts text in the composer of the open conversation. The user still decides
  // whether to send it. Only the chat the app was opened next to is accepted.
  insertMessageText: (chatId: string, text: string): void => post({ type: 'INSERT_MESSAGE_TEXT', chatId, text }),
  knowledgeHub: {
    invalidateFolder: (folderId: string) =>
      notifyParent('knowledgeHub', [
        { type: 'KnowledgeHub', id: 'LIST' },
        { type: 'KnowledgeHub', id: folderId },
      ]),
    invalidateList: () => notifyParent('knowledgeHub', [{ type: 'KnowledgeHub', id: 'LIST' }]),
  },
  applications: {
    invalidate: () => notifyParent('applications', [{ type: 'Applications', id: 'LIST' }]),
  },
  conversations: {
    invalidate: () => notifyParent('conversations', [{ type: 'Conversations', id: 'LIST' }]),
  },
};
