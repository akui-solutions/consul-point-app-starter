import { DotsThreeIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { isEmbedded, openExternalUrl } from '@/services/parentSync';

export interface MenuAction {
  key: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  // An external link. It stays a real link, so it works outside the platform
  // and for assistive technology; inside it, the platform opens the tab.
  href?: string;
  onSelect?: () => void;
}

interface ActionMenuProps {
  label: string;
  actions: MenuAction[];
  disabled: boolean;
}

const ITEM =
  'flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors duration-150 hover:bg-paper focus-visible:bg-paper';

// Secondary actions behind one button, each with its name: a row of bare
// icons makes people guess.
export function ActionMenu({ label, actions, disabled }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    list[(current + step + list.length) % list.length]?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={onKeyDown}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? 'bg-surface text-ink' : ''
        }`}
      >
        <DotsThreeIcon size={22} weight="bold" aria-hidden />
      </button>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          aria-label={label}
          className="absolute right-0 top-full z-20 mt-1 w-64 max-w-[calc(100vw-2rem)] animate-fade-up rounded-lg border border-line bg-bg p-1 shadow-md"
        >
          {actions.map((action) => {
            const className = `${ITEM} ${action.danger ? 'text-error' : 'text-ink'}`;
            const content = (
              <>
                <span aria-hidden className={action.danger ? '' : 'text-ink-soft'}>
                  {action.icon}
                </span>
                {action.label}
              </>
            );
            const select = (event: MouseEvent) => {
              if (action.href && isEmbedded()) {
                event.preventDefault();
                openExternalUrl(action.href);
              }
              action.onSelect?.();
              close(false);
            };
            return action.href ? (
              <a
                key={action.key}
                role="menuitem"
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={select}
                className={className}
              >
                {content}
              </a>
            ) : (
              <button key={action.key} type="button" role="menuitem" onClick={select} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
