import { XIcon } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from '../i18n';
import { DURATION_OPTIONS, type Appointment, type AppointmentDraft, type ContactsState } from '../types';
import { nextSlot } from '../utils/dates';
import { ContactPicker } from './ContactPicker';

interface AppointmentFormProps {
  // The appointment being edited, or null to book a new one.
  appointment: Appointment | null;
  contacts: ContactsState;
  // Fields the form does not show but a new appointment carries.
  defaults: Pick<AppointmentDraft, 'createdById' | 'createdByName' | 'chatId'>;
  onSubmit: (draft: AppointmentDraft) => Promise<void>;
  onClose: () => void;
}

const FIELD =
  'min-h-11 rounded-lg border border-line-strong bg-bg px-3 text-[0.9375rem] text-ink placeholder:text-ink-faint';
const LABEL = 'text-sm font-medium text-ink';

const optional = (value: string): string | undefined => value.trim() || undefined;

export function AppointmentForm({ appointment, contacts, defaults, onSubmit, onClose }: AppointmentFormProps) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const fieldId = useId();

  const [contactName, setContactName] = useState(appointment?.contactName ?? '');
  const [contactId, setContactId] = useState(appointment?.contactId);
  const [slot] = useState(() => nextSlot(new Date()));
  const [date, setDate] = useState(appointment?.date ?? slot.date);
  const [time, setTime] = useState(appointment?.time ?? slot.time);
  const [durationMinutes, setDurationMinutes] = useState(appointment?.durationMinutes ?? 30);
  const [reason, setReason] = useState(appointment?.reason ?? '');
  const [notes, setNotes] = useState(appointment?.notes ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const nameMissing = !contactName.trim();
  const invalid = nameMissing || !date || !time;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setSaveFailed(false);
    try {
      // Empty optional fields are left out: the data model rejects blank extras.
      await onSubmit({
        ...(appointment
          ? {
              createdById: appointment.createdById,
              createdByName: appointment.createdByName,
              chatId: appointment.chatId,
            }
          : defaults),
        contactName: contactName.trim(),
        contactId,
        date,
        time,
        durationMinutes,
        status: appointment?.status ?? 'pending',
        reason: optional(reason),
        notes: optional(notes),
      });
      onClose();
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(calc(100%-2rem),30rem)] rounded-xl border border-line bg-bg p-0 text-ink shadow-lg backdrop:bg-black/50"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            {appointment ? t.form.editTitle : t.form.createTitle}
          </h2>
          <button
            type="button"
            aria-label={t.actions.close}
            onClick={onClose}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <XIcon size={20} aria-hidden />
          </button>
        </div>

        <ContactPicker
          name={contactName}
          contactId={contactId}
          contacts={contacts}
          error={showErrors && nameMissing ? t.form.required : null}
          onChange={(value) => {
            setContactName(value.name);
            setContactId(value.contactId);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${fieldId}-date`} className={LABEL}>
              {t.form.date}
            </label>
            <input
              id={`${fieldId}-date`}
              type="date"
              required
              value={date}
              aria-invalid={showErrors && !date}
              onChange={(event) => setDate(event.target.value)}
              className={FIELD}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${fieldId}-time`} className={LABEL}>
              {t.form.time}
            </label>
            <input
              id={`${fieldId}-time`}
              type="time"
              required
              value={time}
              aria-invalid={showErrors && !time}
              onChange={(event) => setTime(event.target.value)}
              className={FIELD}
            />
          </div>
        </div>
        {showErrors && (!date || !time) ? (
          <p className="-mt-2 text-xs font-semibold text-error">{t.form.required}</p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${fieldId}-duration`} className={LABEL}>
            {t.form.duration}
          </label>
          <select
            id={`${fieldId}-duration`}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className={`${FIELD} cursor-pointer`}
          >
            {DURATION_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {t.duration(minutes)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${fieldId}-reason`} className={LABEL}>
            {t.form.reason} <span className="font-normal text-ink-soft">({t.form.optional})</span>
          </label>
          <input
            id={`${fieldId}-reason`}
            type="text"
            maxLength={120}
            value={reason}
            placeholder={t.form.reasonPlaceholder}
            onChange={(event) => setReason(event.target.value)}
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${fieldId}-notes`} className={LABEL}>
            {t.form.notes} <span className="font-normal text-ink-soft">({t.form.optional})</span>
          </label>
          <textarea
            id={`${fieldId}-notes`}
            rows={3}
            maxLength={500}
            value={notes}
            placeholder={t.form.notesPlaceholder}
            onChange={(event) => setNotes(event.target.value)}
            className={`${FIELD} py-2`}
          />
        </div>

        {saveFailed ? (
          <p role="alert" className="rounded-lg bg-error-surface px-3 py-2 text-sm font-semibold text-error">
            {t.form.saveError}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-4 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            {t.actions.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-contrast transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t.form.saving : appointment ? t.actions.save : t.form.create}
          </button>
        </div>
      </form>
    </dialog>
  );
}
