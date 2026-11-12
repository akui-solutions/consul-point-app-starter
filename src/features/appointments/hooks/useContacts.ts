import { useEffect, useState } from 'react';
import { fetchContacts } from '@/services/contactsService';
import type { ContactsState } from '../types';

// The list is a convenience for the form. If it cannot be read, for any reason,
// the form falls back to a typed name instead of blocking the booking.
export function useContacts(enabled: boolean): ContactsState {
  const [state, setState] = useState<ContactsState>({ status: 'loading', contacts: [] });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchContacts()
      .then((result) => {
        if (!active) return;
        setState({ status: result.available ? 'available' : 'unavailable', contacts: result.contacts });
      })
      .catch(() => {
        if (active) setState({ status: 'unavailable', contacts: [] });
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}
