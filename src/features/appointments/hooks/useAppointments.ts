import { useCallback, useEffect, useState } from 'react';
import { isSessionExpired } from '@/services/api';
import { isConflict, listAllDocs, modelApi } from '@/services/modelApi';
import type { Appointment, AppointmentDraft } from '../types';

// Name of the collection in the application's settings. It cannot change once created.
const MODEL = 'appointment';

export type AgendaLoadState = 'loading' | 'ready' | 'error' | 'expired';

export function toDraft(appointment: Appointment): AppointmentDraft {
  const { _id: _ignoredId, _rev: _ignoredRev, ...draft } = appointment;
  return draft;
}

export function useAppointments(enabled: boolean) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [state, setState] = useState<AgendaLoadState>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      setAppointments(await listAllDocs<Appointment>(MODEL));
      setState('ready');
    } catch (error) {
      setState(isSessionExpired(error) ? 'expired' : 'error');
    }
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  const create = useCallback(async (draft: AppointmentDraft) => {
    const created = await modelApi.create<Appointment>(MODEL, draft);
    setAppointments((current) => [...current, created]);
  }, []);

  const update = useCallback(
    async (appointment: Appointment, draft: AppointmentDraft) => {
      try {
        const updated = await modelApi.update<Appointment>(MODEL, appointment._id!, draft, appointment._rev!);
        setAppointments((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      } catch (error) {
        // The copy on screen is stale: bring the current one before the user retries.
        if (isConflict(error)) void load();
        throw error;
      }
    },
    [load]
  );

  const remove = useCallback(
    async (appointment: Appointment) => {
      try {
        await modelApi.remove(MODEL, appointment._id!, appointment._rev!);
        setAppointments((current) => current.filter((item) => item._id !== appointment._id));
      } catch (error) {
        if (isConflict(error)) void load();
        throw error;
      }
    },
    [load]
  );

  return { appointments, state, reload: load, create, update, remove };
}
