import { IS_MOCK } from '@/config';
import { ApiError, apiCall } from './api';
import { mockFetchContacts } from './mockApi';

export interface Contact {
  id: string;
  name: string;
  email: string | null;
}

export interface ContactsResult {
  // False when the application was not given access to contacts.
  available: boolean;
  contacts: Contact[];
}

interface RawContact {
  id?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  identities?: { type?: unknown; value?: unknown }[] | null;
}

interface Paginated<T> {
  data?: T[];
  lastPage?: number;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 5;

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

// The response is data from outside the app: every field is checked before use.
export function toContact(raw: RawContact): Contact | null {
  const id = text(raw.id);
  const name = [text(raw.firstName), text(raw.lastName)].filter(Boolean).join(' ');
  if (!id || !name) return null;
  const email = raw.identities?.find((identity) => identity?.type === 'EMAIL');
  return { id, name, email: text(email?.value) || null };
}

async function fetchRawContacts(): Promise<RawContact[]> {
  if (IS_MOCK) return mockFetchContacts();
  const items: RawContact[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await apiCall<Paginated<RawContact>>(`/contacts?page=${page}&limit=${PAGE_SIZE}`);
    items.push(...(res.data ?? []));
    if (!res.lastPage || page >= res.lastPage) break;
  }
  return items;
}

// Reads the organization's contacts with the app's own permission. A 403 is not
// an error: it means the permission is off, and the app carries on without the list.
export async function fetchContacts(): Promise<ContactsResult> {
  try {
    const contacts = (await fetchRawContacts())
      .map(toContact)
      .filter((contact): contact is Contact => contact !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    return { available: true, contacts };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return { available: false, contacts: [] };
    throw error;
  }
}
