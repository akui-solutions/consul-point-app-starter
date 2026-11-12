import { useCommonTranslation } from '@/i18n/common';

const ROWS = [0, 1, 2];

// Mirrors the agenda: a day heading and its rows, so nothing jumps when the
// data arrives.
export function LoadingState() {
  const t = useCommonTranslation();
  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <span className="sr-only">{t.loading}</span>
      <div className="mb-3 h-4 w-40 animate-skeleton-pulse rounded bg-surface" />
      {ROWS.map((row) => (
        <div
          key={row}
          className="grid animate-skeleton-pulse grid-cols-[4.25rem_1rem_minmax(0,1fr)] gap-x-3 pb-5"
          style={{ animationDelay: `${row * 120}ms` }}
        >
          <div className="ml-auto mt-3 h-3.5 w-10 rounded bg-surface" />
          <div className="flex justify-center">
            <div className="mt-3.5 h-2.5 w-2.5 rounded-full bg-surface" />
          </div>
          <div className="flex flex-col gap-2 pt-3">
            <div className="h-3.5 w-2/5 rounded bg-surface" />
            <div className="h-3 w-3/5 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
