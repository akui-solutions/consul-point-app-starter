import { CalendarBlankIcon, FlaskIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { NoContextState } from '@/components/NoContextState';
import { IS_MOCK, type AppConfig } from '@/config';
import { useLocale } from '@/i18n';
import { isConflict } from '@/services/modelApi';
import { isEmbedded, parentSync } from '@/services/parentSync';
import { AgendaToolbar } from './components/AgendaToolbar';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentList } from './components/AppointmentList';
import { Notice, type NoticeContent } from './components/Notice';
import { toDraft, useAppointments } from './hooks/useAppointments';
import { useContacts } from './hooks/useContacts';
import { useSessionUser } from './hooks/useSessionUser';
import { useTranslation } from './i18n';
import {
  APPOINTMENT_STATUSES,
  type AgendaScope,
  type Appointment,
  type AppointmentDraft,
  type AppointmentStatus,
  type StatusFilterValue,
} from './types';
import { buildConfirmationText } from './utils/confirmationText';
import { groupByDay, isPast } from './utils/dates';

interface AppointmentsProps {
  config: AppConfig;
}

type FormTarget = { appointment: Appointment | null } | null;

export function Appointments({ config }: AppointmentsProps) {
  const t = useTranslation();
  const locale = useLocale();
  const hasContext = IS_MOCK || config.syncEnabled;

  const { user } = useSessionUser(hasContext);
  const agenda = useAppointments(hasContext);
  const contacts = useContacts(hasContext);

  const [scope, setScope] = useState<AgendaScope>('upcoming');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [form, setForm] = useState<FormTarget>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeContent | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);

  // "Upcoming" and "past" depend on the clock, so it is read again whenever
  // the agenda or the period changes.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => setNow(new Date()), [agenda.appointments, scope]);

  const inScope = useMemo(
    () => agenda.appointments.filter((appointment) => isPast(appointment, now) === (scope === 'past')),
    [agenda.appointments, scope, now]
  );

  const counts = useMemo(() => {
    const result = { all: inScope.length, pending: 0, confirmed: 0, cancelled: 0 };
    for (const appointment of inScope) {
      if (APPOINTMENT_STATUSES.includes(appointment.status)) result[appointment.status] += 1;
    }
    return result;
  }, [inScope]);

  const groups = useMemo(
    () =>
      groupByDay(
        statusFilter === 'all' ? inScope : inScope.filter((appointment) => appointment.status === statusFilter),
        scope,
        now
      ),
    [inScope, statusFilter, scope, now]
  );

  const reportFailure = (error: unknown) =>
    setNotice({ tone: 'error', message: isConflict(error) ? t.notice.conflict : t.notice.actionError });

  const runOnCard = async (appointment: Appointment, action: () => Promise<void>) => {
    setBusyId(appointment._id ?? null);
    try {
      await action();
    } catch (error) {
      reportFailure(error);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (appointment: Appointment, status: AppointmentStatus) =>
    void runOnCard(appointment, () => agenda.update(appointment, { ...toDraft(appointment), status }));

  const handleDelete = (appointment: Appointment) => void runOnCard(appointment, () => agenda.remove(appointment));

  const handleSubmit = async (draft: AppointmentDraft) => {
    try {
      if (form?.appointment) await agenda.update(form.appointment, draft);
      else await agenda.create(draft);
    } catch (error) {
      // A stale copy cannot be saved by retrying: close the form and say why.
      if (isConflict(error)) {
        setForm(null);
        reportFailure(error);
        return;
      }
      throw error;
    }
  };

  const handleInsert = (appointment: Appointment) => {
    const text = buildConfirmationText(appointment, t, locale);
    if (config.chatId && isEmbedded()) {
      parentSync.insertMessageText(config.chatId, text);
      setNotice({ tone: 'info', message: t.notice.inserted });
    } else {
      setNotice({ tone: 'info', message: t.notice.insertedOutside, detail: text });
    }
  };

  const handleViewContact = (appointment: Appointment) => {
    if (!appointment.contactId) return;
    if (isEmbedded()) parentSync.navigate(`/contacts/${encodeURIComponent(appointment.contactId)}`);
    else setNotice({ tone: 'info', message: t.notice.platformOnly });
  };

  if (!hasContext) return <NoContextState />;

  const nothingBooked = agenda.state === 'ready' && agenda.appointments.length === 0;

  const toolbar = (
    <AgendaToolbar
      scope={scope}
      onScopeChange={setScope}
      status={statusFilter}
      onStatusChange={setStatusFilter}
      counts={counts}
      showFilters={agenda.state === 'ready' && !nothingBooked}
      onCreate={agenda.state === 'ready' ? () => setForm({ appointment: null }) : undefined}
    />
  );

  const demoNote = IS_MOCK ? (
    <p className="flex items-center gap-1.5 text-xs text-ink-soft">
      <FlaskIcon size={14} aria-hidden />
      {t.demo.note}
    </p>
  ) : null;

  if (agenda.state !== 'ready') {
    return (
      <div className="flex flex-col gap-4">
        {toolbar}
        {agenda.state === 'loading' ? (
          <LoadingState />
        ) : (
          <ErrorState sessionExpired={agenda.state === 'expired'} onRetry={() => void agenda.reload()} />
        )}
      </div>
    );
  }

  const emptyScope = scope === 'upcoming' ? t.emptyUpcoming : t.emptyPast;
  const clearFilter = (
    <button
      type="button"
      onClick={() => setStatusFilter('all')}
      className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper"
    >
      {t.emptyFiltered.clear}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {toolbar}

      {nothingBooked ? (
        <EmptyState
          icon={<CalendarBlankIcon size={32} />}
          title={t.emptyAgenda.title}
          description={t.emptyAgenda.description}
        />
      ) : groups.length > 0 ? (
        <AppointmentList
          groups={groups}
          now={now}
          busyId={busyId}
          canInsert={Boolean(config.chatId)}
          onStatusChange={handleStatusChange}
          onEdit={(appointment) => setForm({ appointment })}
          onDelete={handleDelete}
          onInsert={handleInsert}
          onViewContact={handleViewContact}
        />
      ) : inScope.length === 0 ? (
        <EmptyState
          icon={<CalendarBlankIcon size={32} />}
          title={emptyScope.title}
          description={emptyScope.description}
        />
      ) : (
        <EmptyState
          icon={<FunnelSimpleIcon size={32} />}
          title={t.emptyFiltered.title}
          description={t.emptyFiltered.description}
          action={clearFilter}
        />
      )}

      {demoNote}

      {form ? (
        <AppointmentForm
          key={form.appointment?._id ?? 'new'}
          appointment={form.appointment}
          contacts={contacts}
          defaults={{
            createdById: user?.id ?? undefined,
            createdByName: user?.name ?? undefined,
            chatId: config.chatId ?? undefined,
          }}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
      ) : null}

      {notice ? <Notice notice={notice} onDismiss={dismissNotice} /> : null}
    </div>
  );
}
