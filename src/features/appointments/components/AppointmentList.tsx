import { useLocale } from '@/i18n';
import { useTranslation } from '../i18n';
import type { Appointment, AppointmentStatus, DayGroup } from '../types';
import { dayOffsetFromToday, formatDay } from '../utils/dates';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentListProps {
  groups: DayGroup[];
  now: Date;
  busyId: string | null;
  canInsert: boolean;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onInsert: (appointment: Appointment) => void;
  onViewContact: (appointment: Appointment) => void;
}

export function AppointmentList({ groups, now, busyId, ...cardHandlers }: AppointmentListProps) {
  const t = useTranslation();
  const locale = useLocale();
  const relative: Record<number, string> = { [-1]: t.day.yesterday, 0: t.day.today, 1: t.day.tomorrow };

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => {
        const nearby = relative[dayOffsetFromToday(group.date, now)];
        const day = formatDay(group.date, locale);
        return (
          <section key={group.date} aria-labelledby={`day-${group.date}`} className="flex flex-col">
            <h2 id={`day-${group.date}`} className="mb-1 flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-semibold text-ink">{nearby ?? day}</span>
              {nearby ? <span className="font-normal text-ink-soft">{day}</span> : null}
            </h2>
            {/* Rows sit flush so the rail reads as one line through the day. */}
            <div className="flex flex-col">
              {group.appointments.map((appointment, index) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  isFirst={index === 0}
                  isLast={index === group.appointments.length - 1}
                  busy={busyId === appointment._id}
                  {...cardHandlers}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
