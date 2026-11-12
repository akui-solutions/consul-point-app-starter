import { getConfig, IS_MOCK } from '@/config';
import { ApiError, sessionFetch } from './api';
import { mockModelApi } from './mockApi';

export interface BaseDoc {
  _id?: string;
  _rev?: string;
}

export interface ListResponse<T> {
  docs: T[];
  bookmark?: string;
}

export interface ModelApi {
  list<T extends BaseDoc>(modelName: string, limit?: number, bookmark?: string): Promise<ListResponse<T>>;
  create<T extends BaseDoc>(modelName: string, data: Omit<T, '_id' | '_rev'>): Promise<T>;
  update<T extends BaseDoc>(modelName: string, docId: string, data: Omit<T, '_id' | '_rev'>, rev: string): Promise<T>;
  remove(modelName: string, docId: string, rev: string): Promise<void>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await sessionFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function modelPath(modelName: string, docId?: string): string {
  const { miniAppId } = getConfig();
  const base = `/mini-apps/${encodeURIComponent(miniAppId)}/models/${modelName}/data`;
  return docId ? `${base}/${encodeURIComponent(docId)}` : base;
}

const realModelApi: ModelApi = {
  list<T extends BaseDoc>(modelName: string, limit = 50, bookmark?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (bookmark) params.set('bookmark', bookmark);
    return request<ListResponse<T>>(`${modelPath(modelName)}?${params}`);
  },
  create<T extends BaseDoc>(modelName: string, data: Omit<T, '_id' | '_rev'>) {
    return request<T>(modelPath(modelName), { method: 'POST', body: JSON.stringify({ data }) });
  },
  update<T extends BaseDoc>(modelName: string, docId: string, data: Omit<T, '_id' | '_rev'>, rev: string) {
    return request<T>(modelPath(modelName, docId), {
      method: 'PUT',
      body: JSON.stringify({ data, _rev: rev }),
    });
  },
  remove(modelName: string, docId: string, rev: string) {
    return request<void>(`${modelPath(modelName, docId)}?rev=${encodeURIComponent(rev)}`, {
      method: 'DELETE',
    });
  },
};

// The app's own records, stored by the platform. Each collection must exist in
// the application's settings before the app can write to it (see MODELS.md).
export const modelApi: ModelApi = IS_MOCK ? mockModelApi : realModelApi;

// A save was based on a copy someone else changed in the meantime.
export const isConflict = (error: unknown): boolean => error instanceof ApiError && error.status === 409;

const MAX_PAGES = 20;

// Lists are paginated by bookmark only. An agenda is small enough to load whole
// and filter in memory; a bigger collection should page on demand instead.
export async function listAllDocs<T extends BaseDoc>(modelName: string, pageSize = 100): Promise<T[]> {
  const all: T[] = [];
  let bookmark: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await modelApi.list<T>(modelName, pageSize, bookmark);
    all.push(...res.docs);
    if (!res.bookmark || res.docs.length < pageSize) break;
    bookmark = res.bookmark;
  }
  return all;
}
