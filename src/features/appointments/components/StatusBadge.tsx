import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@phosphor-icons/react';
import { useTranslation } from '../i18n';
import type { AppointmentStatus } from '../types';

const STYLES: Record<AppointmentStatus, string> = {
  pending: 'text-warning',
  confirmed: 'text-success',
  cancelled: 'text-ink-soft',
};

const ICONS = { pending: ClockIcon, confirmed: CheckCircleIcon, cancelled: XCircleIcon };

// Icon and word together: the state never depends on color alone.
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const t = useTranslation();
  const Icon = ICONS[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-medium ${STYLES[status]}`}>
      <Icon size={14} weight="fill" aria-hidden />
      {t.status[status]}
    </span>
  );
}
