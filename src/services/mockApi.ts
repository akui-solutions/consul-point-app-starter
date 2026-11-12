import { getConfig } from '@/config';
import { buildMockAppointments, mockContacts } from './mockData';
import type { BaseDoc, ListResponse, ModelApi } from './modelApi';

type AnyDoc = Record<string, unknown> & { _id: string; _rev: string };

const stores = new Map<string, AnyDoc[]>();

function getStore(modelName: string): AnyDoc[] {
  let store = stores.get(modelName);
  if (!store) {
    store = modelName === 'appointment' ? (buildMockAppointments(getConfig().language) as AnyDoc[]) : [];
    stores.set(modelName, store);
  }
  return store;
}

// Lets each test start from the seed data.
export function resetMockStores(): void {
  stores.clear();
}

const delay = <T>(value: T, ms = 350): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const uid = () => `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const bumpRev = (rev: string) => `${Number.parseInt(rev, 10) + 1 || 2}-demo`;

// In-memory stand-in for the platform's records. It lives until the page reloads.
export const mockModelApi: ModelApi = {
  list<T extends BaseDoc>(modelName: string): Promise<ListResponse<T>> {
    return delay({ docs: structuredClone(getStore(modelName)) as T[] }, 500);
  },
  create<T extends BaseDoc>(modelName: string, data: Omit<T, '_id' | '_rev'>): Promise<T> {
    const doc = { ...(structuredClone(data) as Record<string, unknown>), _id: uid(), _rev: '1-demo' };
    getStore(modelName).push(doc);
    return delay(structuredClone(doc) as T);
  },
  update<T extends BaseDoc>(modelName: string, docId: string, data: Omit<T, '_id' | '_rev'>, rev: string): Promise<T> {
    const store = getStore(modelName);
    const index = store.findIndex((doc) => doc._id === docId);
    if (index === -1) return Promise.reject(new Error(`Not found: ${docId}`));
    const updated = { ...(structuredClone(data) as Record<string, unknown>), _id: docId, _rev: bumpRev(rev) };
    store[index] = updated;
    return delay(structuredClone(updated) as T);
  },
  remove(modelName: string, docId: string): Promise<void> {
    const store = getStore(modelName);
    const index = store.findIndex((doc) => doc._id === docId);
    if (index !== -1) store.splice(index, 1);
    return delay(undefined);
  },
};

export function mockFetchContacts() {
  return delay(
    mockContacts.map((contact) => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      identities: [{ type: 'EMAIL', value: contact.email }],
    })),
    400
  );
}
