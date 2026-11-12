import { LinkSimpleIcon } from '@phosphor-icons/react';
import { useId, useMemo } from 'react';
import type { Contact } from '@/services/contactsService';
import { useTranslation } from '../i18n';
import type { ContactsState } from '../types';

interface ContactPickerProps {
  name: string;
  contactId: string | undefined;
  contacts: ContactsState;
  error: string | null;
  onChange: (value: { name: string; contactId: string | undefined }) => void;
}

const MAX_SUGGESTIONS = 5;

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// A name is always enough to book. Picking a suggestion also links the
// appointment to that contact, which is what enables "view contact" later.
export function ContactPicker({ name, contactId, contacts, error, onChange }: ContactPickerProps) {
  const t = useTranslation();
  const inputId = useId();
  const hintId = useId();

  const suggestions = useMemo<Contact[]>(() => {
    const query = normalize(name.trim());
    if (!query || contactId) return [];
    return contacts.contacts.filter((contact) => normalize(contact.name).includes(query)).slice(0, MAX_SUGGESTIONS);
  }, [name, contactId, contacts.contacts]);

  const hint = contacts.status === 'unavailable' ? t.form.contactsUnavailable : contactId ? null : t.form.contactHint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {t.form.contact}
      </label>
      <input
        id={inputId}
        type="text"
        value={name}
        autoComplete="off"
        placeholder={t.form.contactPlaceholder}
        aria-invalid={Boolean(error)}
        aria-describedby={hintId}
        onChange={(event) => onChange({ name: event.target.value, contactId: undefined })}
        className={`min-h-11 rounded-lg border bg-bg px-3 text-[0.9375rem] text-ink placeholder:text-ink-faint ${
          error ? 'border-error' : 'border-line-strong'
        }`}
      />
      <div id={hintId} className="text-xs">
        {error ? <p className="font-semibold text-error">{error}</p> : null}
        {contactId ? (
          <p className="inline-flex items-center gap-1 font-semibold text-primary">
            <LinkSimpleIcon size={14} aria-hidden />
            {t.form.contactLinked}
          </p>
        ) : null}
        {!error && hint ? <p className="text-ink-soft">{hint}</p> : null}
      </div>
      {suggestions.length > 0 ? (
        <ul
          aria-label={t.form.contactSuggestions}
          className="flex flex-col overflow-hidden rounded-lg border border-line"
        >
          {suggestions.map((contact) => (
            <li key={contact.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onChange({ name: contact.name, contactId: contact.id })}
                className="flex min-h-11 w-full cursor-pointer flex-col items-start justify-center bg-bg px-3 py-1.5 text-left transition-colors duration-150 hover:bg-primary-surface"
              >
                <span className="text-sm font-medium text-ink">{contact.name}</span>
                {contact.email ? <span className="text-xs text-ink-soft">{contact.email}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
