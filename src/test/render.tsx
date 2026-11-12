import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider, type Locale } from '@/i18n';

// Renders with the app's language provider, as every component expects.
export function renderWithLocale(ui: ReactElement, locale: Locale = 'en') {
  return render(<LocaleProvider locale={locale}>{ui}</LocaleProvider>);
}
