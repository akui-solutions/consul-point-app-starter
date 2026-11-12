import type { Appointment } from '../types';
import { endOf, startOf } from './dates';

const pad = (n: number) => String(n).padStart(2, '0');

// No "Z": the calendar reads it as local time, the same way the app stores it.
const stamp = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

export function buildCalendarLink(appointment: Appointment, title: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(startOf(appointment))}/${stamp(endOf(appointment))}`,
  });
  const details = [appointment.reason, appointment.notes].filter(Boolean).join('\n');
  if (details) params.set('details', details);
  return `https://calendar.google.com/calendar/render?${params}`;
}
