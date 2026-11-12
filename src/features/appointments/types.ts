import type { Contact } from '@/services/contactsService';
import type { BaseDoc } from '@/services/modelApi';

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;

// Mirrors the `appointment` data model in MODELS.md. Keep both in step.
export interface Appointment extends BaseDoc {
  contactName: string;
  contactId?: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** Local time, HH:mm (24 h). */
  time: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdById?: string;
  createdByName?: string;
  chatId?: string;
}

export type AppointmentDraft = Omit<Appointment, '_id' | '_rev'>;

export type AgendaScope = 'upcoming' | 'past';
export type StatusFilterValue = 'all' | AppointmentStatus;

export type ContactsState =
  | { status: 'loading'; contacts: Contact[] }
  | { status: 'available'; contacts: Contact[] }
  // The app was not granted access to contacts: it keeps working with typed names.
  | { status: 'unavailable'; contacts: Contact[] };

export interface DayGroup {
  date: string;
  appointments: Appointment[];
}
