import { describe, expect, it } from 'vitest';
import { appointmentsEn } from '../../i18n/en';
import { appointmentsEs } from '../../i18n/es';
import type { Appointment } from '../../types';
import { buildConfirmationText } from '../confirmationText';

const base: Appointment = {
  contactName: 'Sample Person',
  date: '2030-05-15',
  time: '09:30',
  durationMinutes: 45,
  status: 'confirmed',
  reason: 'Follow-up',
};

describe('buildConfirmationText', () => {
  it('addresses the contact by first name and includes reason and duration', () => {
    const text = buildConfirmationText(base, appointmentsEn, 'en');

    expect(text).toContain('Hi Sample,');
    expect(text).toContain('confirmed');
    expect(text).toContain('Reason: Follow-up.');
    expect(text).toContain('45 minutes');
  });

  it('asks for confirmation while the appointment is pending', () => {
    const text = buildConfirmationText({ ...base, status: 'pending' }, appointmentsEs, 'es');

    expect(text).toContain('¿Nos confirmas tu asistencia?');
  });

  it('leaves reason and duration out of a cancellation', () => {
    const text = buildConfirmationText({ ...base, status: 'cancelled' }, appointmentsEn, 'en');

    expect(text).toContain('cancelled');
    expect(text).not.toContain('Reason');
    expect(text).not.toContain('minutes');
  });
});
