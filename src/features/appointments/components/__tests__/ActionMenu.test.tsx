// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isEmbedded, openExternalUrl } from '@/services/parentSync';
import { ActionMenu, type MenuAction } from '../ActionMenu';

vi.mock('@/services/parentSync', () => ({
  isEmbedded: vi.fn(() => false),
  openExternalUrl: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const setup = (overrides: Partial<MenuAction>[] = []) => {
  const onEdit = vi.fn();
  const actions: MenuAction[] = [
    { key: 'edit', label: 'Edit', icon: null, onSelect: onEdit },
    { key: 'delete', label: 'Delete', icon: null, danger: true, onSelect: vi.fn() },
    ...(overrides as MenuAction[]),
  ];
  render(<ActionMenu label="More actions" actions={actions} disabled={false} />);
  return { onEdit, trigger: screen.getByRole('button', { name: 'More actions' }) };
};

describe('ActionMenu', () => {
  it('stays closed until its button is pressed, then lists every action by name', async () => {
    const { trigger } = setup();
    expect(screen.queryByRole('menu')).toBeNull();

    await userEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Edit', 'Delete']);
  });

  it('runs the chosen action and closes', async () => {
    const { onEdit, trigger } = setup();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('moves through the items with the arrow keys and closes on Escape, returning focus', async () => {
    const { trigger } = setup();

    await userEvent.click(trigger);
    expect(document.activeElement?.textContent).toBe('Edit');
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Delete');
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Edit');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when the user presses outside it', async () => {
    const { trigger } = setup();

    await userEvent.click(trigger);
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('leaves an external link to the browser outside the platform', async () => {
    const { trigger } = setup([{ key: 'link', label: 'Open', icon: null, href: 'https://example.com/a' }]);

    await userEvent.click(trigger);
    const link = screen.getByRole('menuitem', { name: 'Open' });
    expect(link.getAttribute('href')).toBe('https://example.com/a');
    await userEvent.click(link);

    expect(openExternalUrl).not.toHaveBeenCalled();
  });

  it('hands an external link to the platform when embedded', async () => {
    vi.mocked(isEmbedded).mockReturnValue(true);
    const { trigger } = setup([{ key: 'link', label: 'Open', icon: null, href: 'https://example.com/a' }]);

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Open' }));

    expect(openExternalUrl).toHaveBeenCalledWith('https://example.com/a');
  });
});
