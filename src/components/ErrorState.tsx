import { ArrowClockwiseIcon, ClockCountdownIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useCommonTranslation } from '@/i18n/common';

interface ErrorStateProps {
  // The session ran out and could not be renewed: its own message, not the generic one.
  sessionExpired?: boolean;
  onRetry?: () => void;
}

export function ErrorState({ sessionExpired = false, onRetry }: ErrorStateProps) {
  const t = useCommonTranslation();
  const copy = sessionExpired ? t.sessionExpired : t.error;
  const Icon = sessionExpired ? ClockCountdownIcon : WarningCircleIcon;

  return (
    <div role="alert" className="flex animate-fade-up flex-col items-start gap-2 rounded-lg border border-line p-6">
      <div
        aria-hidden
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          sessionExpired ? 'bg-warning-surface text-warning' : 'bg-error-surface text-error'
        }`}
      >
        <Icon size={24} weight="duotone" />
      </div>
      <h2 className="text-base font-semibold text-ink">{copy.title}</h2>
      <p className="max-w-[60ch] text-sm text-ink-soft">{copy.description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper"
        >
          <ArrowClockwiseIcon size={18} aria-hidden />
          {copy.retry}
        </button>
      ) : null}
    </div>
  );
}
