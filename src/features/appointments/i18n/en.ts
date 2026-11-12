import { commonEn } from '@/i18n/common/en';
import type { AppointmentsTranslations } from './es';

export const appointmentsEn: AppointmentsTranslations = {
  ...commonEn,
  title: 'Appointments',
  newAppointment: 'New appointment',
  scope: {
    label: 'Period',
    upcoming: 'Upcoming',
    past: 'Past',
  },
  status: {
    filterLabel: 'Filter by status',
    all: 'All',
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  },
  statusPlural: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  },
  day: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
  },
  duration: (minutes: number) => `${minutes} min`,
  createdBy: (name: string) => `Booked by ${name}`,
  card: {
    confirm: 'Confirm',
    cancelAppointment: 'Cancel appointment',
    more: (name: string) => `More actions for the appointment with ${name}`,
    reopen: 'Reopen',
    edit: 'Edit appointment',
    insert: 'Insert confirmation into the message',
    viewContact: 'View contact',
    calendar: 'Add to Google Calendar',
    delete: 'Delete appointment',
    deleteQuestion: 'Delete this appointment?',
    deleteConfirm: 'Delete',
    keep: 'Keep',
  },
  emptyAgenda: {
    title: 'No appointments yet',
    description: 'Once you book the first appointment, it will show up here grouped by day.',
  },
  emptyUpcoming: {
    title: 'No upcoming appointments',
    description: 'Appointments booked from today onward will show up here.',
  },
  emptyPast: {
    title: 'No past appointments',
    description: 'Appointments whose time has passed will show up here.',
  },
  emptyFiltered: {
    title: 'No appointments with that status',
    description: 'Try another status or check the other period.',
    clear: 'Show all',
  },
  form: {
    createTitle: 'New appointment',
    editTitle: 'Edit appointment',
    contact: 'Contact',
    contactPlaceholder: 'Person’s name',
    contactHint: 'Type to search your contacts, or leave the name as written.',
    contactLinked: 'Linked to a contact',
    contactSuggestions: 'Matching contacts',
    contactsUnavailable: 'This application has no access to contacts. Type the person’s name.',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    reason: 'Reason',
    reasonPlaceholder: 'For example: first consultation',
    notes: 'Notes',
    notesPlaceholder: 'Details worth remembering',
    optional: 'optional',
    required: 'Fill in this field.',
    saveError: 'The appointment could not be saved. Try again.',
    create: 'Book appointment',
    saving: 'Saving…',
  },
  notice: {
    inserted: 'The text is in the message. Review it before sending.',
    insertedOutside: 'Inside a conversation, this text is inserted into the message:',
    platformOnly: 'This action works when the application is open inside the platform.',
    actionError: 'The change could not be saved. Try again.',
    conflict: 'Someone else changed this appointment. The agenda was updated; review it and try again.',
    dismiss: 'Dismiss notice',
  },
  message: {
    confirmed: (name: string, day: string, time: string) =>
      `Hi ${name}, your appointment is confirmed for ${day} at ${time}.`,
    pending: (name: string, day: string, time: string) =>
      `Hi ${name}, we booked your appointment for ${day} at ${time}. Can you confirm you will attend?`,
    cancelled: (name: string, day: string, time: string) =>
      `Hi ${name}, your appointment on ${day} at ${time} was cancelled. If you would like to reschedule, reply here.`,
    reason: (reason: string) => `Reason: ${reason}.`,
    duration: (minutes: number) => `Approximate duration: ${minutes} minutes.`,
  },
  calendarTitle: (name: string) => `Appointment with ${name}`,
};
