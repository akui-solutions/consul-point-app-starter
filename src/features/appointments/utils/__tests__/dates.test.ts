import { describe, expect, it } from 'vitest';
import type { Appointment } from '../../types';
import { buildCalendarLink } from '../calendarLink';
import { dayOffsetFromToday, endOf, groupByDay, isPast, nextSlot, toIsoDay } from '../dates';

const now = new Date(2030, 4, 15, 12, 0);

const appointment = (overrides: Partial<Appointment>): Appointment => ({
  contactName: 'Sample Person',
  date: '2030-05-15',
  time: '10:00',
  durationMinutes: 30,
  status: 'pending',
  ...overrides,
});

describe('appointment dates', () => {
  it('reads date and time as local wall-clock time', () => {
    const end = endOf(appointment({ time: '23:45', durationMinutes: 30 }));

    expect(toIsoDay(end)).toBe('2030-05-16');
    expect(end.getHours()).toBe(0);
    expect(end.getMinutes()).toBe(15);
  });

  it('keeps an appointment upcoming until it ends', () => {
    expect(isPast(appointment({ time: '11:45', durationMinutes: 30 }), now)).toBe(false);
    expect(isPast(appointment({ time: '11:00', durationMinutes: 30 }), now)).toBe(true);
  });

  it('counts whole days from today', () => {
    expect(dayOffsetFromToday('2030-05-15', now)).toBe(0);
    expect(dayOffsetFromToday('2030-05-16', now)).toBe(1);
    expect(dayOffsetFromToday('2030-05-14', now)).toBe(-1);
  });
});

describe('nextSlot', () => {
  it('proposes the next half hour', () => {
    expect(nextSlot(new Date(2030, 4, 15, 12, 10))).toEqual({ date: '2030-05-15', time: '12:30' });
    expect(nextSlot(new Date(2030, 4, 15, 12, 30))).toEqual({ date: '2030-05-15', time: '13:00' });
  });

  it('rolls over to the next day late at night', () => {
    expect(nextSlot(new Date(2030, 4, 15, 23, 40))).toEqual({ date: '2030-05-16', time: '00:00' });
  });
});

describe('groupByDay', () => {
  const all = [
    appointment({ _id: 'late', date: '2030-05-17', time: '09:00' }),
    appointment({ _id: 'today-pm', time: '16:00' }),
    appointment({ _id: 'old', date: '2030-05-10' }),
    appointment({ _id: 'today-am', time: '08:00' }),
    appointment({ _id: 'today-evening', time: '18:00' }),
  ];

  it('lists upcoming days forward, each in time order', () => {
    const groups = groupByDay(all, 'upcoming', now);

    expect(groups.map((group) => group.date)).toEqual(['2030-05-15', '2030-05-17']);
    expect(groups[0].appointments.map((a) => a._id)).toEqual(['today-pm', 'today-evening']);
  });

  it('lists past days backward, most recent first', () => {
    const groups = groupByDay(all, 'past', now);

    expect(groups.map((group) => group.appointments.map((a) => a._id))).toEqual([['today-am'], ['old']]);
  });
});

describe('buildCalendarLink', () => {
  it('builds a link with local start and end and the details', () => {
    const link = new URL(
      buildCalendarLink(appointment({ time: '09:30', durationMinutes: 45, reason: 'Follow-up' }), 'Meeting')
    );

    expect(link.protocol).toBe('https:');
    expect(link.searchParams.get('text')).toBe('Meeting');
    expect(link.searchParams.get('dates')).toBe('20300515T093000/20300515T101500');
    expect(link.searchParams.get('details')).toBe('Follow-up');
  });
});
