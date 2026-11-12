import type { Locale } from '@/i18n';
import type { AppointmentsTranslations } from '../i18n/es';
import type { Appointment } from '../types';
import { formatDay, formatTime } from './dates';

// The text offered for the conversation. It is only placed in the composer:
// the person using the platform reads it and decides whether to send it.
export function buildConfirmationText(appointment: Appointment, t: AppointmentsTranslations, locale: Locale): string {
  const firstName = appointment.contactName.trim().split(/\s+/)[0];
  const day = formatDay(appointment.date, locale).toLowerCase();
  const time = formatTime(appointment.time, locale);
  const lines = [t.message[appointment.status](firstName, day, time)];
  if (appointment.status !== 'cancelled') {
    if (appointment.reason) lines.push(t.message.reason(appointment.reason));
    lines.push(t.message.duration(appointment.durationMinutes));
  }
  return lines.join(' ');
}
