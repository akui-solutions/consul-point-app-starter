interface MiniAppParams {
  language?: string;
  theme?: string;
  token?: string;
  apiBaseUrl?: string;
  miniAppId?: string;
  folderId?: string;
  applicationId?: string;
  chatId?: string;
  aiResponseEnabled?: string;
}

declare global {
  interface Window {
    MINI_APP_PARAMS?: MiniAppParams;
  }
}

function getUrlParams(): MiniAppParams {
  if (!import.meta.env.DEV) return {};
  const p = new URLSearchParams(window.location.search);
  return {
    language: p.get('language') ?? undefined,
    theme: p.get('theme') ?? undefined,
    token: p.get('token') ?? undefined,
    apiBaseUrl: p.get('apiBaseUrl') ?? undefined,
    miniAppId: p.get('miniAppId') ?? undefined,
    folderId: p.get('folderId') ?? undefined,
    applicationId: p.get('applicationId') ?? undefined,
    chatId: p.get('chatId') ?? undefined,
  };
}

function getEnvParams(): MiniAppParams {
  if (!import.meta.env.DEV) return {};
  return {
    language: import.meta.env.VITE_DEV_LANGUAGE ?? undefined,
    theme: import.meta.env.VITE_DEV_THEME ?? undefined,
    token: import.meta.env.VITE_DEV_TOKEN ?? undefined,
    apiBaseUrl: import.meta.env.VITE_DEV_API_BASE_URL ?? undefined,
    miniAppId: import.meta.env.VITE_DEV_MINI_APP_ID ?? undefined,
    folderId: import.meta.env.VITE_DEV_FOLDER_ID ?? undefined,
    applicationId: import.meta.env.VITE_DEV_APPLICATION_ID ?? undefined,
    chatId: import.meta.env.VITE_DEV_CHAT_ID ?? undefined,
  };
}

// Offline demo: every service answers with invented data and nothing leaves the
// browser. The build scripts force it off, so a packaged app never ships in it.
export const IS_MOCK = import.meta.env.VITE_DEV_MOCK === 'true';

let refreshedToken: string | null = null;

export function setSessionToken(token: string): void {
  refreshedToken = token;
}

export interface AppConfig {
  language: string;
  theme: 'light' | 'dark';
  miniAppId: string;
  folderId: string | null;
  applicationId: string | null;
  chatId: string | null;
  apiBaseUrl: string | null;
  token: string | null;
  syncEnabled: boolean;
  storageKey: string;
}

export function getConfig(): AppConfig {
  const w = window.MINI_APP_PARAMS ?? {};
  const u = getUrlParams();
  const e = getEnvParams();

  const miniAppId = w.miniAppId ?? u.miniAppId ?? e.miniAppId ?? 'consul-point-app-starter';
  const apiBaseUrl = w.apiBaseUrl ?? u.apiBaseUrl ?? e.apiBaseUrl ?? null;
  const token = refreshedToken ?? w.token ?? u.token ?? e.token ?? null;

  return {
    language: w.language ?? u.language ?? e.language ?? 'es',
    theme: (w.theme ?? u.theme ?? e.theme ?? 'light') as AppConfig['theme'],
    miniAppId,
    folderId: w.folderId ?? u.folderId ?? e.folderId ?? null,
    applicationId: w.applicationId ?? u.applicationId ?? e.applicationId ?? null,
    chatId: w.chatId ?? u.chatId ?? e.chatId ?? null,
    apiBaseUrl,
    token,
    syncEnabled: Boolean(apiBaseUrl && token),
    storageKey: `miniapp_data_${miniAppId}`,
  };
}
