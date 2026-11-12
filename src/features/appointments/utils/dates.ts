import type { Locale } from '@/i18n';
import type { AgendaScope, Appointment, DayGroup } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toIsoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Where a new appointment starts by default: the next half hour, so it never
// lands in the past (and rolls over to tomorrow late at night).
export function nextSlot(now: Date): { date: string; time: string } {
  const slot = new Date(now);
  slot.setSeconds(0, 0);
  slot.setMinutes(now.getMinutes() < 30 ? 30 : 60);
  return { date: toIsoDay(slot), time: `${pad(slot.getHours())}:${pad(slot.getMinutes())}` };
}

// Appointments are stored as a local day and time, with no time zone: they mean
// "that time on the wall clock" for whoever reads them.
export function startOf(appointment: Pick<Appointment, 'date' | 'time'>): Date {
  const [year, month, day] = appointment.date.split('-').map(Number);
  const [hours, minutes] = appointment.time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function endOf(appointment: Pick<Appointment, 'date' | 'time' | 'durationMinutes'>): Date {
  return new Date(startOf(appointment).getTime() + appointment.durationMinutes * 60_000);
}

export function isPast(appointment: Appointment, now: Date): boolean {
  return endOf(appointment).getTime() < now.getTime();
}

export function dayOffsetFromToday(isoDay: string, now: Date): number {
  const [year, month, day] = isoDay.split('-').map(Number);
  const target = new Date(year, month - 1, day).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function formatDay(isoDay: string, locale: Locale): string {
  const [year, month, day] = isoDay.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day));
  return capitalize(formatted);
}

export function formatTime(time: string, locale: Locale): string {
  const [hours, minutes] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2000, 0, 1, hours, minutes)
  );
}

// Upcoming days run forward from today; past days run backward from yesterday.
export function groupByDay(appointments: Appointment[], scope: AgendaScope, now: Date): DayGroup[] {
  const direction = scope === 'upcoming' ? 1 : -1;
  const sorted = appointments
    .filter((appointment) => isPast(appointment, now) === (scope === 'past'))
    .sort((a, b) => direction * (startOf(a).getTime() - startOf(b).getTime()));

  const groups: DayGroup[] = [];
  for (const appointment of sorted) {
    const last = groups[groups.length - 1];
    if (last?.date === appointment.date) last.appointments.push(appointment);
    else groups.push({ date: appointment.date, appointments: [appointment] });
  }
  return groups;
}
