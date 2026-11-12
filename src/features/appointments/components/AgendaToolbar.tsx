import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from '../i18n';
import { APPOINTMENT_STATUSES, type AgendaScope, type StatusFilterValue } from '../types';

interface AgendaToolbarProps {
  scope: AgendaScope;
  onScopeChange: (scope: AgendaScope) => void;
  status: StatusFilterValue;
  onStatusChange: (status: StatusFilterValue) => void;
  counts: Record<StatusFilterValue, number>;
  // Hidden while there is nothing to filter.
  showFilters: boolean;
  onCreate?: () => void;
}

const SCOPES: AgendaScope[] = ['upcoming', 'past'];
const STATUS_VALUES: StatusFilterValue[] = ['all', ...APPOINTMENT_STATUSES];

// The platform frame already names the app, so the screen opens straight on
// its controls: no title bar of its own.
export function AgendaToolbar({
  scope,
  onScopeChange,
  status,
  onStatusChange,
  counts,
  showFilters,
  onCreate,
}: AgendaToolbarProps) {
  const t = useTranslation();
  const statusLabel = (value: StatusFilterValue) => (value === 'all' ? t.status.all : t.statusPlural[value]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="sr-only">{t.title}</h1>
      <div className="flex items-end justify-between gap-3 border-b border-line">
        <div role="group" aria-label={t.scope.label} className="flex gap-5">
          {SCOPES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={scope === value}
              onClick={() => onScopeChange(value)}
              className={`-mb-px min-h-11 cursor-pointer border-b-2 text-sm transition-colors duration-150 ${
                scope === value
                  ? 'border-primary font-semibold text-ink'
                  : 'border-transparent font-medium text-ink-soft hover:text-ink'
              }`}
            >
              {t.scope[value]}
            </button>
          ))}
        </div>
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="mb-1.5 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-primary pl-3 pr-3.5 text-sm font-medium text-primary-contrast transition-colors duration-150 hover:bg-primary-hover"
          >
            <PlusIcon size={16} weight="bold" aria-hidden />
            {t.newAppointment}
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <div role="group" aria-label={t.status.filterLabel} className="-mx-1 flex gap-1 overflow-x-auto px-1 py-1">
          {STATUS_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => onStatusChange(value)}
              className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[0.8125rem] transition-colors duration-150 ${
                status === value
                  ? 'bg-surface font-semibold text-ink'
                  : 'font-medium text-ink-soft hover:bg-paper hover:text-ink'
              }`}
            >
              {statusLabel(value)}
              <span className="tabular-nums opacity-70">{counts[value]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
