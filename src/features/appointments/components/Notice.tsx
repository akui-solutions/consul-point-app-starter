import { XIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export interface NoticeContent {
  tone: 'info' | 'error';
  message: string;
  // Extra text shown as a quote, e.g. what would be inserted in the conversation.
  detail?: string;
}

interface NoticeProps {
  notice: NoticeContent;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 7000;

export function Notice({ notice, onDismiss }: NoticeProps) {
  const t = useTranslation();

  useEffect(() => {
    // A notice carrying text to read stays until the user closes it.
    if (notice.detail) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role={notice.tone === 'error' ? 'alert' : 'status'}
        className={`pointer-events-auto flex w-full max-w-md animate-fade-up items-start gap-2 rounded-lg border bg-bg p-2 pl-4 shadow-md ${
          notice.tone === 'error' ? 'border-error' : 'border-line-strong'
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-1.5">
          <p className={`text-sm font-medium ${notice.tone === 'error' ? 'text-error' : 'text-ink'}`}>
            {notice.message}
          </p>
          {notice.detail ? (
            <blockquote className="rounded-lg bg-surface px-3 py-2 text-sm text-ink-soft">{notice.detail}</blockquote>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={t.notice.dismiss}
          onClick={onDismiss}
          className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-surface hover:text-ink"
        >
          <XIcon size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
