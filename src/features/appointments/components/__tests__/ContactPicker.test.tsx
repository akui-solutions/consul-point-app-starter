// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithLocale } from '@/test/render';
import type { ContactsState } from '../../types';
import { ContactPicker } from '../ContactPicker';

afterEach(cleanup);

const available: ContactsState = {
  status: 'available',
  contacts: [
    { id: 'c-1', name: 'Núria Sample', email: 'nuria@example.com' },
    { id: 'c-2', name: 'Other Person', email: null },
  ],
};

describe('ContactPicker', () => {
  it('suggests contacts matching what was typed, ignoring accents and case', () => {
    renderWithLocale(
      <ContactPicker name="nuria" contactId={undefined} contacts={available} error={null} onChange={vi.fn()} />
    );

    const suggestions = screen.getByRole('list', { name: 'Matching contacts' });
    expect(suggestions.textContent).toContain('Núria Sample');
    expect(suggestions.textContent).not.toContain('Other Person');
  });

  it('links the appointment to the contact that was picked', async () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ContactPicker name="nuria" contactId={undefined} contacts={available} error={null} onChange={onChange} />
    );

    await userEvent.click(screen.getByRole('button', { name: /Núria Sample/ }));

    expect(onChange).toHaveBeenCalledWith({ name: 'Núria Sample', contactId: 'c-1' });
  });

  it('drops the link as soon as the name is edited', async () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ContactPicker name="Núria Sample" contactId="c-1" contacts={available} error={null} onChange={onChange} />
    );
    expect(screen.getByText('Linked to a contact')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();

    await userEvent.type(screen.getByRole('textbox', { name: 'Contact' }), 'x');

    expect(onChange).toHaveBeenLastCalledWith({ name: 'Núria Samplex', contactId: undefined });
  });

  it('still takes a typed name when the app has no access to contacts', () => {
    renderWithLocale(
      <ContactPicker
        name="Someone"
        contactId={undefined}
        contacts={{ status: 'unavailable', contacts: [] }}
        error={null}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/no access to contacts/)).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});
