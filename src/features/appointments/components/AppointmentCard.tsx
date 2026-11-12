import {
  ArrowCounterClockwiseIcon,
  CalendarPlusIcon,
  ChatTextIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  TrashIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useLocale } from '@/i18n';
import { useTranslation } from '../i18n';
import type { Appointment, AppointmentStatus } from '../types';
import { buildCalendarLink } from '../utils/calendarLink';
import { formatTime } from '../utils/dates';
import { ActionMenu, type MenuAction } from './ActionMenu';
import { StatusBadge } from './StatusBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  // The rail starts at the first dot of the day and ends at the last one.
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  canInsert: boolean;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onInsert: (appointment: Appointment) => void;
  onViewContact: (appointment: Appointment) => void;
}

const SMALL_BUTTON =
  'inline-flex min-h-10 cursor-pointer items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

const DOT: Record<AppointmentStatus, string> = {
  confirmed: 'bg-primary',
  pending: 'border-2 border-warning bg-bg',
  cancelled: 'border-2 border-line-strong bg-bg',
};

export function AppointmentCard({
  appointment,
  isFirst,
  isLast,
  busy,
  canInsert,
  onStatusChange,
  onEdit,
  onDelete,
  onInsert,
  onViewContact,
}: AppointmentCardProps) {
  const t = useTranslation();
  const locale = useLocale();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cancelled = appointment.status === 'cancelled';
  const calendarLink = buildCalendarLink(appointment, t.calendarTitle(appointment.contactName));
  const summary = [appointment.reason, t.duration(appointment.durationMinutes)].filter(Boolean).join(' · ');

  const actions: MenuAction[] = [];
  if (canInsert) {
    actions.push({
      key: 'insert',
      label: t.card.insert,
      icon: <ChatTextIcon size={18} />,
      onSelect: () => onInsert(appointment),
    });
  }
  if (appointment.contactId) {
    actions.push({
      key: 'contact',
      label: t.card.viewContact,
      icon: <UserIcon size={18} />,
      onSelect: () => onViewContact(appointment),
    });
  }
  if (!cancelled) {
    actions.push({
      key: 'calendar',
      label: t.card.calendar,
      icon: <CalendarPlusIcon size={18} />,
      href: calendarLink,
    });
  }
  actions.push({
    key: 'edit',
    label: t.card.edit,
    icon: <PencilSimpleIcon size={18} />,
    onSelect: () => onEdit(appointment),
  });
  actions.push(
    cancelled
      ? {
          key: 'reopen',
          label: t.card.reopen,
          icon: <ArrowCounterClockwiseIcon size={18} />,
          onSelect: () => onStatusChange(appointment, 'pending'),
        }
      : {
          key: 'cancel',
          label: t.card.cancelAppointment,
          icon: <ProhibitIcon size={18} />,
          onSelect: () => onStatusChange(appointment, 'cancelled'),
        }
  );
  actions.push({
    key: 'delete',
    label: t.card.delete,
    icon: <TrashIcon size={18} />,
    danger: true,
    onSelect: () => setConfirmingDelete(true),
  });

  return (
    <article
      aria-busy={busy}
      className={`group grid animate-fade-up grid-cols-[4.25rem_1rem_minmax(0,1fr)] gap-x-3 transition-opacity duration-150 ${
        busy ? 'opacity-60' : ''
      }`}
    >
      <p
        className={`pt-3 text-right text-sm font-medium tabular-nums ${
          cancelled ? 'text-ink-faint line-through' : 'text-ink'
        }`}
      >
        {formatTime(appointment.time, locale)}
      </p>

      {/* The rail: one line through the day, one dot per appointment. */}
      <div aria-hidden className="relative flex justify-center">
        {isFirst && isLast ? null : (
          <span
            className={`absolute w-px bg-line-strong ${isFirst ? 'top-5' : 'top-0'} ${isLast ? 'h-5' : 'bottom-0'}`}
          />
        )}
        <span className={`relative mt-4 h-2.5 w-2.5 rounded-full ring-4 ring-bg ${DOT[appointment.status]}`} />
      </div>

      <div className="-ml-1 mb-1 flex min-w-0 flex-wrap items-start gap-x-3 gap-y-1 rounded-lg px-3 py-2 transition-colors duration-150 group-hover:bg-paper">
        <div className="flex min-w-0 flex-1 basis-32 flex-col py-0.5">
          <h3
            className={`break-words text-[0.9375rem] font-medium ${
              cancelled ? 'text-ink-soft line-through' : 'text-ink'
            }`}
          >
            {appointment.contactName}
          </h3>
          <p className="text-sm text-ink-soft">{summary}</p>
          {appointment.notes ? <p className="mt-1 text-[0.8125rem] text-ink-soft">{appointment.notes}</p> : null}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
            <StatusBadge status={appointment.status} />
            {appointment.createdByName ? <span>{t.createdBy(appointment.createdByName)}</span> : null}
          </p>
        </div>

        {confirmingDelete ? (
          <div role="group" aria-label={t.card.deleteQuestion} className="flex basis-full flex-wrap items-center gap-1">
            <p className="mr-1 text-sm font-medium text-ink">{t.card.deleteQuestion}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(appointment)}
              className={`${SMALL_BUTTON} bg-error text-ink-inverse hover:opacity-90`}
            >
              {t.card.deleteConfirm}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className={`${SMALL_BUTTON} text-ink-soft hover:bg-surface hover:text-ink`}
            >
              {t.card.keep}
            </button>
          </div>
        ) : (
          <div className="ml-auto flex flex-col-reverse items-end gap-1 min-[520px]:flex-row min-[520px]:items-center">
            {appointment.status === 'pending' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onStatusChange(appointment, 'confirmed')}
                className={`${SMALL_BUTTON} border border-line-strong text-ink hover:border-primary hover:text-primary`}
              >
                {t.card.confirm}
              </button>
            ) : null}
            <ActionMenu label={t.card.more(appointment.contactName)} actions={actions} disabled={busy} />
          </div>
        )}
      </div>
    </article>
  );
}
