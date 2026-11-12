import type { CommonTranslations } from './es';

export const commonEn: CommonTranslations = {
  loading: 'Loading…',
  error: {
    title: 'The information could not be loaded',
    description: 'Check your connection and try again. If the problem continues, tell whoever manages the application.',
    retry: 'Try again',
  },
  sessionExpired: {
    title: 'The session ended',
    description: 'For security, the application session closes after a while. Open it again to continue.',
    retry: 'Retry',
  },
  noContext: {
    title: 'Open this application from the platform',
    description: 'There is no active session here. Open it from the applications menu or from a conversation.',
  },
  empty: {
    title: 'No results',
    description: 'No items found.',
  },
  demo: {
    note: 'Sample data. Nothing you do here is saved.',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
  },
};
