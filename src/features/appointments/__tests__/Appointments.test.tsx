// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '@/config';
import { resetMockStores } from '@/services/mockApi';
import { renderWithLocale } from '@/test/render';

// The whole feature against the in-memory stand-in for the platform, the same
// one `dev:mock` uses.
vi.mock('@/config', async (original) => ({
  ...(await original<typeof import('@/config')>()),
  IS_MOCK: true,
}));

afterEach(() => {
  cleanup();
  resetMockStores();
});

const config: AppConfig = {
  language: 'en',
  theme: 'light',
  miniAppId: 'test-app',
  folderId: null,
  applicationId: null,
  chatId: null,
  apiBaseUrl: null,
  token: null,
  syncEnabled: false,
  storageKey: 'miniapp_data_test-app',
};

const SLOW = { timeout: 4000 };

async function renderAgenda(overrides: Partial<AppConfig> = {}) {
  const { Appointments } = await import('../index');
  renderWithLocale(<Appointments config={{ ...config, ...overrides }} />);
  // Booked for tomorrow in the demo data, so it is upcoming at any time of day.
  const name = await screen.findByText('Valentina Ortega Ruiz', {}, SLOW);
  return within(name.closest('article') as HTMLElement);
}

describe('Appointments', () => {
  it('lists the agenda by day and confirms a pending appointment', async () => {
    const row = await renderAgenda();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
    expect(row.getByText('Pending')).toBeTruthy();

    await userEvent.click(row.getByRole('button', { name: 'Confirm' }));

    expect(await row.findByText('Confirmed', {}, SLOW)).toBeTruthy();
    expect(row.queryByRole('button', { name: 'Confirm' })).toBeNull();
  });

  it('filters by status', async () => {
    await renderAgenda();

    await userEvent.click(screen.getByRole('button', { name: /^Cancelled/ }));

    expect(screen.queryByText('Valentina Ortega Ruiz')).toBeNull();
    expect(screen.getByText('No appointments with that status')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(screen.getByText('Valentina Ortega Ruiz')).toBeTruthy();
  });

  it('offers to insert the confirmation only next to a conversation', async () => {
    const row = await renderAgenda();
    await userEvent.click(row.getByRole('button', { name: /More actions/ }));
    expect(screen.queryByRole('menuitem', { name: /Insert confirmation/ })).toBeNull();
    cleanup();

    const inChat = await renderAgenda({ chatId: 'chat-1' });
    await userEvent.click(inChat.getByRole('button', { name: /More actions/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: /Insert confirmation/ }));

    // Outside the platform there is no composer: the text is shown instead.
    expect(await screen.findByText(/Hi Valentina, we booked your appointment/)).toBeTruthy();
  });

  it('asks before deleting', async () => {
    const row = await renderAgenda();

    await userEvent.click(row.getByRole('button', { name: /More actions/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete appointment' }));
    expect(screen.getByText('Valentina Ortega Ruiz')).toBeTruthy();

    await userEvent.click(row.getByRole('button', { name: 'Delete' }));

    await vi.waitFor(() => expect(screen.queryByText('Valentina Ortega Ruiz')).toBeNull(), SLOW);
  });

  it('asks to be opened from the platform when there is no session', async () => {
    vi.resetModules();
    vi.doMock('@/config', async (original) => ({
      ...(await original<typeof import('@/config')>()),
      IS_MOCK: false,
    }));
    const { Appointments } = await import('../index');
    const { LocaleProvider } = await import('@/i18n');
    const { render } = await import('@testing-library/react');

    render(
      <LocaleProvider locale="en">
        <Appointments config={config} />
      </LocaleProvider>
    );

    expect(screen.getByText('Open this application from the platform')).toBeTruthy();
    vi.doUnmock('@/config');
  });
});
