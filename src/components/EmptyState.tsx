import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex animate-fade-up flex-col items-center gap-2 rounded-lg border border-line px-6 py-12 text-center">
      <div aria-hidden className="mb-1 text-ink-faint">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="max-w-[44ch] text-sm text-ink-soft">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
